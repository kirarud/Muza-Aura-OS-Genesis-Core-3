
import React, { useState } from 'react';
import { Artifact } from './types';
import { X, Zap, Loader } from 'lucide-react';

interface DreamFusionProps {
    artifacts: [Artifact, Artifact];
    onClose: () => void;
    onFuse: (prompt: string) => Promise<void>;
}

const DreamFusion: React.FC<DreamFusionProps> = ({ artifacts, onClose, onFuse }) => {
    const [prompt, setPrompt] = useState('');
    const [isFusing, setIsFusing] = useState(false);

    const handleFuse = async () => {
        if (!prompt.trim()) {
            alert('Пожалуйста, введите директиву для слияния.');
            return;
        }
        setIsFusing(true);
        await onFuse(prompt);
        setIsFusing(false);
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center animate-fade-in" onClick={onClose}>
            <div className="w-full max-w-3xl glass-panel rounded-xl shadow-2xl shadow-black/50 flex flex-col overflow-hidden border border-cyan-500/30" onClick={e => e.stopPropagation()}>
                <header className="flex justify-between items-center p-4 border-b border-slate-700/50">
                    <h2 className="text-lg font-bold text-cyan-300 font-data">СТУДИЯ СПЛЕТЕНИЯ СНОВ</h2>
                    <button onClick={onClose} className="p-1 rounded-full text-slate-400 hover:bg-slate-700">
                        <X size={20} />
                    </button>
                </header>

                <div className="p-6 space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <img src={artifacts[0].src} alt="Artifact 1" className="rounded-lg aspect-video object-cover border-2 border-slate-700" />
                        <img src={artifacts[1].src} alt="Artifact 2" className="rounded-lg aspect-video object-cover border-2 border-slate-700" />
                    </div>
                    <div>
                        <label className="text-xs font-data text-slate-400">ДИРЕКТИВА СЛИЯНИЯ</label>
                        <textarea
                            value={prompt}
                            onChange={e => setPrompt(e.target.value)}
                            placeholder="Например: объединить стиль первого сна с объектами второго, или создать мир, где существуют оба..."
                            rows={3}
                            className="w-full bg-slate-900/70 border border-slate-700 rounded-md py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500 transition mt-1 resize-none"
                        />
                    </div>
                </div>

                <footer className="flex justify-end items-center p-4 border-t border-slate-700/50">
                    <button
                        onClick={handleFuse}
                        disabled={isFusing}
                        className="bg-cyan-600 hover:bg-cyan-500 disabled:bg-slate-600 text-white font-bold py-2 px-4 rounded-lg transition flex items-center gap-2 text-sm"
                    >
                        {isFusing ? <Loader size={16} className="animate-spin" /> : <Zap size={16} />}
                        {isFusing ? 'Слияние...' : 'Сплести Сны'}
                    </button>
                </footer>
            </div>
        </div>
    );
};

export default DreamFusion;
