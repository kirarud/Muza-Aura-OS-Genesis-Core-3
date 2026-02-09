
import { ExecutorLog } from './types';

const BRIDGE_DIRECTIVE = '// @bridge(python)';

class CodeExecutor {
    public async execute(code: string, muzaAPI: object): Promise<{ logs: ExecutorLog[], error: string | null }> {
        const logs: ExecutorLog[] = [];

        if (code.trim().startsWith(BRIDGE_DIRECTIVE)) {
            try {
                const pythonCode = code.substring(code.indexOf(BRIDGE_DIRECTIVE) + BRIDGE_DIRECTIVE.length).trim();
                const bridgePacket = {
                    protocol: "MUZA_BRIDGE_V1",
                    language: "python",
                    code: pythonCode,
                };
                const packetString = JSON.stringify(bridgePacket, null, 2);
                await navigator.clipboard.writeText(packetString);
                logs.push({
                    type: 'bridge',
                    content: 'Протокол "Фантомный Мост" активирован. Пакет Python скопирован в буфер обмена для исполнения в локальной среде.'
                });
                return { logs, error: null };
            } catch (e: any) {
                return { logs, error: `Ошибка Фантомного Моста: ${e.message}` };
            }
        }
        
        // Standard JS execution
        const customConsole = {
            log: (...args: any[]) => {
                const content = args.map(arg => {
                    try {
                        if (typeof arg === 'object' && arg !== null) return JSON.stringify(arg, null, 2);
                        return String(arg);
                    } catch {
                        return '[Unserializable Object]';
                    }
                }).join(' ');
                logs.push({ type: 'log', content });
            }
        };

        const tempConsole = { ...window.console, log: customConsole.log };

        try {
            const asyncFunction = new Function('muza', 'console', `return (async () => { ${code} })()`);
            const returnValue = await asyncFunction(muzaAPI, tempConsole);
            
            if (returnValue !== undefined) {
                 const content = typeof returnValue === 'object' ? JSON.stringify(returnValue, null, 2) : String(returnValue);
                 logs.push({ type: 'return', content });
            }

            return { logs, error: null };
        } catch (e: any) {
            logs.push({ type: 'error', content: e.message });
            return { logs, error: e.message };
        }
    }
}

export const codeExecutor = new CodeExecutor();
