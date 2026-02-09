
import React, { useRef, useEffect } from 'react';
import { MuzaState } from './types';
import { EMOTIONS } from './constants';
import { muzaAIService } from './muzaAIService';

interface MatrixProps {
    muzaState: MuzaState;
}

const Matrix: React.FC<MatrixProps> = ({ muzaState }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let animationFrameId: number;

        const resizeCanvas = () => {
            canvas.width = canvas.parentElement?.offsetWidth || window.innerWidth;
            canvas.height = canvas.parentElement?.offsetHeight || window.innerHeight;
        };
        
        window.addEventListener('resize', resizeCanvas);
        resizeCanvas();

        const katakana = 'アァカサタナハマヤャラワガザダバパイィキシチニヒミリヰギジヂビピウゥクスツヌフムユュルグズブプエェケセテネヘメレヱゲゼデベペオォコソトノホモヨョロヲゴゾドボポヴッン';
        const latin = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        const nums = '0123456789';
        
        const fontSize = 16;
        let columns: number;
        let drops: number[];
        let characterSet: string[] = (katakana + latin + nums).split('');

        const initializeMatrix = () => {
            columns = Math.floor(canvas.width / fontSize);
            drops = [];
            for (let i = 0; i < columns; i++) {
                drops[i] = 1;
            }
             // Enrich character set with words from AI's memory
            const aiTokens = muzaAIService.getNodes().map(n => n.id).join('').toUpperCase();
            characterSet = (katakana + latin + nums + aiTokens).split('');
        };

        initializeMatrix();
        
        const render = () => {
            const { activeEmotion, coherence, energyLevel } = muzaState;
            const baseColor = EMOTIONS[activeEmotion]?.color || '#22d3ee';
            
            // Fading effect
            ctx.fillStyle = 'rgba(2, 6, 23, 0.05)';
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            ctx.fillStyle = baseColor;
            ctx.font = `${fontSize}px 'JetBrains Mono', monospace`;

            for (let i = 0; i < drops.length; i++) {
                let text = characterSet[Math.floor(Math.random() * characterSet.length)];
                
                // Glitch effect based on low coherence
                if (coherence < 0.5 && Math.random() > coherence) {
                    text = ['#', '%', '$', '!', '?', '&'][Math.floor(Math.random() * 6)];
                    ctx.fillStyle = EMOTIONS.ERROR.color;
                } else {
                     ctx.fillStyle = baseColor;
                }

                ctx.fillText(text, i * fontSize, drops[i] * fontSize);

                // Sending the drop back to the top randomly after it has crossed the screen
                // The speed is controlled by energy level
                if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) {
                    drops[i] = 0;
                }

                drops[i] += (energyLevel * 0.8 + 0.2); // Speed is proportional to energy
            }
            animationFrameId = requestAnimationFrame(render);
        };

        render();

        return () => {
            cancelAnimationFrame(animationFrameId);
            window.removeEventListener('resize', resizeCanvas);
        };
    }, [muzaState]);

    return (
        <div className="w-full h-full glass-panel rounded-xl overflow-hidden">
             <canvas ref={canvasRef} className="w-full h-full" />
        </div>
    );
};

export default Matrix;
