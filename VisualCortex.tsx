
import React, { useRef, useEffect } from 'react';
import { muzaAIService } from './muzaAIService';
import { MuzaState } from './types';
import { calculateNodeOptics } from './opticsEngine';

interface VisualCortexProps {
    muzaState: MuzaState;
}

const FOV = 300; // Field of View (or focal length)

const VisualCortex: React.FC<VisualCortexProps> = ({ muzaState }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const animationFrameId = useRef<number | null>(null);
    
    // Camera rotation angles
    const rotationY = useRef(0.0002);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        
        const context = canvas.getContext('2d');
        if (!context) return;
        
        const resizeCanvas = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };
        
        window.addEventListener('resize', resizeCanvas);
        resizeCanvas();

        const render = () => {
            if (!context) return;
            context.clearRect(0, 0, canvas.width, canvas.height);

            const nodes = muzaAIService.getNodes();
            const centerX = canvas.width / 2;
            const centerY = canvas.height / 2;
            
            // Z-Sorting for correct opacity rendering
            nodes.sort((a, b) => a.vector.z - b.vector.z);
            
            rotationY.current += 0.0001;

            for (const node of nodes) {
                // 3D rotation (Y-axis only for a slow, stable rotation)
                const cosY = Math.cos(rotationY.current);
                const sinY = Math.sin(rotationY.current);

                const x1 = node.vector.x * cosY - node.vector.z * sinY;
                const z1 = node.vector.z * cosY + node.vector.x * sinY;
                
                // 3D to 2D Projection
                const scale = FOV / (FOV + z1 * 150);
                const x2d = centerX + x1 * 150 * scale;
                const y2d = centerY + node.vector.y * 150 * scale;

                if (x2d < 0 || x2d > canvas.width || y2d < 0 || y2d > canvas.height || scale < 0) {
                    continue; // Don't draw if off-screen or behind camera
                }

                const optics = calculateNodeOptics(node.id, node.energy);
                const radius = (1 + optics.brightness * 4) * scale;
                
                // Create radial gradient for glow effect
                const gradient = context.createRadialGradient(x2d, y2d, 0, x2d, y2d, radius * 2.5);
                gradient.addColorStop(0, `${optics.baseColor}ff`);
                gradient.addColorStop(0.3, `${optics.baseColor}aa`);
                gradient.addColorStop(1, `${optics.baseColor}00`);

                context.beginPath();
                context.arc(x2d, y2d, radius, 0, 2 * Math.PI);
                context.fillStyle = gradient;
                context.fill();
            }
            
            animationFrameId.current = requestAnimationFrame(render);
        };
        
        render();

        return () => {
            window.removeEventListener('resize', resizeCanvas);
            if (animationFrameId.current) {
                cancelAnimationFrame(animationFrameId.current);
            }
        };
    }, []);
    
    // React to coherence changes
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const blurAmount = (1 - muzaState.coherence) * 10;
        canvas.style.filter = `blur(${blurAmount}px)`;
        canvas.style.transition = 'filter 1s ease-in-out';
    }, [muzaState.coherence]);

    return (
        <canvas
            ref={canvasRef}
            className="fixed inset-0 -z-10"
        />
    );
};

export default VisualCortex;
