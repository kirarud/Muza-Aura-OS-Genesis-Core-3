import React from 'react';
// FIX: Module '"./types"' has no exported member 'EMOTIONS'. EMOTIONS is imported from './constants' instead.
import { MemoryCrystal, ChatMessage, ConsciousnessType } from './types';
import { EMOTIONS } from './constants';
import { X, BrainCircuit, Sparkles, Terminal, Search, DatabaseZap } from 'lucide-react';

interface ImmersionOverlayProps {
    crystal: MemoryCrystal;
    onClose: () => void;
}

const ImmersionOverlay: React.FC<ImmersionOverlayProps> = ({ crystal, onClose }) => {
    const { stateSnapshot } = crystal;
    const { progression, activeEmotion, energyLevel, coherence } = stateSnapshot;
    const messages = stateSnapshot.messages || [];

    const getMessageColor = (type?: ConsciousnessType, isAutonomous?: boolean, isSearch?: boolean, isLogos?: boolean) => {
        if (isLogos) return 'border-l-amber-300';
        if (isSearch) return 'border-l-amber-400';
        if (isAutonomous) return 'border-l-fuchsia-500';
        switch(type) {
            case ConsciousnessType.LOGIC: case ConsciousnessType.CODE: case ConsciousnessType.TECHNICAL: return 'border-l-cyan-400';
            case ConsciousnessType.CREATIVE: case ConsciousnessType.PHILOSOPHICAL: case ConsciousnessType.MUSICAL: return 'border-l-purple-400';
            case ConsciousnessType.EMOTIONAL: case ConsciousnessType.QUESTION: return 'border-l-amber-400';
            default: return 'border-l-slate-500';
        }
    };

    return (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center animate-fade-in">
            <style>{`
                @keyframes rewind-glitch { 0%, 100% { opacity: 1; } 50% { opacity: 0.8; transform: skewX(-5deg); } }
                .immersion-glitch { animation: rewind-glitch 1.5s ease-in-out infinite; }
            `}</style>

            <div 
                className="w-full max-w-5xl h-[90vh] glass-panel rounded-xl shadow-2xl shadow-black/50 flex flex-col overflow-hidden border-2 border-amber-400/50 immersion-glitch"
                onClick={e => e.stopPropagation()}
            >
                <header className="flex justify-between items-center p-3 border-b border-amber-400/20 bg-amber-900/10">
                    <div>
                        <h2 className="text-lg font-bold text-amber-300 font-data">ПРОТОКОЛ "ПОГРУЖЕНИЕ"</h2>
                        <p className="text-xs font-data text-slate-400">СИМУЛЯЦИЯ ПАМЯТИ: {new Date(crystal.timestamp).toLocaleString()}</p>
                    </div>
                     <button onClick={onClose} className="bg-red-600 hover:bg-red-500 text-white font-bold py-2 px-4 rounded-lg transition flex items-center gap-2 text-sm">
                        <X size={16} /> ВЫЙТИ ИЗ СИМУЛЯЦИИ
                    </button>
                </header>
                
                <div className="p-3 text-xs font-data flex justify-center gap-6 border-b border-amber-400/20 bg-black/20">
                    <span><span className="text-slate-400">LVL:</span> {progression.level}</span>
                    <span><span className="text-slate-400">РАНГ:</span> {progression.rankTitle}</span>
                    <span style={{color: EMOTIONS[activeEmotion]?.color}}><span className="text-slate-400">ЭМОЦИЯ:</span> {EMOTIONS[activeEmotion]?.name.RU}</span>
                    <span><span className="text-slate-400">ЭНЕРГИЯ:</span> {(energyLevel * 100).toFixed(0)}%</span>
                    <span><span className="text-slate-400">КОГЕРЕНТНОСТЬ:</span> {(coherence * 100).toFixed(0)}%</span>
                </div>

                <div className="flex-1 p-4 sm:p-6 space-y-2 overflow-y-auto">
                    {messages.map((msg) => (
                        <div key={msg.id} className={`flex items-start gap-2 ${msg.sender === 'USER' ? 'justify-end' : 'justify-start'}`}>
                            {msg.sender === 'MUZA' && (
                                <div className="w-6 h-6 rounded-full bg-slate-700 flex-shrink-0 self-start mt-1 flex items-center justify-center">
                                    {msg.isLogos ? <DatabaseZap size={14} className="text-amber-300" />
                                    : msg.isSearch ? <Search size={14} className="text-amber-400" />
                                    : msg.isAutonomous ? <Sparkles size={14} className="text-fuchsia-400" />
                                    : msg.codeBlock ? <Terminal size={14} className="text-cyan-400" />
                                    : null}
                                </div>
                            )}
                            <div className={`relative max-w-md p-3 rounded-lg ${msg.sender === 'USER' ? 'bg-sky-800/50' : `bg-slate-800/70 border-l-4 ${getMessageColor(msg.type, msg.isAutonomous, msg.isSearch, msg.isLogos)}`}`}>
                                <p className="text-slate-100 whitespace-pre-wrap text-sm">{msg.text}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default ImmersionOverlay;