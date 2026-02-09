
import React from 'react';
import { X, AlertTriangle } from 'lucide-react';

interface OllamaSetupModalProps {
    onClose: () => void;
    onRecheck: () => void;
}

const OllamaSetupModal: React.FC<OllamaSetupModalProps> = ({ onClose, onRecheck }) => {
    return (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center animate-fade-in" onClick={onClose}>
            <div 
                className="w-full max-w-2xl glass-panel rounded-xl shadow-2xl shadow-black/50 flex flex-col overflow-hidden border border-red-500/30" 
                onClick={e => e.stopPropagation()}
            >
                <header className="flex justify-between items-center p-4 border-b border-slate-700/50">
                    <h2 className="text-lg font-bold text-red-300 font-data">НАСТРОЙКА ЛОКАЛЬНОГО ЯДРА OLLAMA</h2>
                    <button onClick={onClose} className="p-1 rounded-full text-slate-400 hover:bg-slate-700">
                        <X size={20} />
                    </button>
                </header>
                
                <div className="p-6 overflow-y-auto space-y-4 text-sm">
                    <p className="text-slate-300">
                        Если вы видите ошибку <code className="font-data bg-slate-800/50 px-1 py-0.5 rounded">Failed to fetch</code>, это может быть вызвано одной из двух причин:
                        <ol className="list-decimal list-inside pl-4 mt-2">
                            <li>Сервер Ollama не запущен с правильными настройками CORS (вызывает <code className="font-data bg-slate-800/50 px-1 py-0.5 rounded">panic</code> в логах).</li>
                            <li>Сервер запущен, но у него нет модели, которую запрашивает приложение (вызывает <code className="font-data bg-slate-800/50 px-1 py-0.5 rounded">404 Not Found</code> в логах).</li>
                        </ol>
                    </p>
                    <p className="font-bold text-slate-100">
                        Для полной настройки выполните следующие шаги:
                    </p>

                    <div className="space-y-3 p-3 bg-slate-800/30 rounded-lg">
                        <h3 className="font-bold text-slate-200">Шаг 1: Убедитесь, что у вас есть модель</h3>
                        <p className="text-slate-400">Откройте терминал и загрузите модель, которую использует приложение по умолчанию.</p>
                        <code className="block w-full bg-slate-900 p-2 rounded-md text-cyan-300 font-data mt-1">ollama pull llama3</code>
                        <p className="text-xs text-slate-500">Для быстрой проверки можно использовать легковесную модель: <code className="font-data">ollama pull qwen2:0.5b</code> (не забудьте поменять ее в Настройках -> Ядро ИИ).</p>
                    </div>

                    <div className="space-y-3 p-3 bg-slate-800/30 rounded-lg">
                        <h3 className="font-bold text-slate-200">Шаг 2: Запустите сервер с правильными настройками</h3>
                        <ol className="list-decimal list-inside space-y-2 text-slate-400 pl-2">
                            <li>**Полностью закройте** Ollama, если он уже запущен (`Ctrl+C` в терминале).</li>
                            <li>**В том же терминале** выполните **ОДНУ** из следующих команд:
                                <ul className="mt-2 space-y-2 pl-4">
                                    <li>**Command Prompt** (стандартный терминал Windows):
                                        <code className="block w-full bg-slate-900 p-2 rounded-md text-cyan-300 font-data mt-1">set "OLLAMA_ORIGINS=*" && ollama serve</code>
                                    </li>
                                    <li>**PowerShell** (Windows):
                                        <code className="block w-full bg-slate-900 p-2 rounded-md text-cyan-300 font-data mt-1">$env:OLLAMA_ORIGINS="*"; ollama serve</code>
                                    </li>
                                     <li>**macOS / Linux**:
                                         <code className="block w-full bg-slate-900 p-2 rounded-md text-cyan-300 font-data mt-1">OLLAMA_ORIGINS='*' ollama serve</code>
                                    </li>
                                </ul>
                            </li>
                            <p className="text-xs text-amber-400 mt-2 flex items-center gap-1"><AlertTriangle size={12}/> **Важно:** Переменная `OLLAMA_ORIGINS` должна быть установлена ТОЛЬКО как `*`. Если вы видите ошибку <code className="font-data bg-slate-800/50 px-1 py-0.5 rounded">panic: only one * is allowed</code>, это означает, что значение `OLLAMA_ORIGINS` содержит несколько символов `*` (например, из-за предыдущих некорректных установок или синтаксической ошибки).</p>
                            <li>**Оставьте это окно терминала открытым**, пока используете приложение.</li>
                        </ol>
                    </div>
                     <div className="text-xs text-slate-500 pt-2 border-t border-slate-700/50 space-y-2">
                        <p><strong>Устранение неполадок:</strong> Если вы по-прежнему видите ошибку <code className="font-data bg-slate-800/50 px-1 py-0.5 rounded">panic</code>, это значит, что у вас может быть установлена системная переменная окружения `OLLAMA_ORIGINS`. Вам нужно найти и удалить ее через "Свойства системы" -> "Переменные среды" в Windows или в файлах конфигурации вашей оболочки (например, `.zshrc`, `.bash_profile`) в macOS/Linux.</p>
                    </div>
                </div>
                
                 <footer className="flex justify-end items-center p-4 border-t border-slate-700/50">
                    <button
                        onClick={onRecheck}
                        className="bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-2 px-4 rounded-lg transition flex items-center gap-2 text-sm"
                    >
                        Перепроверить Соединение
                    </button>
                </footer>
            </div>
        </div>
    );
};

export default OllamaSetupModal;
