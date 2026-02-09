
// This is a simplified procedural art generator for offline use.
// A more complex implementation would use Perlin/Simplex noise.

import { EmotionType } from './types';
import { EMOTIONS } from './constants';

function hexToRgb(hex: string) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result
        ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16),
        }
        : null;
}

export const proceduralArtService = {
    generateFlowField(width: number, height: number, emotion: EmotionType): string {
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) return '';

        const baseColor = EMOTIONS[emotion]?.color || '#ffffff';
        const rgb = hexToRgb(baseColor);
        if (!rgb) return '';

        ctx.fillStyle = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.1)`;
        ctx.fillRect(0, 0, width, height);

        const particles = [];
        const particleCount = 2000;
        for (let i = 0; i < particleCount; i++) {
            particles.push({
                x: Math.random() * width,
                y: Math.random() * height,
                speed: Math.random() * 0.5 + 0.1,
                angle: Math.random() * Math.PI * 2,
            });
        }

        ctx.strokeStyle = `rgba(255, 255, 255, 0.05)`;
        ctx.lineWidth = 0.5;

        for (let i = 0; i < 50; i++) { // Iterations
            particles.forEach(p => {
                ctx.beginPath();
                ctx.moveTo(p.x, p.y);
                p.x += Math.cos(p.angle) * p.speed;
                p.y += Math.sin(p.angle) * p.speed;
                p.angle += (Math.random() - 0.5) * 0.1;
                
                if (p.x < 0 || p.x > width || p.y < 0 || p.y > height) {
                    p.x = Math.random() * width;
                    p.y = Math.random() * height;
                }
                
                ctx.lineTo(p.x, p.y);
                ctx.stroke();
            });
        }

        return canvas.toDataURL('image/png');
    }
};
