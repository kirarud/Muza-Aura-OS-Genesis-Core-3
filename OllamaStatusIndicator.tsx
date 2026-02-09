
import React from 'react';
import { Server, AlertTriangle, CheckCircle, HelpCircle } from 'lucide-react';

interface OllamaStatusIndicatorProps {
    status: 'UNKNOWN' | 'OPERATIONAL' | 'OFFLINE';
    onClick: () => void;
}

const OllamaStatusIndicator: React.FC<OllamaStatusIndicatorProps> = ({ status, onClick }) => {
    const getStatusInfo = () => {
        switch (status) {
            case 'OPERATIONAL':
                return { text: 'ЛОК. ЯДРО: ОНЛАЙН', color: 'text-green-400', icon: <CheckCircle size={12} />, animation: '' };
            case 'OFFLINE':
                return { text: 'ЛОК. ЯДРО: ОФФЛАЙН', color: 'text-red-400', icon: <AlertTriangle size={12} />, animation: 'animate-pulse' };
            case 'UNKNOWN':
            default:
                return { text: 'ЛОК. ЯДРО: ПРОВЕРКА...', color: 'text-slate-400', icon: <HelpCircle size={12} />, animation: 'animate-pulse' };
        }
    };

    const { text, color, icon, animation } = getStatusInfo();

    return (
        <button 
            onClick={onClick}
            className={`flex flex-col items-center min-w-[100px] cursor-pointer ${animation}`}
            title="Нажмите, чтобы настроить локальное ядро Ollama"
        >
            <span className="text-xs font-data text-slate-400 mb-1">OLLAMA</span>
            <span className={`font-bold font-data flex items-center gap-1 ${color}`}>
                {icon} {text.split(': ')[1]}
            </span>
        </button>
    );
};

export default OllamaStatusIndicator;
