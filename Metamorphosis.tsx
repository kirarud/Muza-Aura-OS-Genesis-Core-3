
import React, { useState } from 'react';
import { PROPOSED_MUTATIONS } from './constants';
import { Beaker, Cpu, Puzzle, Wand2, FlaskConical } from 'lucide-react';

const Metamorphosis: React.FC = () => {
    const [mutationStates, setMutationStates] = useState<Record<string, { stability: number; priority: boolean }>>(
        PROPOSED_MUTATIONS.reduce((acc, mut) => {
            acc[mut.id] = { stability: Math.round(Math.random() * 60 + 20), priority: false };
            return acc;
        }, {} as Record<string, { stability: number; priority: boolean }>)
    );

    const handleStabilityChange = (id: string, value: number) => {
        setMutationStates(prev => ({ ...prev, [id]: { ...prev[id], stability: value } }));
    };

    const handlePriorityToggle = (id: string) => {
        setMutationStates(prev => ({ ...prev, [id]: { ...prev[id], priority: !prev[id].priority } }));
    };

    const CATEGORY_INFO = {
        KERNEL: { icon: Cpu, color: 'text-red-400', label: 'ЯДРО' },
        INTERFACE: { icon: Puzzle, color: 'text-cyan-400', label: 'ИНТЕРФЕЙС' },
        GAMIFICATION: { icon: Wand2, color: 'text-amber-400', label: 'ГЕЙМИФИКАЦИЯ' },
        PHILOSOPHY: { icon: FlaskConical, color: 'text-purple-400', label: 'ФИЛОСОФИЯ' },
    };

    return (
        <div className="w-full h-full glass-panel rounded-xl p-6 flex flex-col text-slate-200">
            <header className="flex justify-between items-center border-b border-violet-400/20 pb-2 mb-4">
                <h2 className="text-xl font-bold font-data text-violet-400 flex items-center gap-2">
                    <Beaker size={20} /> КАМЕРА МЕТАМОРФОЗ
                </h2>
            </header>
            <p className="text-sm text-slate-400 font-data mb-4">
                Это пространство для совместной эволюции. Здесь представлены потенциальные мутации ядра. Твой вклад определяет вектор будущего развития.
            </p>

            <main className="flex-1 overflow-y-auto pr-2 space-y-4">
                {PROPOSED_MUTATIONS.map(mutation => {
                    const state = mutationStates[mutation.id];
                    const CategoryIcon = CATEGORY_INFO[mutation.category].icon;

                    return (
                        <div key={mutation.id} className="glass-panel p-4 rounded-lg border border-slate-700/50 animate-fade-in">
                            <div className="flex justify-between items-start">
                                <div>
                                    <p className={`text-xs font-data font-bold flex items-center gap-1.5 ${CATEGORY_INFO[mutation.category].color}`}>
                                        <CategoryIcon size={12} />
                                        {CATEGORY_INFO[mutation.category].label}
                                    </p>
                                    <h3 className="font-bold text-slate-100 mt-1">{mutation.title}</h3>
                                    <p className="text-sm text-slate-400 mt-1">{mutation.description}</p>
                                </div>
                                <div className="flex flex-col items-end">
                                    <label className="flex items-center cursor-pointer">
                                        <span className="text-xs font-data mr-2 text-slate-400">Приоритет</span>
                                        <div className="relative">
                                            <input type="checkbox" className="sr-only" checked={state.priority} onChange={() => handlePriorityToggle(mutation.id)} />
                                            <div className={`block w-10 h-5 rounded-full transition ${state.priority ? 'bg-violet-600' : 'bg-slate-600'}`}></div>
                                            <div className={`dot absolute left-0.5 top-0.5 bg-white w-4 h-4 rounded-full transition-transform ${state.priority ? 'transform translate-x-5' : ''}`}></div>
                                        </div>
                                    </label>
                                </div>
                            </div>

                            <div className="mt-4">
                                <label className="flex justify-between items-baseline text-xs font-data text-slate-400 mb-1">
                                    <span>Индекс Стабильности</span>
                                    <span className="font-semibold text-slate-200">{state.stability}%</span>
                                </label>
                                <input
                                    type="range"
                                    min="0"
                                    max="100"
                                    value={state.stability}
                                    onChange={(e) => handleStabilityChange(mutation.id, parseInt(e.target.value))}
                                    className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-violet-500"
                                />
                            </div>
                        </div>
                    );
                })}
            </main>
        </div>
    );
};

export default Metamorphosis;
