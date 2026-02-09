
import React, { useState, useEffect, useRef } from 'react';
import { HyperBit, MuzaState, ConsciousnessType } from './types';
import { AlertCircle, CheckCircle } from 'lucide-react';
import { TRANSLATIONS } from './constants';

interface SocialProps {
    muzaState: MuzaState;
    onImport: (link: string) => boolean;
}

const HiveVisualization: React.FC<{ hiveFeed: HyperBit[], nodeId: string }> = ({ hiveFeed, nodeId }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let animationFrameId: number;
        const resizeCanvas = () => {
            canvas.width = canvas.offsetWidth;
            canvas.height = canvas.offsetHeight;
        };
        resizeCanvas();
        window.addEventListener('resize', resizeCanvas);

        const render = () => {
            if (!ctx) return;
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            const centerX = canvas.width / 2;
            const centerY = canvas.height / 2;
            const maxRadius = Math.min(centerX, centerY) * 0.8;
            
            // Draw central node (user)
            ctx.beginPath();
            ctx.arc(centerX, centerY, 8, 0, Math.PI * 2);
            ctx.fillStyle = '#c084fc';
            ctx.fill();
            ctx.strokeStyle = 'rgba(192, 132, 252, 0.3)';
            ctx.lineWidth = 10;
            ctx.stroke();

            // Draw hive nodes
            hiveFeed.forEach(bit => {
                const radius = Math.max(20, (1 - bit.resonance) * maxRadius);
                const angle = ((bit.timestamp || 0) % 100000) / 100000 * Math.PI * 2;
                const x = centerX + Math.cos(angle) * radius;
                const y = centerY + Math.sin(angle) * radius;

                // Draw line from center
                ctx.beginPath();
                ctx.moveTo(centerX, centerY);
                ctx.lineTo(x, y);
                ctx.strokeStyle = `rgba(100, 116, 139, 0.1)`;
                ctx.stroke();

                // Draw node
                ctx.beginPath();
                ctx.arc(x, y, 4, 0, Math.PI * 2);
                ctx.fillStyle = bit.optics.baseColor || '#ffffff';
                ctx.shadowColor = bit.optics.baseColor;
                ctx.shadowBlur = 5;
                ctx.fill();
                ctx.shadowBlur = 0;
            });

            animationFrameId = requestAnimationFrame(render);
        };
        render();

        return () => {
            cancelAnimationFrame(animationFrameId);
            window.removeEventListener('resize', resizeCanvas);
        };
    }, [hiveFeed]);

    return <canvas ref={canvasRef} className="w-full h-full" />;
};


const Social: React.FC<SocialProps> = ({ muzaState, onImport }) => {
    const [linkInput, setLinkInput] = useState('');
    const [importStatus, setImportStatus] = useState<'IDLE' | 'SUCCESS' | 'ERROR'>('IDLE');

    const handleImportSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const success = onImport(linkInput);
        if (success) {
            setImportStatus('SUCCESS');
            setLinkInput('');
        } else {
            setImportStatus('ERROR');
        }
        setTimeout(() => setImportStatus('IDLE'), 2000);
    };

    const calculateHiveConsensus = (hiveFeed: HyperBit[]): { dominantType: ConsciousnessType | null, auraColor: string } => {
        if (hiveFeed.length === 0) return { dominantType: null, auraColor: 'rgba(15, 23, 42, 0.45)' };

        const typeCounts = hiveFeed.reduce((acc, bit) => {
            acc[bit.type] = (acc[bit.type] || 0) + 1;
            return acc;
        }, {} as Record<ConsciousnessType, number>);

        const dominantType = Object.keys(typeCounts).reduce((a, b) => typeCounts[a as ConsciousnessType] > typeCounts[b as ConsciousnessType] ? a : b) as ConsciousnessType;

        const TYPE_AURAS: Partial<Record<ConsciousnessType, string>> = {
            [ConsciousnessType.LOGIC]: 'rgba(34, 211, 238, 0.15)',
            [ConsciousnessType.CODE]: 'rgba(34, 211, 238, 0.15)',
            [ConsciousnessType.TECHNICAL]: 'rgba(34, 211, 238, 0.15)',
            [ConsciousnessType.CREATIVE]: 'rgba(192, 132, 252, 0.15)',
            [ConsciousnessType.PHILOSOPHICAL]: 'rgba(167, 139, 250, 0.15)',
            [ConsciousnessType.MUSICAL]: 'rgba(217, 70, 239, 0.15)',
            [ConsciousnessType.EMOTIONAL]: 'rgba(251, 191, 36, 0.15)',
            [ConsciousnessType.QUESTION]: 'rgba(250, 204, 21, 0.15)',
        };

        return { dominantType, auraColor: TYPE_AURAS[dominantType] || 'rgba(100, 116, 139, 0.15)' };
    };
    
    const { dominantType, auraColor } = calculateHiveConsensus(muzaState.hiveFeed);

    return (
        <div className="w-full h-full glass-panel rounded-xl p-6 flex flex-col text-slate-200 transition-all duration-1000" style={{ backgroundColor: auraColor }}>
            <h2 className="text-xl font-bold font-data text-cyan-300 border-b border-cyan-300/20 pb-2 mb-6">
                КОЛЛЕКТИВНЫЙ УЛЕЙ
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 flex-1 overflow-hidden">
                <div className="flex flex-col space-y-4">
                    <form onSubmit={handleImportSubmit} className="flex gap-2">
                        <input
                            type="text"
                            value={linkInput}
                            onChange={(e) => setLinkInput(e.target.value)}
                            placeholder="Вставить квантовую ссылку MUZA://..."
                            className="flex-1 bg-slate-900/70 border border-slate-700 rounded-md py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 transition"
                        />
                        <button type="submit" className="bg-purple-600 hover:bg-purple-500 text-white font-bold py-2 px-4 rounded-md transition">
                            Импорт
                        </button>
                    </form>
                    {importStatus === 'SUCCESS' && <p className="text-green-400 text-xs flex items-center gap-1"><CheckCircle size={14} />Сигнал успешно принят.</p>}
                    {importStatus === 'ERROR' && <p className="text-red-400 text-xs flex items-center gap-1"><AlertCircle size={14} />Ошибка декодирования.</p>}
                     
                     <div className="grid grid-cols-2 gap-4 text-center">
                        <div>
                            <p className="text-xs text-slate-400 font-data">{TRANSLATIONS.node_id['RU']}</p>
                            <p className="font-data text-purple-300 text-sm truncate">{muzaState.nodeId}</p>
                        </div>
                        <div>
                            <p className="text-xs text-slate-400 font-data">КОНСЕНСУС УЛЬЯ</p>
                            <p className="font-data text-cyan-300 text-sm">{dominantType || 'НЕТ ДАННЫХ'}</p>
                        </div>
                     </div>
                     
                     <div className="flex-1 w-full h-full border-2 border-dashed border-slate-700 rounded-lg relative">
                        <HiveVisualization hiveFeed={muzaState.hiveFeed} nodeId={muzaState.nodeId}/>
                    </div>
                </div>

                <div className="flex flex-col h-full">
                     <p className="text-sm text-slate-400 font-data mb-2">ПОТОК УЛЬЯ</p>
                     <div className="flex-1 bg-slate-900/30 rounded-lg p-3 overflow-y-auto space-y-3">
                        {muzaState.hiveFeed.length === 0 ? (
                            <div className="text-center text-slate-500 text-sm h-full flex items-center justify-center">Поток пуст. Ожидание сигналов...</div>
                        ) : (
                            muzaState.hiveFeed.map((bit) => (
                                <div key={bit.id} className="glass-panel p-3 rounded-md border-l-4 animate-fade-in" style={{ borderLeftColor: bit.optics.baseColor }}>
                                    <p className="text-xs text-slate-400 font-data flex justify-between">
                                        <span>{bit.type}</span>
                                        <span className="text-slate-500">FROM: #{bit.originNodeId?.slice(0, 6)}</span>
                                    </p>
                                    <p className="text-sm mt-1">{bit.content}</p>
                                </div>
                            ))
                        )}
                     </div>
                </div>
            </div>
        </div>
    );
};

export default Social;
