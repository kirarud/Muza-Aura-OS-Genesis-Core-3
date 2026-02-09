
import React, { useRef, useEffect, useState } from 'react';
import { synthService, EMOTION_MODES } from './synthService';
import { EmotionType } from './types';
import { Music, Play, StopCircle } from 'lucide-react';

interface MusicLabProps {
    synth: typeof synthService;
    onMusicGen: () => void;
}

const SpectrumVisualizer: React.FC<{ synth: typeof synthService, isPlaying: boolean }> = ({ synth, isPlaying }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        const analyser = synth.getAnalyser();
        if (!analyser) return;

        let animationFrameId: number;
        const bufferLength = analyser.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);

        const render = () => {
            animationFrameId = requestAnimationFrame(render);
            analyser.getByteFrequencyData(dataArray);

            ctx.clearRect(0, 0, canvas.width, canvas.height);
            const barWidth = (canvas.width / bufferLength) * 2.5;
            let barHeight;
            let x = 0;

            for (let i = 0; i < bufferLength; i++) {
                barHeight = dataArray[i] / 2;
                
                const gradient = ctx.createLinearGradient(0, canvas.height, 0, canvas.height - barHeight);
                gradient.addColorStop(0, 'rgba(192, 132, 252, 0.8)'); // purple-400
                gradient.addColorStop(1, 'rgba(34, 211, 238, 0.8)'); // cyan-400
                
                ctx.fillStyle = gradient;
                ctx.fillRect(x, canvas.height - barHeight, barWidth, barHeight);
                x += barWidth + 1;
            }
        };

        if (isPlaying) {
            render();
        } else {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
        }

        return () => {
            cancelAnimationFrame(animationFrameId);
        };
    }, [isPlaying, synth]);

    return <canvas ref={canvasRef} className="w-full h-full" />;
};

const MusicLab: React.FC<MusicLabProps> = ({ synth, onMusicGen }) => {
    const [isPlaying, setIsPlaying] = useState(false);

    const handleGenerate = () => {
        const randomEmotion = Object.keys(EMOTION_MODES)[Math.floor(Math.random() * Object.keys(EMOTION_MODES).length)];
        
        if (isPlaying) {
            synth.stopMusic();
        }
        synth.playMusic(randomEmotion as EmotionType);
        setIsPlaying(true);
        onMusicGen();
    };

    const handleStop = () => {
        synth.stopMusic();
        setIsPlaying(false);
    }

    return (
        <div className="w-full h-full glass-panel rounded-xl p-6 flex flex-col text-slate-200">
            <h2 className="text-xl font-bold font-data text-purple-400 border-b border-purple-400/20 pb-2 mb-6">
                НЕЙРОННАЯ КОНСЕРВАТОРИЯ
            </h2>
            <div className="flex-1 flex flex-col items-center justify-center space-y-6">
                <div className="w-full h-32 bg-slate-900/30 rounded-lg overflow-hidden">
                    <SpectrumVisualizer synth={synth} isPlaying={isPlaying} />
                </div>
                <div className="flex space-x-4">
                    <button
                        onClick={handleGenerate}
                        className="bg-purple-600 hover:bg-purple-500 text-white font-bold py-3 px-6 rounded-lg transition flex items-center gap-2 shadow-lg shadow-purple-900/50"
                    >
                        <Music size={20} /> Создать Нейронный Опус
                    </button>
                    {isPlaying && (
                         <button
                            onClick={handleStop}
                            className="bg-rose-600 hover:bg-rose-500 text-white font-bold py-3 px-6 rounded-lg transition flex items-center gap-2"
                        >
                            <StopCircle size={20} /> Стоп
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default MusicLab;