
import React, { useState } from 'react';
import { Artifact } from './types';
import { Zap, Edit, GitMerge, X, Loader } from 'lucide-react';

interface GenesisGalleryProps {
    artifacts: Artifact[];
    onGenerate: () => void;
    isGenerating: boolean;
    energyLevel: number;
    onEdit: (artifact: Artifact) => void;
    onFuse: (artifacts: [Artifact, Artifact]) => void;
    isFusionUnlocked: boolean;
}

const GenesisGallery: React.FC<GenesisGalleryProps> = ({ artifacts, onGenerate, isGenerating, energyLevel, onEdit, onFuse, isFusionUnlocked }) => {
    const canGenerate = energyLevel >= 0.2;
    const [fusionMode, setFusionMode] = useState(false);
    const [selectedForFusion, setSelectedForFusion] = useState<string[]>([]);

    const toggleFusionMode = () => {
        setFusionMode(!fusionMode);
        setSelectedForFusion([]);
    };

    const handleSelectForFusion = (artifactId: string) => {
        if (selectedForFusion.includes(artifactId)) {
            setSelectedForFusion(selectedForFusion.filter(id => id !== artifactId));
        } else if (selectedForFusion.length < 2) {
            setSelectedForFusion([...selectedForFusion, artifactId]);
        }
    };

    const handleStartFusion = () => {
        if (selectedForFusion.length !== 2) return;
        const artifact1 = artifacts.find(a => a.id === selectedForFusion[0]);
        const artifact2 = artifacts.find(a => a.id === selectedForFusion[1]);
        if (artifact1 && artifact2) {
            onFuse([artifact1, artifact2]);
            toggleFusionMode();
        }
    };

    return (
        <div className="w-full h-full glass-panel rounded-xl p-6 flex flex-col text-slate-200">
            <div className="flex justify-between items-center border-b border-fuchsia-400/20 pb-2 mb-6">
                <h2 className="text-xl font-bold font-data text-fuchsia-400">
                    ГАЛЕРЕЯ ГЕНЕЗИСА
                </h2>
                <div className="flex items-center gap-4">
                    {isFusionUnlocked && !fusionMode && (
                        <button
                            onClick={toggleFusionMode}
                            className="bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-2 px-4 rounded-lg transition flex items-center gap-2 text-sm"
                        >
                            <GitMerge size={16} /> Сплетение Снов
                        </button>
                    )}
                    {fusionMode && (
                        <>
                            <button
                                onClick={toggleFusionMode}
                                className="bg-slate-600 hover:bg-slate-500 text-white font-bold py-2 px-4 rounded-lg transition flex items-center gap-2 text-sm"
                            >
                                <X size={16} /> Отмена
                            </button>
                             <button
                                onClick={handleStartFusion}
                                disabled={selectedForFusion.length !== 2}
                                className="bg-cyan-600 hover:bg-cyan-500 disabled:bg-slate-600 text-white font-bold py-2 px-4 rounded-lg transition flex items-center gap-2 text-sm"
                            >
                                <GitMerge size={16} /> Сплести ({selectedForFusion.length}/2)
                            </button>
                        </>
                    )}
                    {!fusionMode && (
                        <button 
                            onClick={onGenerate}
                            disabled={isGenerating || !canGenerate}
                            className="bg-fuchsia-600 hover:bg-fuchsia-500 disabled:bg-slate-600 text-white font-bold py-2 px-4 rounded-lg transition flex items-center gap-2 shadow-lg shadow-fuchsia-900/50 disabled:cursor-not-allowed"
                            title={!canGenerate ? 'Недостаточно энергии' : 'Сгенерировать новый сон'}
                        >
                            {isGenerating && isFusionUnlocked ? <Loader size={16} className="animate-spin" /> : isGenerating ? (
                                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            ) : (
                                <Zap size={16} />
                            )}
                            {isGenerating ? 'Генерация...' : 'Инициировать Сон'}
                        </button>
                    )}
                </div>
            </div>
            
            <div className="flex-1 overflow-y-auto pr-2">
                {artifacts.length === 0 ? (
                    <div className="w-full h-full flex items-center justify-center text-slate-500 font-data">
                        Галерея пуста. Инициируйте первый сон.
                    </div>
                ) : (
                    <div className="columns-1 sm:columns-2 md:columns-3 lg:columns-4 gap-4">
                        {[...artifacts].reverse().map(artifact => {
                            const isSelectedForFusion = selectedForFusion.includes(artifact.id);
                            return (
                                <div 
                                    key={artifact.id} 
                                    className={`mb-4 break-inside-avoid group relative overflow-hidden rounded-lg shadow-lg shadow-black/40 transition-all duration-300 ${fusionMode ? 'cursor-pointer' : ''}`}
                                    onClick={() => fusionMode && handleSelectForFusion(artifact.id)}
                                >
                                    <img src={artifact.src} alt={artifact.seed} className="w-full h-auto object-cover transition-transform duration-300 group-hover:scale-105" />
                                    <div className={`absolute inset-0 bg-gradient-to-t from-black/80 to-transparent transition-opacity duration-300 p-4 flex flex-col justify-end ${!fusionMode ? 'opacity-0 group-hover:opacity-100' : ''}`}>
                                        <p className="text-sm font-bold text-slate-100 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                                            {artifact.title || 'Без названия'}
                                        </p>
                                        <p className="text-xs text-slate-300 font-data transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300 delay-100 line-clamp-2">
                                            {artifact.seed}
                                        </p>
                                    </div>
                                    {!fusionMode && (
                                        <button onClick={() => onEdit(artifact)} className="absolute top-2 right-2 p-2 bg-slate-900/50 rounded-full text-slate-300 opacity-0 group-hover:opacity-100 transition-all hover:bg-slate-800 hover:text-white">
                                            <Edit size={16} />
                                        </button>
                                    )}
                                    {isSelectedForFusion && (
                                        <div className="absolute inset-0 border-4 border-cyan-400 rounded-lg pointer-events-none animate-fade-in"></div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
};

export default GenesisGallery;
