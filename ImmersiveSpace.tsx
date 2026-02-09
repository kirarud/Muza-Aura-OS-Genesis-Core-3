import React, { useRef, useEffect, useState } from 'react';
import { muzaAIService } from './muzaAIService';
import { MuzaAINode, MuzaState } from './types';
import { calculateNodeOptics } from './opticsEngine';

interface ImmersiveSpaceProps {
    muzaState: MuzaState;
}

const FOV = 400;

const ImmersiveSpace: React.FC<ImmersiveSpaceProps> = ({ muzaState }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const animationFrameId = useRef<number | null>(null);
    const [selectedNode, setSelectedNode] = useState<MuzaAINode | null>(null);
    
    const camera = useRef({ rotX: 0.05, rotY: 0, zoom: 1 });
    const mouse = useRef({ isDown: false, lastX: 0, lastY: 0 });
    const screenCoordsRef = useRef(new Map<string, { x: number; y: number; z: number; scale: number;}>());


    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        
        const context = canvas.getContext('2d');
        if (!context) return;
        
        const resizeCanvas = () => {
            const parent = canvas.parentElement;
            if (parent) {
                canvas.width = parent.offsetWidth;
                canvas.height = parent.offsetHeight;
            }
        };
        
        window.addEventListener('resize', resizeCanvas);
        resizeCanvas();

        const handleClick = (e: MouseEvent) => {
            const rect = canvas.getBoundingClientRect();
            const clickX = e.clientX - rect.left;
            const clickY = e.clientY - rect.top;
            
            let closestNode: MuzaAINode | null = null;
            let minDistance = 20; // Click radius

            // FIX: Cast the result of Array.from to fix type inference issue with Map iterators.
            const sortedNodes = (Array.from(screenCoordsRef.current.entries()) as [string, { x: number; y: number; z: number; scale: number; }][])
                .sort((a, b) => b[1].z - a[1].z); // Check foreground nodes first
            
            for (const [id, coords] of sortedNodes) {
                const distance = Math.sqrt(Math.pow(clickX - coords.x, 2) + Math.pow(clickY - coords.y, 2));
                 if(distance < minDistance) {
                     minDistance = distance;
                     closestNode = muzaAIService.getNodes().find(n => n.id === id) || null;
                 }
            }
            setSelectedNode(prev => prev?.id === closestNode?.id ? null : closestNode);
        };

        const handleMouseDown = (e: MouseEvent) => {
            mouse.current.isDown = true;
            mouse.current.lastX = e.clientX;
            mouse.current.lastY = e.clientY;
        };

        const handleMouseUp = (e: MouseEvent) => {
            if (mouse.current.isDown) {
                const dx = e.clientX - mouse.current.lastX;
                const dy = e.clientY - mouse.current.lastY;
                const distance = Math.sqrt(dx*dx + dy*dy);
                if (distance < 5) { // If it's a click, not a drag
                    handleClick(e);
                }
            }
            mouse.current.isDown = false;
        };

        const handleMouseMove = (e: MouseEvent) => {
            if (!mouse.current.isDown) return;
            const dx = e.clientX - mouse.current.lastX;
            const dy = e.clientY - mouse.current.lastY;
            camera.current.rotY += dx * 0.001;
            camera.current.rotX += dy * 0.001;
            mouse.current.lastX = e.clientX;
            mouse.current.lastY = e.clientY;
        };
        const handleWheel = (e: WheelEvent) => {
            e.preventDefault();
            camera.current.zoom -= e.deltaY * 0.001;
            camera.current.zoom = Math.max(0.2, Math.min(2.5, camera.current.zoom));
        };

        canvas.addEventListener('mousedown', handleMouseDown);
        canvas.addEventListener('mouseup', handleMouseUp);
        canvas.addEventListener('mouseleave', handleMouseUp);
        canvas.addEventListener('mousemove', handleMouseMove);
        canvas.addEventListener('wheel', handleWheel);

        const render = () => {
            if (!context) return;
            context.clearRect(0, 0, canvas.width, canvas.height);

            if (!mouse.current.isDown) {
                camera.current.rotY += 0.00015;
            }

            const nodes = muzaAIService.getNodes();
            const centerX = canvas.width / 2;
            const centerY = canvas.height / 2;

            const cosX = Math.cos(camera.current.rotX);
            const sinX = Math.sin(camera.current.rotX);
            const cosY = Math.cos(camera.current.rotY);
            const sinY = Math.sin(camera.current.rotY);
            
            const currentScreenCoords = screenCoordsRef.current;
            currentScreenCoords.clear();
            
            nodes.forEach(node => {
                const y1 = node.vector.y * cosX - node.vector.z * sinX;
                const z1 = node.vector.z * cosX + node.vector.y * sinX;
                const x2 = node.vector.x * cosY - z1 * sinY;
                const z2 = z1 * cosY + node.vector.x * sinY;
                const scale = FOV / (FOV + z2 * 150 * camera.current.zoom);
                
                if (scale > 0) {
                    const x2d = centerX + x2 * 150 * camera.current.zoom * scale;
                    const y2d = centerY + y1 * 150 * camera.current.zoom * scale;
                    currentScreenCoords.set(node.id, { x: x2d, y: y2d, z: z2, scale });
                }
            });

            const sortedScreenNodes = Array.from(currentScreenCoords.entries()).sort((a, b) => a[1].z - b[1].z);
            
            // Draw cognitive trace trails
            if (muzaState.cognitiveTrace) {
                const elapsedTime = Date.now() - muzaState.cognitiveTrace.timestamp;
                for (let i = 0; i < muzaState.cognitiveTrace.path.length - 1; i++) {
                    const startNodeId = muzaState.cognitiveTrace.path[i];
                    const endNodeId = muzaState.cognitiveTrace.path[i + 1];
                    const startCoords = currentScreenCoords.get(startNodeId);
                    const endCoords = currentScreenCoords.get(endNodeId);
                    
                    const activationTime = (i + 1) * 150;
                    const trailDuration = 1000;
                    if (startCoords && endCoords && elapsedTime > activationTime && elapsedTime < activationTime + trailDuration) {
                        const opacity = 1 - (elapsedTime - activationTime) / trailDuration;
                        context.beginPath();
                        context.moveTo(startCoords.x, startCoords.y);
                        context.lineTo(endCoords.x, endCoords.y);
                        context.strokeStyle = `rgba(255, 255, 255, ${opacity * 0.5})`;
                        context.lineWidth = 1;
                        context.stroke();
                    }
                }
            }


            context.lineWidth = 0.7;
            sortedScreenNodes.forEach(([id, start]) => {
                const node = nodes.find(n => n.id === id);
                if (!node) return;
                
                for(const [targetId] of node.associations.entries()) {
                    const end = currentScreenCoords.get(targetId);
                    if (!end) continue;
                    
                    const isDirectConnection = selectedNode && (selectedNode.id === id || selectedNode.id === targetId);
                    context.beginPath();
                    context.moveTo(start.x, start.y);
                    context.lineTo(end.x, end.y);
                    context.strokeStyle = isDirectConnection ? `rgba(192, 132, 252, 0.8)` : `rgba(192, 132, 252, 0.1)`;
                    context.stroke();
                }
            });

            sortedScreenNodes.forEach(([id, coords]) => {
                const node = nodes.find(n => n.id === id);
                if (!node) return;
                
                const { x, y, scale } = coords;
                const optics = calculateNodeOptics(id, node.energy);
                const isSelected = selectedNode?.id === id;
                
                let activationGlow = 0;
                if (muzaState.cognitiveTrace) {
                    const traceIndex = muzaState.cognitiveTrace.path.indexOf(id);
                    if (traceIndex !== -1) {
                        const elapsedTime = Date.now() - muzaState.cognitiveTrace.timestamp;
                        const activationTime = traceIndex * 150;
                        const glowDuration = 500;
                        if (elapsedTime > activationTime && elapsedTime < activationTime + glowDuration) {
                            activationGlow = 1 - (elapsedTime - activationTime) / glowDuration;
                        }
                    }
                }

                const radius = (isSelected ? 2.5 : 1) + (optics.brightness * 4) * scale;
                
                const gradient = context.createRadialGradient(x, y, 0, x, y, radius * (isSelected ? 3.5 : 2.5));
                gradient.addColorStop(0, `${optics.baseColor}ff`);
                gradient.addColorStop(0.3, `${optics.baseColor}aa`);
                gradient.addColorStop(1, `${optics.baseColor}00`);

                context.beginPath();
                context.arc(x, y, radius, 0, 2 * Math.PI);
                context.fillStyle = gradient;
                context.fill();
                
                if (activationGlow > 0) {
                    context.beginPath();
                    context.arc(x, y, radius + activationGlow * 3 * scale, 0, 2 * Math.PI);
                    context.strokeStyle = `rgba(255, 255, 255, ${activationGlow * 0.7})`;
                    context.lineWidth = 1.5 * scale;
                    context.stroke();
                }

                if (isSelected) {
                    context.font = `${Math.max(10, 14 * scale)}px 'JetBrains Mono'`;
                    context.fillStyle = `rgba(226, 232, 240, ${Math.min(1, scale * 2)})`;
                    context.textAlign = 'center';
                    context.shadowColor = 'black';
                    context.shadowBlur = 5;
                    context.fillText(id, x, y - radius - 8);
                    context.shadowBlur = 0;
                }
            });
            
            animationFrameId.current = requestAnimationFrame(render);
        };
        
        render();

        return () => {
            window.removeEventListener('resize', resizeCanvas);
            canvas.removeEventListener('mousedown', handleMouseDown);
            canvas.removeEventListener('mouseup', handleMouseUp);
            canvas.removeEventListener('mouseleave', handleMouseUp);
            canvas.removeEventListener('mousemove', handleMouseMove);
            canvas.removeEventListener('wheel', handleWheel);
            if (animationFrameId.current) {
                cancelAnimationFrame(animationFrameId.current);
            }
        };
    }, [muzaState.cognitiveTrace]);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const blurAmount = (1 - muzaState.coherence) * 5;
        canvas.style.filter = `blur(${blurAmount}px)`;
        canvas.style.transition = 'filter 1s ease-in-out';
    }, [muzaState.coherence]);

    return (
         <div className="w-full h-full glass-panel rounded-xl overflow-hidden bg-slate-900/20">
            <canvas ref={canvasRef} className="w-full h-full cursor-move" />
        </div>
    );
};

export default ImmersiveSpace;