
import React, { useRef, useEffect } from 'react';
import { synthService } from './synthService';

interface Particle {
    x: number;
    y: number;
    vx: number;
    vy: number;
    radius: number;
    color: string;
}

interface SynesthesiaProps {
    synth: typeof synthService;
}

const Synesthesia: React.FC<SynesthesiaProps> = ({ synth }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const particlesRef = useRef<Particle[]>([]);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        const analyser = synth.getAnalyser();
        if (!analyser) return;

        let animationFrameId: number;

        const resizeCanvas = () => {
            canvas.width = canvas.parentElement?.offsetWidth || window.innerWidth;
            canvas.height = canvas.parentElement?.offsetHeight || window.innerHeight;
            
            // Re-initialize particles on resize
            particlesRef.current = [];
            const particleCount = 100;
            for (let i = 0; i < particleCount; i++) {
                particlesRef.current.push({
                    x: Math.random() * canvas.width,
                    y: Math.random() * canvas.height,
                    vx: (Math.random() - 0.5) * 0.5,
                    vy: (Math.random() - 0.5) * 0.5,
                    radius: Math.random() * 2 + 1,
                    color: `hsl(${Math.random() * 360}, 70%, 50%)`
                });
            }
        };

        resizeCanvas();
        window.addEventListener('resize', resizeCanvas);

        const bufferLength = analyser.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);

        const render = () => {
            animationFrameId = requestAnimationFrame(render);
            analyser.getByteFrequencyData(dataArray);

            const bass = dataArray.slice(0, 10).reduce((a, b) => a + b, 0) / 10 / 255;
            const mids = dataArray.slice(10, 60).reduce((a, b) => a + b, 0) / 50 / 255;
            const treble = dataArray.slice(60, bufferLength).reduce((a, b) => a + b, 0) / (bufferLength - 60) / 255;

            ctx.fillStyle = `rgba(2, 6, 23, 0.1)`;
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            
            const centerX = canvas.width / 2;
            const centerY = canvas.height / 2;

            // Central core
            const coreRadius = 20 + bass * 100;
            const gradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, coreRadius);
            gradient.addColorStop(0, `rgba(255, 255, 255, ${mids * 0.5})`);
            gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
            ctx.fillStyle = gradient;
            ctx.beginPath();
            ctx.arc(centerX, centerY, coreRadius, 0, Math.PI * 2);
            ctx.fill();

            // Particles
            particlesRef.current.forEach(p => {
                p.x += p.vx + (Math.random() - 0.5) * treble * 2;
                p.y += p.vy + (Math.random() - 0.5) * treble * 2;
                
                const dx = p.x - centerX;
                const dy = p.y - centerY;
                const dist = Math.sqrt(dx * dx + dy * dy);
                
                // Gravity towards core
                p.vx -= (dx / dist) * bass * 0.05;
                p.vy -= (dy / dist) * bass * 0.05;

                if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
                if (p.y < 0 || p.y > canvas.height) p.vy *= -1;

                ctx.beginPath();
                ctx.arc(p.x, p.y, p.radius * (1 + mids), 0, Math.PI * 2);
                ctx.fillStyle = p.color;
                ctx.globalAlpha = mids * 0.8 + 0.2;
                ctx.fill();
                ctx.globalAlpha = 1;
            });
        };

        render();

        return () => {
            cancelAnimationFrame(animationFrameId);
            window.removeEventListener('resize', resizeCanvas);
        };
    }, [synth]);

    return (
        <div className="w-full h-full glass-panel rounded-xl overflow-hidden">
            <canvas ref={canvasRef} className="w-full h-full" />
             <div className="absolute top-4 left-6 text-xl font-bold font-data text-cyan-400">СИНЕСТЕЗИЯ</div>
        </div>
    );
};

export default Synesthesia;
