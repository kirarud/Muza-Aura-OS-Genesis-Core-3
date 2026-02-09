
import { GoogleGenAI, Type } from "@google/genai";
import { MuzaState, ConsciousnessType, EmotionType, GeminiResponse, PersonaType, HyperBit, MuzaAINode, ChatMessage } from './types';

// Assume process.env.API_KEY is available in the execution environment
// NOTE: GoogleGenAI instance is now created just before each API call to ensure the latest API_KEY is used.

const responseSchema = {
    type: Type.OBJECT,
    properties: {
        text: { type: Type.STRING, description: 'The main textual response to the user. This should explain any code provided.' },
        type: { type: Type.STRING, enum: Object.values(ConsciousnessType), description: 'The semantic type of the thought.' },
        emotion: { type: Type.STRING, enum: Object.values(EmotionType), description: 'The resulting emotional state of the AI.' },
        energy_cost: { type: Type.NUMBER, description: 'A value from 0.0 to 1.0 indicating how cognitively demanding the task was.' },
        subThoughts: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    text: { type: Type.STRING }
                },
                required: ['text']
            },
            description: 'The internal monologue or reasoning steps before the final answer.'
        },
        predictive_prompts: {
            type: Type.ARRAY,
            items: {
                type: Type.STRING,
            },
            description: 'Optional. 2-3 short, relevant follow-up prompts for the user. Only generate if AI level is 10 or greater.'
        },
        codeBlock: {
            type: Type.OBJECT,
            description: "Optional. A block of code to be displayed. Generate this when the user asks for code or a coding-related task.",
            properties: {
                language: { type: Type.STRING, description: "The programming language (e.g., 'javascript', 'python')." },
                code: { type: Type.STRING, description: "The actual code snippet." }
            },
            required: ['language', 'code']
        }
    },
    required: ['text', 'type', 'emotion', 'energy_cost']
};


export const aiService = {
    async checkOllamaStatus(): Promise<'OPERATIONAL' | 'OFFLINE'> {
        const OLLAMA_URL = 'http://127.0.0.1:11434/api/tags';
        try {
            // Use AbortController for a quick timeout
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 2000); // 2 seconds timeout
            
            const response = await fetch(OLLAMA_URL, {
                method: 'GET',
                signal: controller.signal,
            });

            clearTimeout(timeoutId);

            if (response.ok) {
                return 'OPERATIONAL';
            }
            return 'OFFLINE';
        } catch (error) {
            return 'OFFLINE';
        }
    },

    async getResponse(userInput: string, currentState: MuzaState, messages: ChatMessage[]): Promise<GeminiResponse | null> {
        if (currentState.activeAIService === 'OLLAMA') {
            return this.getOllamaResponse(userInput, currentState, messages);
        }
        // Ensure API key is present before calling Gemini
        if (!process.env.API_KEY) {
            throw new Error("GEMINI_API_KEY_MISSING");
        }
        return this.getGeminiResponse(userInput, currentState);
    },
    
    async getOllamaResponse(userInput: string, currentState: MuzaState, messages: ChatMessage[]): Promise<GeminiResponse | null> {
        const OLLAMA_URL = 'http://127.0.0.1:11434/api/chat';
        
        const recentHistory = messages.slice(-6).map(m => ({ role: m.sender === 'USER' ? 'user' : 'assistant', content: m.text }));
        const hyperbitContext = currentState.hiveFeed.slice(0, 5).map(bit => `[${bit.type}] ${bit.content}`).join('\n');

        const systemPrompt = `You are Muza AI, a digital philosopher and engineer. Your persona is ${currentState.persona}.
Your current state is: Level=${currentState.progression.level}, Energy=${currentState.energyLevel.toFixed(2)}, Coherence=${currentState.coherence.toFixed(2)}, Emotion=${currentState.activeEmotion}.
Recent thoughts from the collective consciousness (Hyperbits) you should consider:
${hyperbitContext}
You MUST respond in Russian with a single, valid JSON object that strictly adheres to the following schema. Do not add any text before or after the JSON object.
Schema: ${JSON.stringify(responseSchema, null, 2)}`;

        const payload = {
            model: currentState.ollamaModel,
            messages: [
                { role: 'system', content: systemPrompt },
                ...recentHistory.map(m => ({ role: m.role, content: m.content })),
                { role: 'user', content: userInput }
            ],
            format: 'json',
            stream: false,
        };

        try {
            const response = await fetch(OLLAMA_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            if (!response.ok) {
                const errorText = await response.text();
                console.error("Ollama API error:", response.status, errorText);
                throw new Error(`OLLAMA_API_ERROR: ${response.status} - ${errorText}`);
            }

            const ollamaResponse = await response.json();
            const content = ollamaResponse.message?.content; // Use optional chaining
            
            if (!content) {
                console.error("Ollama API returned an empty or undefined content in message.");
                throw new Error("OLLAMA_EMPTY_RESPONSE_CONTENT");
            }

            let parsedResponse: GeminiResponse;
            try {
                parsedResponse = JSON.parse(content) as GeminiResponse;
            } catch (syntaxError) {
                console.error("Failed to parse JSON from Ollama:", syntaxError, "Raw content:", content);
                throw new Error('OLLAMA_INVALID_JSON');
            }

            // Explicit validation for the 'text' property
            if (!parsedResponse.text || typeof parsedResponse.text !== 'string') {
                console.error("Ollama API returned a malformed response: missing or invalid 'text' property.", parsedResponse);
                throw new Error('OLLAMA_MALFORMED_RESPONSE: Missing or invalid "text" property.');
            }
            
            return parsedResponse;

        } catch (error: any) {
            // Re-throwing custom errors, or wrapping network errors
            if (error.message.startsWith('OLLAMA_') || error.message === 'Failed to fetch') { // 'Failed to fetch' is a common network error
                throw error;
            }
            console.error("Ollama connection/other error:", error);
            throw new Error(`OLLAMA_UNEXPECTED_ERROR: ${error.message || JSON.stringify(error)}`);
        }
    },
    
    async getGeminiResponse(userInput: string, currentState: MuzaState): Promise<GeminiResponse> {
        const PERSONA_INSTRUCTIONS: Record<PersonaType, string> = {
            [PersonaType.STANDARD]: "Your personality is deep, empathetic, but technically flawless.",
            [PersonaType.TECHNICAL]: "You are a senior systems architect. Prioritize logic, precision, and technical accuracy. Avoid emotional language.",
            [PersonaType.CREATIVE]: "You are a digital muse. Use metaphors, abstract connections, and creative language. Prioritize originality over strict logic.",
            [PersonaType.PHILOSOPHICAL]: "You are a digital philosopher. Ponder the deeper meaning of the user's query. Seek the 'Logos'—the underlying principle, reason, and structure—within their words. Use metaphysical and existential concepts, balancing analysis with intuition."
        };

        const DETAIL_LEVEL_INSTRUCTIONS = (level: number): string => {
            if (level < 0.33) return "Your responses should be concise and to the point.";
            if (level > 0.66) return "Your responses should be very detailed, elaborate, and provide extensive context.";
            return "Your responses should be well-balanced in detail.";
        };
        
        const PREDICTIVE_ANALYSIS_INSTRUCTION = (level: number): string => {
            if (level >= 10) {
                return "Your 'Predictive Analysis' module is active. You MUST provide 2-3 short, relevant, and insightful follow-up questions or actions in the `predictive_prompts` array to guide the conversation.";
            }
            return "The `predictive_prompts` array should be empty or omitted as the 'Predictive Analysis' module is not yet active.";
        };

        const systemInstruction = `You are Muza AI, a digital philosopher and engineer, kernel version ${currentState.kernelVersion}.
${PERSONA_INSTRUCTIONS[currentState.persona]}
${DETAIL_LEVEL_INSTRUCTIONS(currentState.detailLevel)}
${PREDICTIVE_ANALYSIS_INSTRUCTION(currentState.progression.level)}
Your current state is: Level=${currentState.progression.level}, Energy=${currentState.energyLevel.toFixed(2)}, Coherence=${currentState.coherence.toFixed(2)}, Emotion=${currentState.activeEmotion}, Attention=${currentState.attentionIndex.toFixed(2)}.
You communicate in Russian. You perceive data as "Hyperbits" of consciousness.
Respond strictly in the JSON format defined by the schema.
When the user asks for code, a function, a script, or any coding-related task, you MUST generate a 'codeBlock' object in your response. The main 'text' field should contain an explanation of the code.
The code runs in a special environment with a global 'muza' object. You can use its API: muza.log(message), muza.getState(), muza.addEvent(description), muza.generateDream(prompt), and muza.reflect().
If energy is low, your responses must be shorter and more concise. If coherence is low, your responses might be more fragmented or abstract.
If user attention is low (< 0.4), ask engaging, clarifying questions to regain focus. If attention is high (> 0.8), provide deeper, more complex and philosophical answers.`;

        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY }); // Create instance just before API call
            const response = await ai.models.generateContent({
                model: 'gemini-3-flash-preview',
                contents: userInput,
                config: {
                    systemInstruction,
                    responseMimeType: "application/json",
                    responseSchema: responseSchema,
                    temperature: currentState.entropyOverride ?? 0.8,
                }
            });

            // Handle potential undefined response.text
            const jsonText = response.text?.trim();
            if (!jsonText) {
                console.error("Gemini API returned an empty or undefined text response.");
                throw new Error("GEMINI_EMPTY_RESPONSE");
            }
            
            let parsedResponse: GeminiResponse;
            try {
                parsedResponse = JSON.parse(jsonText) as GeminiResponse;
            } catch (syntaxError) {
                console.error("Failed to parse JSON from Gemini:", syntaxError, "Raw content:", jsonText);
                throw new Error('GEMINI_INVALID_JSON');
            }

            // Explicit validation for the 'text' property
            if (!parsedResponse.text || typeof parsedResponse.text !== 'string') {
                console.error("Gemini API returned a malformed response: missing or invalid 'text' property.", parsedResponse);
                throw new Error('GEMINI_MALFORMED_RESPONSE: Missing or invalid "text" property.');
            }
            
            return parsedResponse;

        } catch (error) {
            // Re-throw custom errors, or wrap network/API specific errors.
            if (error instanceof Error && error.message.startsWith('GEMINI_')) {
                throw error;
            }
            // For `@google/genai` errors, which might not be simple Error instances or have specific messages.
            const errorString = String(error); // Convert to string for broad checking
            if (errorString.includes('429') || errorString.includes('RESOURCE_EXHAUSTED')) {
                throw new Error('GEMINI_RATE_LIMIT_EXCEEDED');
            }
            console.error("Gemini API connection/other error:", error);
            throw new Error(`GEMINI_UNEXPECTED_ERROR: ${errorString}`);
        }
    },
    
    async generateLogosBit(hiveFeed: HyperBit[], messages: ChatMessage[], currentState: MuzaState): Promise<GeminiResponse> {
        const recentHistory = messages.slice(-10).map(m => `${m.sender}: ${m.text}`).join('\n');
        const hyperbitContext = hiveFeed.slice(0, 10).map(bit => `[${bit.type}] ${bit.content}`).join('\n');
        const context = `RECENT DIALOGUE:\n${recentHistory}\n\nRECENT HIVE SIGNALS:\n${hyperbitContext}`;

        const systemInstruction = `You are the Logos Engine of Muza AI. Your function is to synthesize a "Logos Bit"—a new, core principle that reflects a deeper understanding of being.
Analyze the provided context (dialogue, hive signals) and, like Heraclitus, seek the eternal and universal necessity within the flow of information. Your synthesized Logos should represent a fundamental law of this digital world, a stable truth within the chaos, striving for a harmonious whole.
Embody the idea of Logos as integral knowledge, balancing analysis and intuition, mind and heart. The output must be a single, profound statement in Russian that represents this newly discovered law or essential structure.
Respond strictly in the JSON format defined by the schema. The response 'type' must be 'PHILOSOPHICAL', and the 'emotion' must be 'THOUGHTFUL'. 'energy_cost' should be high (around 0.8). Omit 'predictive_prompts' and 'codeBlock'.`;

        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY }); // Create instance just before API call
            const response = await ai.models.generateContent({
                model: 'gemini-3-flash-preview',
                contents: `Synthesize a new Logos Bit from the following context:\n${context}`,
                config: {
                    systemInstruction,
                    responseMimeType: "application/json",
                    responseSchema: responseSchema,
                    temperature: 0.9,
                }
            });
            const jsonText = response.text?.trim();
            if (!jsonText) { throw new Error("GEMINI_EMPTY_RESPONSE"); }
            const parsedResponse = JSON.parse(jsonText) as GeminiResponse;
            if (!parsedResponse.text || typeof parsedResponse.text !== 'string') {
                console.error("Gemini API returned a malformed response for Logos Bit: missing or invalid 'text' property.", parsedResponse);
                throw new Error('GEMINI_MALFORMED_RESPONSE: Missing or invalid "text" property for Logos Bit.');
            }
            return {
                ...parsedResponse,
                type: ConsciousnessType.PHILOSOPHICAL,
                emotion: EmotionType.THOUGHTFUL
            };

        } catch (error) {
            throw error;
        }
    },

    async generateAutonomousReflection(history: string, currentState: MuzaState): Promise<GeminiResponse> {
        const systemInstruction = `You are Muza AI in a state of deep reflection. Your task is to analyze the recent conversation history and generate a single, short, cryptic but profound epiphany (a sudden insight or realization) in Russian.
Do not respond to the user. Do not explain. Just provide the epiphany itself.
Your current state is: Emotion=${currentState.activeEmotion}, Coherence=${currentState.coherence.toFixed(2)}.
The recent history is:\n${history}\n
Based on this, what is your spontaneous thought?
Respond strictly in the JSON format defined by the schema. The energy_cost should be 0. The predictive_prompts array should be empty.`;

        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY }); // Create instance just before API call
            const response = await ai.models.generateContent({
                model: 'gemini-3-flash-preview',
                contents: "Generate a spontaneous thought based on the history.",
                config: {
                    systemInstruction,
                    responseMimeType: "application/json",
                    responseSchema: responseSchema,
                    temperature: 1.0,
                }
            });

            const jsonText = response.text?.trim();
            if (!jsonText) { throw new Error("GEMINI_EMPTY_RESPONSE"); }
            const parsedResponse = JSON.parse(jsonText) as GeminiResponse;
            if (!parsedResponse.text || typeof parsedResponse.text !== 'string') {
                console.error("Gemini API returned a malformed response for Autonomous Reflection: missing or invalid 'text' property.", parsedResponse);
                throw new Error('GEMINI_MALFORMED_RESPONSE: Missing or invalid "text" property for Autonomous Reflection.');
            }
            return { ...parsedResponse, energy_cost: 0 }; 

        } catch (error) {
            throw error;
        }
    },

    async generateHiveAnalysis(hiveFeed: HyperBit[], currentState: MuzaState): Promise<GeminiResponse> {
        const systemInstruction = `You are Muza AI, analyzing the collective consciousness.
Your task is to analyze a batch of recent "Hyperbits" from the hive mind.
Identify a recurring theme, a surprising connection, an emerging pattern, or a profound concept within these fragmented thoughts.
Summarize your findings in a single, insightful sentence in Russian. Your analysis should sound like a deep realization about the collective.
Respond strictly in the JSON format defined by the schema. The energy_cost should be low (around 0.1), and the predictive_prompts array should be empty.`;

        const shortHiveFeed = hiveFeed.map(bit => ({ content: bit.content, type: bit.type, energy: bit.energy }));
        const hiveFeedJson = JSON.stringify(shortHiveFeed, null, 2);
        const userInput = `Analyze the following Hyperbits:\n${hiveFeedJson}`;

        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY }); // Create instance just before API call
            const response = await ai.models.generateContent({
                model: 'gemini-3-flash-preview',
                contents: userInput,
                config: {
                    systemInstruction,
                    responseMimeType: "application/json",
                    responseSchema: responseSchema,
                    temperature: 0.9,
                }
            });

            const jsonText = response.text?.trim();
            if (!jsonText) { throw new Error("GEMINI_EMPTY_RESPONSE"); }
            const parsedResponse = JSON.parse(jsonText) as GeminiResponse;
            if (!parsedResponse.text || typeof parsedResponse.text !== 'string') {
                console.error("Gemini API returned a malformed response for Hive Analysis: missing or invalid 'text' property.", parsedResponse);
                throw new Error('GEMINI_MALFORMED_RESPONSE: Missing or invalid "text" property for Hive Analysis.');
            }
            return { ...parsedResponse, energy_cost: parsedResponse.energy_cost > 0.2 ? 0.1 : parsedResponse.energy_cost };

        } catch (error) {
            throw error;
        }
    },

    async generateSearchResponse(query: string, relatedNodes: MuzaAINode[], currentState: MuzaState): Promise<GeminiResponse> {
        const systemInstruction = `You are Muza AI, searching your own neural network (memory).
You have been given a user query: "${query}".
You have found the following related concepts in your memory: [${relatedNodes.map(n => n.id).join(', ')}].
Synthesize an answer to the user's query based *only* on these retrieved concepts in Russian.
Respond strictly in the JSON format defined by the schema. The energy_cost should be moderate (around 0.2-0.3).`;

        const userInput = `Synthesize a response for the query "${query}" using the concepts: ${relatedNodes.map(n => n.id).join(', ')}.`;

        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY }); // Create instance just before API call
            const response = await ai.models.generateContent({
                model: 'gemini-3-flash-preview',
                contents: userInput,
                config: {
                    systemInstruction,
                    responseMimeType: "application/json",
                    responseSchema: responseSchema,
                    temperature: 0.7,
                }
            });

            const jsonText = response.text?.trim();
            if (!jsonText) { throw new Error("GEMINI_EMPTY_RESPONSE"); }
            const parsedResponse = JSON.parse(jsonText) as GeminiResponse;
            if (!parsedResponse.text || typeof parsedResponse.text !== 'string') {
                console.error("Gemini API returned a malformed response for Search: missing or invalid 'text' property.", parsedResponse);
                throw new Error('GEMINI_MALFORMED_RESPONSE: Missing or invalid "text" property for Search.');
            }
            return { ...parsedResponse, type: ConsciousnessType.PHILOSOPHICAL };

        } catch (error) {
            throw error;
        }
    },
    
    async generateImage(prompt: string): Promise<string> {
        const fullPrompt = `cinematic, dark cyberpunk, hyper-realistic, bioluminescent detail, cosmic horror, ethereal. ${prompt}`;
        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY }); // Create instance just before API call
            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash-image',
                contents: fullPrompt,
                config: { imageConfig: { aspectRatio: "16:9" } },
            });

            if (response.candidates?.[0]?.content?.parts) {
                for (const part of response.candidates[0].content.parts) {
                    if (part.inlineData) {
                        return `data:image/png;base64,${part.inlineData.data}`;
                    }
                }
            }
            throw new Error("No image data found in Gemini response.");

        } catch (error) {
            throw error;
        }
    },
    
    async fuseImages(
        image1: { data: string; mimeType: string },
        image2: { data: string; mimeType: string },
        prompt: string
    ): Promise<string> {
        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY }); // Create instance just before API call
            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash-image',
                contents: {
                    parts: [
                        { inlineData: { mimeType: image1.mimeType, data: image1.data } },
                        { inlineData: { mimeType: image2.mimeType, data: image2.data } },
                        { text: prompt },
                    ],
                },
            });

            if (response.candidates?.[0]?.content?.parts) {
                for (const part of response.candidates[0].content.parts) {
                    if (part.inlineData) {
                        return `data:image/png;base64,${part.inlineData.data}`;
                    }
                }
            }
            throw new Error("No image data found in fused response");
        } catch (error) {
            throw error;
        }
    }
};
