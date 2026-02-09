
import React, { useState, useEffect, useRef } from 'react';
import { codeExecutor } from './codeExecutor';
import { muzaAIService } from './muzaAIService';
import { GenesisPatch, ContainerStatus, ExecutorLog, MuzaState, EventLog } from './types';
import { Terminal, Play, Trash2, Save, CheckCircle, StopCircle, Share2, CornerDownLeft, GitCommitHorizontal } from 'lucide-react';

interface CodeLabProps {
    onCodeRun: () => void;
    onNeuralCommit: (patch: GenesisPatch) => void;
    initialCode: string;
    muzaState: MuzaState;
    addEvent: (type: EventLog['type'], description: string) => void;
    onScriptedDream: (prompt: string) => Promise<string | null>;
    onScriptedReflection: (context?: string) => Promise<string | null>;
}

const ContainerStatusDisplay: React.FC<{ status: ContainerStatus, id: string | null, uptime: number }> = ({ status, id, uptime }) => {
    const formatUptime = (s: number) => new Date(s * 1000).toISOString().substr(11, 8);
    const [cpuUsage, setCpuUsage] = useState(0);
    const [memUsage, setMemUsage] = useState(0);

    const getStatusInfo = () => {
        switch(status) {
            case ContainerStatus.IDLE: return { text: 'ОЖИДАНИЕ', color: 'text-slate-400' };
            case ContainerStatus.COMPILING: return { text: 'КОМПИЛЯЦИЯ...', color: 'text-amber-400' };
            case ContainerStatus.RUNNING: return { text: 'АКТИВЕН', color: 'text-green-400' };
            case ContainerStatus.ERROR: return { text: 'СБОЙ ЯДРА', color: 'text-red-400' };
        }
    };
    const statusInfo = getStatusInfo();

    useEffect(() => {
        let interval: number | null = null;
        if (status === ContainerStatus.RUNNING) {
            interval = window.setInterval(() => {
                setCpuUsage(Math.random() * 40 + 20);
                setMemUsage(Math.random() * 30 + 50);
            }, 1000);
        } else {
            setCpuUsage(0);
            setMemUsage(0);
        }
        return () => {
            if (interval) clearInterval(interval);
        };
    }, [status]);


    return (
        <div className="flex-1 w-full bg-slate-900/70 border border-slate-700 rounded-lg p-4 font-data text-xs flex flex-col">
            <div className="flex justify-between items-center border-b border-slate-700/50 pb-2 mb-3">
                <p className="font-bold text-slate-300">СТАТУС КОНТЕЙНЕРА</p>
                <div className={`flex items-center gap-2 font-bold ${statusInfo.color}`}>
                    {status === ContainerStatus.COMPILING && <div className="w-3 h-3 border-2 border-amber-400 border-t-transparent rounded-full animate-spin"></div>}
                    <span>{statusInfo.text}</span>
                </div>
            </div>
            {id ? (
                <div className="space-y-3 flex-1 flex flex-col justify-between">
                    <div>
                        <p><span className="text-slate-500">ID:</span> {id}</p>
                        <p><span className="text-slate-500">UPTIME:</span> {formatUptime(uptime)}</p>
                    </div>
                    <div className="space-y-2">
                        <div>
                            <p className="text-slate-500 text-xs mb-1">CPU</p>
                            <div className="w-full bg-slate-700/50 rounded-full h-1.5"><div className="bg-cyan-500 h-1.5 rounded-full" style={{ width: `${cpuUsage}%`, transition: 'width 0.5s ease-in-out' }}></div></div>
                        </div>
                        <div>
                            <p className="text-slate-500 text-xs mb-1">MEM</p>
                            <div className="w-full bg-slate-700/50 rounded-full h-1.5"><div className="bg-purple-500 h-1.5 rounded-full" style={{ width: `${memUsage}%`, transition: 'width 0.5s ease-in-out' }}></div></div>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="flex-1 flex items-center justify-center text-slate-600">
                    <p>Контейнер не запущен.</p>
                </div>
            )}
        </div>
    );
};

const CodeLab: React.FC<CodeLabProps> = ({ onCodeRun, onNeuralCommit, initialCode, muzaState, addEvent, onScriptedDream, onScriptedReflection }) => {
    const [code, setCode] = useState(initialCode || `// Скрипт для автоматической генерации сна\nmuza.log('Запускаю протокол сновидения...');\n\nconst artifactId = await muza.generateDream('электрическая овца в неоновом поле');\n\nif (artifactId) {\n  muza.log(\`Сон сгенерирован: \${artifactId}\`);\n  return { success: true, artifactId };\n} else {\n  muza.log('Генерация сна не удалась.');\n  return { success: false };\n}`);
    const [output, setOutput] = useState<ExecutorLog[]>([]);
    const [isRunning, setIsRunning] = useState(false);
    const [isGlitching, setIsGlitching] = useState(false);
    const [commitStatus, setCommitStatus] = useState<'IDLE' | 'SUCCESS'>('IDLE');
    const [containerStatus, setContainerStatus] = useState<ContainerStatus>(ContainerStatus.IDLE);
    const [containerId, setContainerId] = useState<string | null>(null);
    const [containerUptime, setContainerUptime] = useState(0);
    const uptimeIntervalRef = useRef<number | null>(null);
    
    useEffect(() => {
        if (initialCode) {
            setCode(initialCode);
        }
    }, [initialCode]);

    useEffect(() => {
        if (containerStatus === ContainerStatus.RUNNING) {
            uptimeIntervalRef.current = window.setInterval(() => {
                setContainerUptime(prev => prev + 1);
            }, 1000);
        } else {
            if (uptimeIntervalRef.current) {
                clearInterval(uptimeIntervalRef.current);
                uptimeIntervalRef.current = null;
            }
            if (containerStatus !== ContainerStatus.COMPILING) {
                setContainerUptime(0);
            }
        }
        return () => {
            if (uptimeIntervalRef.current) clearInterval(uptimeIntervalRef.current);
        };
    }, [containerStatus]);

    const handleRun = async () => {
        setIsRunning(true);
        setContainerStatus(ContainerStatus.COMPILING);
        setContainerId(`gen-контейнер-${Math.random().toString(36).substring(2, 8)}`);
        
        const newOutput: ExecutorLog[] = [];
        const pushLog = (log: ExecutorLog) => newOutput.push(log);
        setOutput([]);
        
        const muzaAPI = {
            log: (...args: any[]) => {
                 const content = args.map(arg => typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)).join(' ');
                 pushLog({ type: 'kernel', content });
            },
            getState: async () => {
                return {
                    level: muzaState.progression.level,
                    xp: muzaState.progression.xp,
                    energy: muzaState.energyLevel,
                    coherence: muzaState.coherence,
                    emotion: muzaState.activeEmotion,
                };
            },
            addEvent: (description: string) => {
                if(typeof description === 'string' && description.trim() !== '') {
                    addEvent('SCRIPTED_EVENT', description);
                }
            },
            generateDream: async (prompt: string): Promise<string | null> => {
                muzaAPI.log(`[kernel] Запрос на генерацию сна: "${prompt}"`);
                const artifactId = await onScriptedDream(prompt);
                if (artifactId) {
                    muzaAPI.log(`[kernel] Сон успешно сгенерирован. ID: ${artifactId}`);
                } else {
                    muzaAPI.log(`[kernel] Ошибка: Не удалось сгенерировать сон. Проверьте энергию ядра.`);
                }
                return artifactId;
            },
            reflect: async (context?: string): Promise<string | null> => {
                 muzaAPI.log(`[kernel] Запрос на рефлексию...`);
                 const messageId = await onScriptedReflection(context);
                 if(messageId) {
                    muzaAPI.log(`[kernel] Рефлексия завершена. ID сообщения: ${messageId}`);
                 } else {
                     muzaAPI.log(`[kernel] Ошибка: Рефлексия не удалась.`);
                 }
                 return messageId;
            }
        };

        await new Promise(resolve => setTimeout(resolve, 1500));
        
        const result = await codeExecutor.execute(code, muzaAPI);
        
        setOutput([...newOutput, ...result.logs]);

        if (result.error) {
            setContainerStatus(ContainerStatus.ERROR);
            setIsGlitching(true);
            setTimeout(() => setIsGlitching(false), 500);
            setIsRunning(false);
        } else {
            const isBridge = result.logs.some(log => log.type === 'bridge');
            if (isBridge) {
                handleStop();
            } else {
                setContainerStatus(ContainerStatus.RUNNING);
                onCodeRun();
                muzaAIService.learn(code);
            }
        }
    };
    
    const handleStop = () => {
        setIsRunning(false);
        setContainerStatus(ContainerStatus.IDLE);
        setContainerId(null);
    };

    const handleCommit = () => {
        const description = window.prompt("Введите краткое описание этого патча генезиса:");
        if (description && description.trim() !== "") {
            const newPatch: GenesisPatch = {
                id: `patch-${Date.now()}`,
                timestamp: Date.now(),
                code,
                description: description.trim(),
            };
            onNeuralCommit(newPatch);
            setCommitStatus('SUCCESS');
            setTimeout(() => setCommitStatus('IDLE'), 3000);
        }
    };

    const handleClear = () => {
        setOutput([]);
    };
    
    const renderLogLine = (log: ExecutorLog, index: number) => {
        switch(log.type) {
            case 'log':
                return <pre key={index} className="text-slate-300 whitespace-pre-wrap animate-fade-in"><span className="text-slate-500 mr-2">&gt;</span>{log.content}</pre>;
            case 'error':
                 return <pre key={index} className="text-red-400 whitespace-pre-wrap animate-fade-in">[ERROR] {log.content}</pre>;
            case 'bridge':
                return (
                    <div key={index} className="text-purple-400 flex items-start gap-2 animate-fade-in">
                        <Share2 size={14} className="mt-0.5 flex-shrink-0" />
                        <span>{log.content}</span>
                    </div>
                );
            case 'kernel':
                return (
                     <div key={index} className="text-purple-300 flex items-start gap-2 animate-fade-in">
                        <GitCommitHorizontal size={14} className="mt-0.5 flex-shrink-0" />
                        <pre className="whitespace-pre-wrap">{log.content}</pre>
                    </div>
                );
            case 'return':
                return (
                     <div key={index} className="text-green-400 flex items-start gap-2 animate-fade-in">
                        <CornerDownLeft size={14} className="mt-0.5 flex-shrink-0" />
                        <pre className="whitespace-pre-wrap">{log.content}</pre>
                    </div>
                );
            default:
                return null;
        }
    }

    const containerGlow = containerStatus === ContainerStatus.RUNNING ? 'shadow-lg shadow-green-500/20' : '';

    return (
        <div className={`w-full h-full glass-panel rounded-xl p-6 flex flex-col text-slate-200 overflow-hidden transition-all duration-500 ${isGlitching ? 'logic-glitch' : ''} ${containerGlow}`}>
            <h2 className="text-xl font-bold font-data text-green-400 border-b border-green-400/20 pb-2 mb-4 flex items-center gap-2">
                <Terminal size={20} /> КОДЛАБ ГЕНЕЗИСА
            </h2>
            <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-4 overflow-hidden">
                {/* Code Editor */}
                <div className="flex flex-col h-full">
                    <div className="flex justify-between items-center mb-2">
                        <p className="text-sm font-data text-slate-400">Редактор Манифестации</p>
                        <div className="flex items-center gap-2">
                             <button onClick={handleCommit} disabled={isRunning} className="flex items-center gap-1 text-sm bg-purple-600/80 hover:bg-purple-500/80 text-white font-bold py-1 px-3 rounded-md transition disabled:opacity-50 disabled:cursor-not-allowed">
                                <Save size={14} />
                                <span>Коммит</span>
                            </button>
                            {containerStatus === ContainerStatus.RUNNING ? (
                                <button onClick={handleStop} className="flex items-center gap-1 text-sm bg-red-600/80 hover:bg-red-500/80 text-white font-bold py-1 px-3 rounded-md transition">
                                    <StopCircle size={14} />
                                    <span>Стоп</span>
                                </button>
                            ) : (
                                <button onClick={handleRun} disabled={isRunning} className="flex items-center gap-1 text-sm bg-green-600/80 hover:bg-green-500/80 text-white font-bold py-1 px-3 rounded-md transition disabled:bg-slate-600 disabled:cursor-not-allowed">
                                    {isRunning ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : <Play size={14} />}
                                    <span>{isRunning ? 'Компиляция...' : 'Манифест'}</span>
                                </button>
                            )}
                        </div>
                    </div>
                    <textarea
                        value={code}
                        onChange={(e) => setCode(e.target.value)}
                        className="flex-1 w-full bg-slate-900/70 border border-slate-700 rounded-lg p-4 font-data text-sm text-cyan-300 focus:outline-none focus:ring-2 focus:ring-green-500 transition resize-none"
                        spellCheck="false"
                    />
                </div>

                {/* Right Panel: Output & Status */}
                <div className="flex flex-col h-full gap-4">
                    <div className="flex flex-col h-1/2">
                         <div className="flex justify-between items-center mb-2">
                            <p className="text-sm font-data text-slate-400">Терминал Вортекс</p>
                             <button onClick={handleClear} className="flex items-center gap-1 text-sm text-slate-400 hover:text-white">
                                <Trash2 size={14} />
                                <span>Очистить</span>
                            </button>
                        </div>
                        <div className="flex-1 w-full bg-slate-900/70 border border-slate-700 rounded-lg p-4 font-data text-xs overflow-y-auto space-y-2">
                            {commitStatus === 'SUCCESS' && (
                                <div className="text-purple-400 flex items-center gap-2 mb-2 animate-fade-in">
                                    <CheckCircle size={14} />
                                    <span>Патч генезиса успешно зафиксирован в ядре.</span>
                                </div>
                            )}
                            {output.map(renderLogLine)}
                        </div>
                    </div>
                    <div className="flex flex-col h-1/2">
                        <ContainerStatusDisplay status={containerStatus} id={containerId} uptime={containerUptime} />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CodeLab;
