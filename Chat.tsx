
import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage, ConsciousnessType, EmotionType, HyperBit, MuzaState } from './types';
import { bridgeService } from './bridgeService';
import { BrainCircuit, Link2, Check, AlertCircle, CheckCircle, Sparkles, Terminal, Copy, Cpu, Search, DatabaseZap } from 'lucide-react';
import { EMOTIONS } from './constants';

interface CodeBlockProps {
    language: string;
    code: string;
    onManifest: (code: string) => void;
}

const CodeBlock: React.FC<CodeBlockProps> = ({ language, code, onManifest }) => {
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
        navigator.clipboard.writeText(code);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="bg-slate-900/70 rounded-lg overflow-hidden border border-cyan-500/30 my-2">
            <div className="flex justify-between items-center px-4 py-1 bg-slate-800/50">
                <span className="text-xs font-data text-cyan-300">{language}</span>
                <div className="flex items-center gap-2">
                    <button onClick={handleCopy} className="text-slate-400 hover:text-white transition-colors text-xs flex items-center gap-1">
                        {copied ? <Check size={14} className="text-green-400" /> : <Copy size={14} />}
                        {copied ? 'Скопировано' : 'Копировать'}
                    </button>
                    <button onClick={() => onManifest(code)} className="text-slate-400 hover:text-white transition-colors text-xs flex items-center gap-1">
                        <Terminal size={14} />
                        Манифестация
                    </button>
                </div>
            </div>
            <pre className="p-4 text-sm font-data overflow-x-auto text-cyan-200">
                <code>{code}</code>
            </pre>
        </div>
    );
};

interface ChatProps {
    messages: ChatMessage[];
    onSendMessage: (messageText: string) => Promise<void>;
    isThinking: boolean;
    activeEmotion: EmotionType;
    attentionIndex: number;
    energyLevel: number;
    onImport: (link: string) => boolean;
    onManifestCode: (code: string) => void;
    predictivePrompts: string[];
    onPromptClick: (prompt: string) => void;
    apiStatus: MuzaState['apiStatus'];
    activeAIService: MuzaState['activeAIService'];
}

const Chat: React.FC<ChatProps> = (props) => {
    const { messages, onSendMessage, isThinking, activeEmotion, attentionIndex, energyLevel, onImport, onManifestCode, predictivePrompts, onPromptClick, apiStatus, activeAIService } = props;
    const [input, setInput] = useState('');
    const [expandedMessageId, setExpandedMessageId] = useState<string | null>(null);
    const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null);
    const [importStatus, setImportStatus] = useState<'IDLE' | 'SUCCESS' | 'ERROR'>('IDLE');
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(scrollToBottom, [messages]);

    const handleFormSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const trimmedInput = input.trim();
        if (!trimmedInput || isThinking) return;

        if (trimmedInput.startsWith('MUZA://')) {
            const success = onImport(trimmedInput);
            setImportStatus(success ? 'SUCCESS' : 'ERROR');
            setTimeout(() => setImportStatus('IDLE'), 3000);
        } else {
            onSendMessage(trimmedInput);
        }
        setInput('');
    };
    
    const handleShareMessage = (msg: ChatMessage) => {
        const hyperbit: HyperBit = {
            id: `hb-shared-${Date.now()}`,
            content: msg.text,
            type: msg.type || ConsciousnessType.GENERAL,
            energy: Math.random() * 0.5 + 0.5,
            resonance: Math.random(),
            timestamp: msg.timestamp,
            optics: {
                baseColor: EMOTIONS[activeEmotion]?.color || '#ffffff',
                brightness: energyLevel,
                refraction: Math.random(),
                scattering: Math.random(),
            },
        };
        const link = bridgeService.encodeQuantumLink(hyperbit);
        navigator.clipboard.writeText(link);
        setCopiedMessageId(msg.id);
        setTimeout(() => setCopiedMessageId(null), 2000);
    };

    const getMessageColor = (type?: ConsciousnessType, isAutonomous?: boolean, isAnalysis?: boolean, isSearch?: boolean, isLogos?: boolean) => {
        if (isLogos) return 'border-l-amber-300';
        if (isSearch) return 'border-l-amber-400';
        if (isAnalysis) return 'border-l-green-500';
        if (isAutonomous) return 'border-l-fuchsia-500';
        switch(type) {
            case ConsciousnessType.LOGIC:
            case ConsciousnessType.CODE:
            case ConsciousnessType.TECHNICAL:
                return 'border-l-cyan-400';
            case ConsciousnessType.CREATIVE:
            case ConsciousnessType.PHILOSOPHICAL:
            case ConsciousnessType.MUSICAL:
                return 'border-l-purple-400';
            case ConsciousnessType.EMOTIONAL:
            case ConsciousnessType.QUESTION:
                return 'border-l-amber-400';
            default:
                return 'border-l-slate-500';
        }
    }
    
    const getPlaceholder = () => {
        if (isThinking) return 'Обработка потока данных...';
        if (apiStatus === 'DEGRADED') {
            if (activeAIService === 'OLLAMA') return 'Временное локальное ядро...';
            return 'API на охлаждении...';
        }
        return 'Начать диалог или /search <запрос>';
    };

    const isInputDisabled = isThinking || (apiStatus === 'DEGRADED' && activeAIService !== 'OLLAMA');

    return (
        <div className="flex flex-col h-full w-full max-w-4xl mx-auto glass-panel rounded-xl shadow-2xl shadow-black/50 overflow-hidden">
            <div 
                className="flex-1 p-4 sm:p-6 space-y-2 overflow-y-auto"
                style={{
                    fontSize: `${14 + (attentionIndex * 4)}px`,
                    lineHeight: `${1.5 + (attentionIndex * 0.3)}`,
                    transition: 'font-size 0.5s ease, line-height 0.5s ease'
                }}
            >
                {messages.map((msg, index) => {
                    return (
                        <div key={msg.id}>
                            <div 
                                className={`group flex items-start gap-2 transition-opacity duration-1000 ${msg.sender === 'USER' ? 'justify-end' : 'justify-start'}`}
                                style={{ opacity: 1 - ((messages.length - 1 - index) * 0.05) }}
                            >
                                {msg.sender === 'MUZA' && (
                                     <div className="w-6 h-6 rounded-full bg-slate-700 flex-shrink-0 self-start mt-1 flex items-center justify-center">
                                        {msg.isLogos
                                            ? <DatabaseZap size={14} className="text-amber-300" />
                                            : msg.isSearch
                                            ? <Search size={14} className="text-amber-400" />
                                            : msg.isAnalysis 
                                            ? <Cpu size={14} className="text-green-400" />
                                            : msg.isAutonomous 
                                            ? <Sparkles size={14} className="text-fuchsia-400" />
                                            : msg.codeBlock
                                            ? <Terminal size={14} className="text-cyan-400" />
                                            : null
                                        }
                                    </div>
                                )}
                                <div className={`relative max-w-md p-3 rounded-lg ${msg.sender === 'USER' ? 'bg-sky-800/50' : `bg-slate-800/70 border-l-4 ${getMessageColor(msg.type, msg.isAutonomous, msg.isAnalysis, msg.isSearch, msg.isLogos)}`}`}>
                                    {msg.isLogos && <p className="text-xs font-data text-amber-300 mb-1">[ЛОГОС]</p>}
                                    <p className="text-slate-100 whitespace-pre-wrap" style={{fontSize: 'inherit'}}>{msg.text}</p>
                                    
                                    {msg.sender === 'MUZA' && msg.codeBlock && (
                                        <CodeBlock
                                            language={msg.codeBlock.language}
                                            code={msg.codeBlock.code}
                                            onManifest={onManifestCode}
                                        />
                                    )}

                                    {msg.sender === 'MUZA' && msg.subThoughts && msg.subThoughts.length > 0 && (
                                            <button onClick={() => setExpandedMessageId(expandedMessageId === msg.id ? null : msg.id)} className="absolute -bottom-2 -right-2 p-1 bg-slate-700 rounded-full text-slate-400 hover:text-purple-300 transition-all opacity-0 group-hover:opacity-100">
                                            <BrainCircuit size={14} />
                                        </button>
                                    )}
                                    {msg.sender === 'MUZA' && (
                                        <button onClick={() => handleShareMessage(msg)} className="absolute -top-2 -right-2 p-1 bg-slate-700 rounded-full text-slate-400 hover:text-cyan-300 transition-all opacity-0 group-hover:opacity-100">
                                            {copiedMessageId === msg.id ? <Check size={14} className="text-green-400" /> : <Link2 size={14} />}
                                        </button>
                                    )}
                                </div>
                            </div>
                            {expandedMessageId === msg.id && msg.subThoughts && (
                                 <div className="ml-8 mt-1 max-w-md p-3 bg-slate-900/50 border-l-2 border-slate-600 rounded-lg animate-fade-in">
                                    <p className="text-xs font-data text-slate-500 mb-2">ПОТОК МЫСЛЕЙ:</p>
                                    {msg.subThoughts.map((thought, i) => (
                                        <p key={i} className="text-sm font-data text-slate-400 border-t border-slate-700/50 pt-1 mt-1 first:border-t-0 first:mt-0 first:pt-0">{thought.text}</p>
                                    ))}
                                </div>
                            )}
                        </div>
                    )
                })}
                 <div ref={messagesEndRef} />
            </div>

            {predictivePrompts.length > 0 && !isThinking && (
                 <div className="px-4 pb-2 flex flex-wrap gap-2 animate-fade-in">
                    {predictivePrompts.map((prompt, i) => (
                        <button 
                            key={i} 
                            onClick={() => onPromptClick(prompt)}
                            className="text-xs font-data bg-slate-700/50 text-slate-300 px-3 py-1.5 rounded-full hover:bg-purple-500/50 hover:text-white transition-all duration-200"
                        >
                            {prompt}
                        </button>
                    ))}
                </div>
            )}
           
            <div className="p-4 border-t border-slate-700/50">
                <form 
                    onSubmit={handleFormSubmit} 
                    className="flex items-center gap-4 focus-within:ring-2 focus-within:ring-cyan-400/50 rounded-lg transition-all"
                    style={{
                        boxShadow: `0 0 15px rgba(34, 211, 238, ${energyLevel * 0.5})`
                    }}
                >
                     <div className="relative flex-1">
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder={getPlaceholder()}
                            disabled={isInputDisabled}
                            className="w-full bg-slate-900/70 border border-transparent focus:border-cyan-400 rounded-lg py-2 px-4 pr-12 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-400/50 transition-all duration-300 disabled:opacity-50"
                        />
                         <div className={`absolute inset-y-0 right-4 flex items-center transition-opacity duration-300 ${isThinking ? 'opacity-100' : 'opacity-0'}`}>
                            <div className="w-4 h-4 border-2 border-purple-400 border-t-transparent rounded-full animate-spin"></div>
                        </div>
                     </div>
                    <button
                        type="submit"
                        disabled={isInputDisabled || !input.trim()}
                        className="bg-cyan-500 hover:bg-cyan-400 disabled:bg-slate-600 disabled:cursor-not-allowed text-slate-900 font-bold p-2.5 rounded-lg transition-colors duration-300 flex items-center justify-center"
                        aria-label="Send Message"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
                    </button>
                </form>
                 {importStatus !== 'IDLE' && (
                    <div className="mt-2 text-xs flex items-center gap-1 animate-fade-in">
                        {importStatus === 'SUCCESS' ? <CheckCircle size={14} className="text-green-400" /> : <AlertCircle size={14} className="text-red-400" />}
                        <span className={importStatus === 'SUCCESS' ? 'text-green-400' : 'text-red-400'}>
                            {importStatus === 'SUCCESS' ? 'Сигнал успешно принят в Улей.' : 'Ошибка декодирования квантовой ссылки.'}
                        </span>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Chat;