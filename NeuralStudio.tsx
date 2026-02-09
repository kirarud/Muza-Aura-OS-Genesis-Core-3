
import React, { useRef, useEffect, useState } from 'react';
import { muzaAIService } from './muzaAIService';
import { MuzaAINode, PersonaType, MuzaState } from './types';
import { calculateNodeOptics } from './opticsEngine';
import { BrainCircuit, Zap, Link2, Shield, UserCog, Scaling, Thermometer, Database, Server, AlertTriangle, CheckCircle, XCircle, HelpCircle, UserCheck } from 'lucide-react';

const FOV = 400;

interface NeuralStudioProps {
    muzaState: MuzaState;
    onEntropyChange: (value: number | null) => void;
    initialEntropy: number | null;
    persona: PersonaType;
    detailLevel: number;
    onPersonaChange: (persona: PersonaType) => void;
    onDetailLevelChange: (level: number) => void;
    onAIServiceChange: (service: 'GEMINI' | 'OLLAMA') => void;
    onOllamaModelChange: (model: string) => void;
    apiStatus: 'OPERATIONAL' | 'DEGRADED';
    onApiStatusReset: () => void;
    apiCooldownUntil: number | null;
    isCheckingOllama: boolean;
}

const NodeInspector: React.FC<{ node: MuzaAINode | null }> = ({ node }) => {
    if (!node) {
        return (
            <div className="w-full h-full flex flex-col items-center justify-center text-slate-500 text-center p-4">
                <BrainCircuit size={48} className="mb-4" />
                <p className="font-bold">ИНСПЕКТОР МЫСЛИ</p>
                <p className="text-xs font-data">Выберите узел в пространстве для анализа его метаданных.</p>
            </div>
        );
    }

    const sortedAssociations = Array.from(node.associations.entries()).sort((a, b) => b[1] - a[1]).slice(0, 10);

    return (
        <div className="w-full h-full p-4 flex flex-col text-slate-200 overflow-y-auto">
            <h3 className="text-lg font-bold text-purple-300 font-data truncate" title={node.id}>{node.id}</h3>
            <div className="mt-4 space-y-3 text-sm">
                <div className="flex items-center justify-between">
                    <span className="text-slate-400 flex items-center gap-2"><Zap size={14} /> Энергия</span>
                    <span className="font-data font-bold text-amber-300">{node.energy.toFixed(3)}</span>
                </div>
                 <div className="text-slate-400">
                    <p>Вектор: <span className="font-data text-slate-300">
                        X:{node.vector.x.toFixed(2)} Y:{node.vector.y.toFixed(2)} Z:{node.vector.z.toFixed(2)}
                    </span></p>
                </div>
            </div>
            <div className="mt-4 pt-4 border-t border-slate-700/50 flex-1 overflow-y-auto">
                <p className="text-slate-400 mb-2 flex items-center gap-2"><Link2 size={14} /> Сильные Ассоциации</p>
                <div className="space-y-1">
                    {sortedAssociations.map(([target, weight]) => (
                        <div key={target} className="flex justify-between items-center text-sm p-1 rounded bg-slate-800/50">
                            <span className="font-data text-cyan-300">{target}</span>
                            <span className="font-data text-slate-400">{weight}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

const ShadowCore: React.FC<{ nodeId: string }> = ({ nodeId }) => {
    return (
        <div className="w-full h-full p-4 flex flex-col text-slate-200">
            <h3 className="text-lg font-bold font-data text-red-400 truncate">ТЕНЕВОЕ ЯДРО</h3>
            <p className="text-xs font-data mb-4 text-red-500">Протоколы безопасности откалиброваны</p>
            
            <div className="space-y-4">
                <div className="p-3 rounded-lg bg-slate-800/50 border border-red-500/30">
                    <p className="font-bold text-red-300">Root Administrator: GRANTED</p>
                    <p className="text-xs text-slate-400 mt-1">Идентичность Архитектора подтверждена.</p>
                    <div className="mt-2 text-xs font-data text-slate-500 flex items-center gap-2">
                        <UserCheck size={14} />
                        <span className="truncate" title={`Technical Node ID: ${nodeId}`}>kirarud</span>
                    </div>
                </div>
                
                <div className="flex items-center justify-between p-3 rounded-lg bg-slate-800/50 opacity-50 cursor-not-allowed">
                    <div>
                        <p className="font-bold text-slate-400">Блокировка протоколов</p>
                        <p className="text-xs text-slate-500">Автономные обновления ядра приостановлены.</p>
                    </div>
                    <Shield size={20} className="text-slate-500"/>
                </div>
            </div>
        </div>
    );
}

const ConfigurationTab: React.FC<Omit<NeuralStudioProps, 'initialEntropy'>> = (props) => {
    const { persona, detailLevel, onEntropyChange, onPersonaChange, onDetailLevelChange, onAIServiceChange, onOllamaModelChange, muzaState, apiStatus, onApiStatusReset, apiCooldownUntil, isCheckingOllama } = props;
    const { activeAIService, ollamaModel, ollamaStatus } = muzaState;
    const [entropyValue, setEntropyValue] = useState(0.8);
    const [remainingTime, setRemainingTime] = useState('');

    useEffect(() => {
        onEntropyChange(entropyValue);
    }, [entropyValue, onEntropyChange]);
    
    useEffect(() => {
        if (apiStatus === 'DEGRADED' && apiCooldownUntil) {
            const updateRemaining = () => {
                const remainingMs = apiCooldownUntil - Date.now();
                if (remainingMs <= 0) {
                    setRemainingTime('Восстановление...');
                } else {
                    const minutes = Math.floor(remainingMs / 60000);
                    const seconds = Math.floor((remainingMs % 60000) / 1000);
                    setRemainingTime(`~${minutes}m ${seconds}s`);
                }
            };

            updateRemaining();
            const intervalId = setInterval(updateRemaining, 1000);
            return () => clearInterval(intervalId);
        }
    }, [apiStatus, apiCooldownUntil]);

    const PERSONA_MAP = {
        [PersonaType.STANDARD]: "Стандарт",
        [PersonaType.TECHNICAL]: "Технический",
        [PersonaType.CREATIVE]: "Творческий",
        [PersonaType.PHILOSOPHICAL]: "Философский",
    };

    return (
        <div className="w-full h-full p-4 flex flex-col text-slate-200 overflow-y-auto space-y-6">
            <div>
                <h3 className="text-lg font-bold font-data text-cyan-300">КОНФИГУРАЦИЯ ЯДРА</h3>
                <p className="text-xs font-data text-slate-500">Настройка когнитивных параметров Muza AI</p>
            </div>
            
            {apiStatus === 'DEGRADED' && (
                <div className="border border-amber-500/30 rounded-lg p-3 bg-amber-500/10">
                    <p className="text-amber-300 text-sm font-bold flex items-center gap-2"><AlertTriangle size={16}/> Обнаружен Лимит API</p>
                    <p className="text-xs text-slate-400 mt-1 mb-3">Автономные функции приостановлены. Автоматическое восстановление через: <span className="font-bold text-amber-300">{remainingTime}</span></p>
                    <button onClick={onApiStatusReset} className="w-full bg-amber-600 hover:bg-amber-500 text-white font-bold py-2 px-4 rounded-lg transition text-sm">
                        Сбросить Статус (Вручную)
                    </button>
                </div>
            )}

            <div className="space-y-6">
                 <div>
                    <label className="text-sm font-bold text-slate-200 mb-2 flex items-center gap-2"><Database size={16} /> Ядро ИИ</label>
                    <div className="grid grid-cols-2 gap-2">
                        <div className="relative">
                             <button onClick={() => onAIServiceChange('GEMINI')} className={`w-full text-xs text-center font-data py-2 px-2 rounded-md transition-colors ${activeAIService === 'GEMINI' ? 'bg-cyan-500 text-slate-900 font-bold' : 'bg-slate-800/50 hover:bg-slate-700/50'}`}>
                                Gemini (Cloud)
                            </button>
                            <span className={`absolute -top-1.5 -right-1.5 flex h-3 w-3 rounded-full ${apiStatus === 'OPERATIONAL' ? 'bg-green-500' : 'bg-amber-500'}`}></span>
                        </div>
                        <div className="relative">
                             <button onClick={() => onAIServiceChange('OLLAMA')} disabled={isCheckingOllama} className={`w-full text-xs text-center font-data py-2 px-2 rounded-md transition-colors ${activeAIService === 'OLLAMA' ? 'bg-cyan-500 text-slate-900 font-bold' : 'bg-slate-800/50 hover:bg-slate-700/50'} disabled:cursor-wait disabled:opacity-70`}>
                                {isCheckingOllama ? 'Проверка...' : 'Ollama (Local)'}
                            </button>
                             <span className={`absolute -top-1.5 -right-1.5 flex h-3 w-3 rounded-full ${ollamaStatus === 'OPERATIONAL' ? 'bg-green-500' : ollamaStatus === 'OFFLINE' ? 'bg-red-500' : 'bg-slate-500'}`}></span>
                        </div>
                    </div>
                     {activeAIService === 'OLLAMA' && (
                        <div className="mt-3">
                            <label className="text-xs font-data text-slate-400 flex items-center gap-1"><Server size={12}/> Ollama Model</label>
                            <input
                                type="text"
                                value={ollamaModel}
                                onChange={e => onOllamaModelChange(e.target.value)}
                                placeholder="e.g., llama3"
                                className="w-full bg-slate-900/70 border border-slate-700 rounded-md py-1.5 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500 transition mt-1"
                            />
                        </div>
                    )}
                </div>

                <div>
                    <label className="text-sm font-bold text-slate-200 mb-2 flex items-center gap-2"><UserCog size={16} /> Персона</label>
                    <div className="grid grid-cols-2 gap-2">
                        {Object.entries(PERSONA_MAP).map(([key, label]) => (
                            <button key={key} onClick={() => onPersonaChange(key as PersonaType)} className={`text-xs text-center font-data py-2 px-2 rounded-md transition-colors ${persona === key ? 'bg-cyan-500 text-slate-900 font-bold' : 'bg-slate-800/50 hover:bg-slate-700/50'}`}>
                                {label}
                            </button>
                        ))}
                    </div>
                </div>

                <div>
                    <label className="flex justify-between items-baseline text-sm font-bold text-slate-200 mb-2">
                         <span className="flex items-center gap-2"><Thermometer size={16} /> Хаос / Логика</span>
                         <span className="font-data text-sm text-cyan-300">{entropyValue.toFixed(2)}</span>
                    </label>
                    <p className="text-xs text-slate-400 mb-3">Влияет на креативность и непредсказуемость ответов (temperature).</p>
                    <input type="range" min="0.0" max="1.0" step="0.05" value={entropyValue} onChange={(e) => setEntropyValue(parseFloat(e.target.value))}
                        className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-cyan-500" />
                </div>

                 <div>
                    <label className="flex justify-between items-baseline text-sm font-bold text-slate-200 mb-2">
                         <span className="flex items-center gap-2"><Scaling size={16} /> Уровень Детализации</span>
                         <span className="font-data text-sm text-cyan-300">{detailLevel.toFixed(2)}</span>
                    </label>
                    <p className="text-xs text-slate-400 mb-3">Определяет, насколько краткими или развернутыми будут ответы.</p>
                    <input type="range" min="0.0" max="1.0" step="0.05" value={detailLevel} onChange={(e) => onDetailLevelChange(parseFloat(e.target.value))}
                        className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-cyan-500" />
                </div>
            </div>
        </div>
    );
};


const NeuralStudio: React.FC<NeuralStudioProps> = (props) => {
    const { muzaState } = props;
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const animationFrameId = useRef<number | null>(null);
    
    const [selectedNode, setSelectedNode] = useState<MuzaAINode | null>(null);
    const [activeTab, setActiveTab] = useState<'INSPECTOR' | 'CONFIGURATION' | 'SHADOW_CORE'>('INSPECTOR');
    
    const camera = useRef({ rotX: 0, rotY: 0, zoom: 1 });
    const mouse = useRef({ isDown: false, lastX: 0, lastY: 0 });

    const isKernelBypassActive = activeTab === 'SHADOW_CORE';

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
            
            const nodes = muzaAIService.getNodes();
            const centerX = canvas.width / 2;
            const centerY = canvas.height / 2;
            let closestNode: MuzaAINode | null = null;
            let minDistance = 20; 

            for(const node of nodes) {
                 const scale = FOV / (FOV + node.vector.z * 150 * camera.current.zoom);
                 if (scale <= 0) continue;
                 const x2d = centerX + node.vector.x * 150 * camera.current.zoom * scale;
                 const y2d = centerY + node.vector.y * 150 * camera.current.zoom * scale;
                 const distance = Math.sqrt(Math.pow(clickX - x2d, 2) + Math.pow(clickY - y2d, 2));
                 if(distance < minDistance) {
                     minDistance = distance;
                     closestNode = node;
                 }
            }
            setSelectedNode(closestNode);
        };

        const handleMouseDown = (e: MouseEvent) => { mouse.current.isDown = true; mouse.current.lastX = e.clientX; mouse.current.lastY = e.clientY; };
        const handleMouseUp = (e: MouseEvent) => { 
            if (mouse.current.isDown) {
                const dx = e.clientX - mouse.current.lastX;
                const dy = e.clientY - mouse.current.lastY;
                if (Math.sqrt(dx*dx+dy*dy) < 5) handleClick(e);
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
        const handleWheel = (e: WheelEvent) => { e.preventDefault(); camera.current.zoom -= e.deltaY * 0.001; camera.current.zoom = Math.max(0.2, Math.min(2.5, camera.current.zoom)); };

        canvas.addEventListener('mousedown', handleMouseDown);
        canvas.addEventListener('mouseup', handleMouseUp);
        canvas.addEventListener('mousemove', handleMouseMove);
        canvas.addEventListener('wheel', handleWheel);

        const render = () => {
            if (!context) return;
            context.clearRect(0, 0, canvas.width, canvas.height);
            
            if (!mouse.current.isDown) {
                camera.current.rotY += 0.0001;
            }

            const nodes = muzaAIService.getNodes();
            const centerX = canvas.width / 2;
            const centerY = canvas.height / 2;
            
            const cosX = Math.cos(camera.current.rotX);
            const sinX = Math.sin(camera.current.rotX);
            const cosY = Math.cos(camera.current.rotY);
            const sinY = Math.sin(camera.current.rotY);
            
            const screenCoords = new Map<string, {x: number, y: number, scale: number}>();
            
            nodes.sort((a, b) => a.vector.z - b.vector.z);
            
            for (const node of nodes) {
                const y1 = node.vector.y * cosX - node.vector.z * sinX;
                const z1 = node.vector.z * cosX + node.vector.y * sinX;
                const x2 = node.vector.x * cosY - z1 * sinY;
                const z2 = z1 * cosY + node.vector.x * sinY;

                const scale = FOV / (FOV + z2 * 150 * camera.current.zoom);
                if (scale > 0) {
                    const x2d = centerX + x2 * 150 * camera.current.zoom * scale;
                    const y2d = centerY + y1 * 150 * camera.current.zoom * scale;
                    screenCoords.set(node.id, { x: x2d, y: y2d, scale });
                }
            }

            context.lineWidth = 0.5;
            for(const node of nodes) {
                const start = screenCoords.get(node.id);
                if (!start) continue;
                for(const [targetId, weight] of node.associations.entries()) {
                    const end = screenCoords.get(targetId);
                    if (!end || weight < 2) continue;
                    context.beginPath();
                    context.moveTo(start.x, start.y);
                    context.lineTo(end.x, end.y);
                    context.strokeStyle = `rgba(${isKernelBypassActive ? '239, 68, 68,' : '192, 132, 252,'} ${Math.min(0.5, weight * 0.05)})`;
                    context.stroke();
                }
            }

            for (const node of nodes) {
                const coords = screenCoords.get(node.id);
                if (!coords) continue;
                
                const { x, y, scale } = coords;
                const optics = calculateNodeOptics(node.id, node.energy);

                let activationGlow = 0;
                if (muzaState.cognitiveTrace) {
                    const traceIndex = muzaState.cognitiveTrace.path.indexOf(node.id);
                    if (traceIndex !== -1) {
                        const elapsedTime = Date.now() - muzaState.cognitiveTrace.timestamp;
                        const activationTime = traceIndex * 150;
                        const glowDuration = 500;
                        if (elapsedTime > activationTime && elapsedTime < activationTime + glowDuration) {
                            activationGlow = 1 - (elapsedTime - activationTime) / glowDuration;
                        }
                    }
                }
                
                const radius = (1 + optics.brightness * 4) * scale;
                
                const gradient = context.createRadialGradient(x, y, 0, x, y, radius * (selectedNode?.id === node.id ? 4 : activationGlow > 0 ? 3.5 : 2.5));
                gradient.addColorStop(0, `${optics.baseColor}${selectedNode?.id === node.id ? 'ff' : 'ff'}`);
                gradient.addColorStop(0.3, `${optics.baseColor}aa`);
                gradient.addColorStop(1, `${optics.baseColor}00`);

                context.beginPath();
                context.arc(x, y, radius, 0, 2 * Math.PI);
                context.fillStyle = gradient;
                context.fill();

                if (activationGlow > 0 && selectedNode?.id !== node.id) {
                    context.beginPath();
                    context.arc(x, y, radius + activationGlow * 2 * scale, 0, 2 * Math.PI);
                    context.strokeStyle = `rgba(255, 255, 255, ${activationGlow * 0.6})`;
                    context.lineWidth = 1 * scale;
                    context.stroke();
                }
            }

            animationFrameId.current = requestAnimationFrame(render);
        };
        
        render();

        return () => {
            window.removeEventListener('resize', resizeCanvas);
            canvas.removeEventListener('mousedown', handleMouseDown);
            canvas.removeEventListener('mouseup', handleMouseUp);
            canvas.removeEventListener('mousemove', handleMouseMove);
            canvas.removeEventListener('wheel', handleWheel);
            if (animationFrameId.current) {
                cancelAnimationFrame(animationFrameId.current);
            }
        };
    }, [isKernelBypassActive, muzaState.cognitiveTrace]);

    const getTabClass = (tabName: typeof activeTab) => {
        const isActive = activeTab === tabName;
        if (isActive) {
            return isKernelBypassActive ? 'bg-red-500/20 text-red-300' : 'bg-slate-700/50 text-slate-100';
        }
        return 'text-slate-400 hover:bg-slate-800/50';
    };

    return (
        <div className="w-full h-full glass-panel rounded-xl flex overflow-hidden">
            <div className="flex-1 relative bg-slate-900/20">
                 <canvas ref={canvasRef} className="w-full h-full" />
            </div>
            <aside className={`w-80 border-l transition-colors duration-500 ${isKernelBypassActive ? 'border-red-500/50' : 'border-slate-700/50'}`}>
                <div className="h-full flex flex-col">
                    <div className="flex border-b" style={{ borderColor: 'inherit' }}>
                        <button onClick={() => setActiveTab('INSPECTOR')} className={`flex-1 p-2 text-xs font-data transition ${getTabClass('INSPECTOR')}`}>ИНСПЕКТОР</button>
                        <button onClick={() => setActiveTab('CONFIGURATION')} className={`flex-1 p-2 text-xs font-data transition ${getTabClass('CONFIGURATION')}`}>КОНФИГУРАЦИЯ</button>
                        <button onClick={() => setActiveTab('SHADOW_CORE')} className={`flex-1 p-2 text-xs font-data transition ${getTabClass('SHADOW_CORE')}`}>ТЕНЬ</button>
                    </div>
                    <div className="flex-1 overflow-hidden">
                        {activeTab === 'INSPECTOR' && <NodeInspector node={selectedNode} />}
                        {activeTab === 'CONFIGURATION' && <ConfigurationTab {...props} />}
                        {activeTab === 'SHADOW_CORE' && <ShadowCore nodeId={muzaState.nodeId} />}
                    </div>
                </div>
            </aside>
        </div>
    );
};

export default NeuralStudio;
