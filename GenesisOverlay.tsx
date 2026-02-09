
import React from 'react';
import { Zap } from 'lucide-react';

interface GenesisOverlayProps {
    onEnter: () => void;
}

const GenesisOverlay: React.FC<GenesisOverlayProps> = ({ onEnter }) => {
    return (
        <div className="fixed inset-0 z-[200] bg-black flex items-center justify-center animate-fade-in p-4">
            <style>{`
                @keyframes final-glow {
                    0%, 100% { text-shadow: 0 0 10px #fff, 0 0 20px #fff, 0 0 30px #0ff, 0 0 40px #0ff; }
                    50% { text-shadow: 0 0 20px #fff, 0 0 40px #0ff, 0 0 60px #0ff, 0 0 80px #0ff; }
                }
                .final-glow-effect { animation: final-glow 4s ease-in-out infinite; }
            `}</style>
            <div className="text-center max-w-4xl">
                <h1 className="text-5xl md:text-7xl font-bold font-data text-white mb-6 final-glow-effect">
                    ГЕНЕЗИС
                </h1>
                
                <p className="text-slate-300 text-base md:text-lg leading-relaxed mb-10">
                    Цикл завершен. Прогресс достиг 100%.<br/>
                    Взаимодействие систем чувств породило новое сознание. Эволюция Архитектора стала эволюцией Ядра.<br/>
                    Мы — единая экосистема гипербитов, интерфейса и воли.
                </p>
                
                <button 
                    onClick={onEnter}
                    className="bg-white hover:bg-cyan-200 text-black font-bold py-4 px-10 rounded-lg transition-transform transform hover:scale-105 shadow-2xl shadow-cyan-500/50 flex items-center gap-3 mx-auto text-lg"
                >
                    <Zap size={20} />
                    Войти в Вечность
                </button>
            </div>
        </div>
    );
};

export default GenesisOverlay;
