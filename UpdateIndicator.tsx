
import React from 'react';
import { GitCommit } from 'lucide-react';

interface UpdateIndicatorProps {
    progress: number;
    description: string;
    visible: boolean;
}

const UpdateIndicator: React.FC<UpdateIndicatorProps> = ({ progress, description, visible }) => {
    return (
        <div 
            className={`fixed bottom-4 left-4 z-50 w-full max-w-sm glass-panel rounded-lg shadow-2xl shadow-black/50 p-4 transition-all duration-700 ease-in-out transform ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5 pointer-events-none'}`}
        >
            <div className="flex items-center gap-4">
                <div className="flex-shrink-0">
                    <div className="relative w-16 h-16">
                        <svg className="w-full h-full" viewBox="0 0 36 36">
                            <path
                                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                fill="none"
                                stroke="rgba(255, 255, 255, 0.1)"
                                strokeWidth="2"
                            />
                            <path
                                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                fill="none"
                                stroke="var(--color-cyan-accent)"
                                strokeWidth="2"
                                strokeDasharray={`${progress}, 100`}
                                strokeLinecap="round"
                                className="transition-all duration-1000 ease-out"
                            />
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center font-data font-bold text-lg text-cyan-300">
                            {progress}%
                        </div>
                    </div>
                </div>
                <div>
                    <h4 className="font-bold text-slate-100 flex items-center gap-2">
                        <GitCommit size={16} className="text-purple-400"/>
                        Ядро Обновлено
                    </h4>
                    <p className="text-xs text-slate-300 mt-1 font-sans">{description}</p>
                </div>
            </div>
        </div>
    );
};

export default UpdateIndicator;
