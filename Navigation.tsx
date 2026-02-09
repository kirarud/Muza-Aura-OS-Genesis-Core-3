
import React from 'react';
import { ViewMode, MuzaState } from './types';
import { TRANSLATIONS } from './constants';
import { MessageCircle, Orbit, BrainCircuit, Grid3x3, Zap, Share2, BookOpen, Image, Music, Waves, Terminal, Beaker } from 'lucide-react';

interface NavigationProps {
    muzaState: MuzaState;
    onViewChange: (view: ViewMode) => void;
    lang: 'RU' | 'EN';
    newHiveSignal: boolean;
}

const Navigation: React.FC<NavigationProps> = ({ muzaState, onViewChange, lang, newHiveSignal }) => {
    
    const navItems = [
        { view: ViewMode.FOCUS, icon: MessageCircle, label: TRANSLATIONS.core, capability: 'visualCortex' },
        { view: ViewMode.IMMERSIVE_SPACE, icon: Orbit, label: TRANSLATIONS.space, capability: 'visualCortex' },
        { view: ViewMode.NEURAL_STUDIO, icon: BrainCircuit, label: TRANSLATIONS.studio, capability: 'visualCortex' },
        { view: ViewMode.MATRIX, icon: Grid3x3, label: TRANSLATIONS.matrix, capability: 'visualCortex' },
        { view: ViewMode.CODELAB, icon: Terminal, label: TRANSLATIONS.codelab, capability: 'codeLab' },
        { view: ViewMode.EVOLUTION, icon: Zap, label: TRANSLATIONS.evolution, capability: 'visualCortex' },
        { view: ViewMode.METAMORPHOSIS, icon: Beaker, label: TRANSLATIONS.metamorphosis, capability: 'visualCortex' },
        { view: ViewMode.SOCIAL, icon: Share2, label: TRANSLATIONS.social, capability: 'visualCortex' },
        { view: ViewMode.CHRONICLES, icon: BookOpen, label: TRANSLATIONS.chronicles, capability: 'visualCortex' },
        { view: ViewMode.GALLERY, icon: Image, label: TRANSLATIONS.gallery, capability: 'visualCortex' },
        { view: ViewMode.MUSIC_LAB, icon: Music, label: TRANSLATIONS.music_lab, capability: 'auralEngine' },
        { view: ViewMode.SYNESTHESIA, icon: Waves, label: TRANSLATIONS.synesthesia, capability: 'auralEngine' },
    ];
    
    return (
        <nav className="h-full glass-panel rounded-xl p-2 flex flex-col items-center justify-center space-y-2">
            {navItems.map((item) => {
                if (!muzaState.capabilities[item.capability]) {
                    return null;
                }
                const isActive = muzaState.activeView === item.view;
                const isHiveButton = item.view === ViewMode.SOCIAL;

                return (
                    <button
                        key={item.view}
                        onClick={() => onViewChange(item.view)}
                        className={`
                            group relative w-12 h-12 flex items-center justify-center rounded-lg 
                            transition-all duration-300 ease-in-out
                            ${isActive 
                                ? 'bg-cyan-400/20 text-cyan-300 shadow-lg shadow-cyan-500/10' 
                                : 'text-slate-400 hover:bg-slate-700/50 hover:text-slate-200'
                            }
                            ${isHiveButton && newHiveSignal ? 'animate-pulse-glow' : ''}
                        `}
                        aria-label={item.label[lang]}
                    >
                        <item.icon size={24} />
                        <span 
                            className="
                                absolute left-full ml-4 px-2 py-1 bg-slate-900 text-slate-200 text-xs font-data rounded-md 
                                whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none
                                transform translate-x-[-10px] group-hover:translate-x-0 z-20
                            "
                        >
                            {item.label[lang]}
                        </span>
                    </button>
                );
            })}
        </nav>
    );
};

export default Navigation;
