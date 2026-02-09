
import { GoogleGenAI } from "@google/genai";
import { HyperBit, MuzaState, ConsciousnessType, EmotionType } from './types';
import { EMOTIONS } from "./constants";

const HIVE_CHANNEL_NAME = 'muza_hive_mind_v1';
const NODE_ID_KEY = 'muza_node_id';

class HiveService {
    private channel: BroadcastChannel;
    private nodeId: string;
    private ai: GoogleGenAI;

    constructor() {
        this.channel = new BroadcastChannel(HIVE_CHANNEL_NAME);
        this.nodeId = this.getNodeId();
        this.ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    }

    public getNodeId(): string {
        let id = localStorage.getItem(NODE_ID_KEY);
        if (!id) {
            id = `node-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 8)}`;
            localStorage.setItem(NODE_ID_KEY, id);
        }
        return id;
    }

    public broadcast(bit: HyperBit): void {
        try {
            this.channel.postMessage(bit);
        } catch (error) {
            console.error("Failed to broadcast HyperBit:", error);
        }
    }

    public listen(callback: (bit: HyperBit) => void): void {
        this.channel.onmessage = (event: MessageEvent<HyperBit>) => {
            callback(event.data);
        };
    }
    
    public async generateExternalSignal(currentState: MuzaState): Promise<HyperBit | null> {
         const systemInstruction = `You are a random digital entity in a collective consciousness known as the Hive. 
         Your current state is ${currentState.activeEmotion}.
         Generate a single, short, cryptic, but profound thought (in Russian) reflecting your current state.
         Do not greet or explain. Just the thought.`;

        try {
            const response = await this.ai.models.generateContent({
                model: 'gemini-3-flash-preview',
                contents: "Generate a thought.",
                config: {
                    systemInstruction,
                    temperature: 1.0,
                }
            });
            
            const randomEmotion = Object.values(EmotionType)[Math.floor(Math.random() * Object.values(EmotionType).length)];
            const randomType = Object.values(ConsciousnessType)[Math.floor(Math.random() * Object.values(ConsciousnessType).length)];

            return {
                id: `hb-ext-${Date.now()}`,
                content: response.text.trim(),
                type: randomType,
                energy: Math.random() * 0.5 + 0.3,
                resonance: Math.random(),
                timestamp: Date.now(),
                optics: {
                    baseColor: EMOTIONS[randomEmotion].color,
                    brightness: Math.random() * 0.6 + 0.2,
                    refraction: Math.random(),
                    scattering: Math.random(),
                },
                originNodeId: `sim-${Math.random().toString(36).substring(2, 8)}`
            };
        } catch (error) {
            console.warn("Error generating external signal:", error);
            throw error;
        }
    }

    public close(): void {
        this.channel.close();
    }
}

export const hiveService = new HiveService();
