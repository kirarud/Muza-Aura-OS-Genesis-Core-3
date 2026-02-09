
import React, { useState } from 'react';
import { Artifact } from './types';
import { X, Save, Trash2, Copy, Check, Maximize } from 'lucide-react';
import FullscreenImageViewer from './FullscreenImageViewer';

interface DreamStudioProps {
    artifact: Artifact;
    onClose: () => void;
    onSave: (updatedArtifact: Artifact) => void;
    onDelete: (artifactId: string) => void;
}

const DreamStudio: React.FC<DreamStudioProps> = ({ artifact, onClose, onSave, onDelete }) => {
    const [title, setTitle] = useState(artifact.title || '');
    const [notes, setNotes] = useState(artifact.notes || '');
    const [copied, setCopied] = useState(false);
    const [isFullscreen, setIsFullscreen] = useState(false);

    const handleSave = () => {
        onSave({ ...artifact, title, notes });
        onClose();
    };

    const handleDelete = () => {
        if (window.confirm('Вы уверены, что хотите стереть этот сон? Это действие необратимо.')) {
            onDelete(artifact.id);
            onClose();
        }
    };

    const handleCopySeed = () => {
        navigator.clipboard.writeText(artifact.seed);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <>
            {isFullscreen && <FullscreenImageViewer src={artifact.src} onClose={() => setIsFullscreen(false)} />}
            <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center animate-fade-in" onClick={onClose}>
                <div className="w-full max-w-4xl h-full max-h-[90vh] glass-panel rounded-xl shadow-2xl shadow-black/50 flex flex-col overflow-hidden border border-fuchsia-500/30" onClick={e => e.stopPropagation()}>
                    <header className="flex justify-between items-center p-4 border-b border-slate-700/50">
                        <h2 className="text-lg font-bold text-fuchsia-300 font-data">СТУДИЯ СНА</h2>
                        <button onClick={onClose} className="p-1 rounded-full text-slate-400 hover:bg-slate-700">
                            <X size={20} />
                        </button>
                    </header>
                    
                    <div className="flex-1 flex overflow-hidden">
                        <div className="w-2/3 p-4 relative group">
                            <img src={artifact.src} alt={artifact.seed} className="w-full h-full object-contain" />
                            <button 
                                onClick={() => setIsFullscreen(true)} 
                                className="absolute top-2 right-2 p-2 bg-slate-900/50 rounded-full text-slate-300 opacity-0 group-hover:opacity-100 transition-all hover:bg-slate-800 hover:text-white"
                                title="Открыть во весь экран"
                            >
                                <Maximize size={16} />
                            </button>
                        </div>
                        <div className="w-1/3 p-4 border-l border-slate-700/50 flex flex-col space-y-4 overflow-y-auto">
                            <div>
                                <label className="text-xs font-data text-slate-400">НАЗВАНИЕ</label>
                                <input
                                    type="text"
                                    value={title}
                                    onChange={e => setTitle(e.target.value)}
                                    placeholder="Без названия"
                                    className="w-full bg-slate-900/70 border border-slate-700 rounded-md py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-fuchsia-500 transition mt-1"
                                />
                            </div>
                            <div>
                                <label className="text-xs font-data text-slate-400">ЗАМЕТКИ</label>
                                <textarea
                                    value={notes}
                                    onChange={e => setNotes(e.target.value)}
                                    placeholder="Ваши мысли об этом сне..."
                                    rows={5}
                                    className="w-full bg-slate-900/70 border border-slate-700 rounded-md py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-fuchsia-500 transition mt-1 resize-none"
                                />
                            </div>
                            <div>
                                <label className="text-xs font-data text-slate-400">СИД ГЕНЕРАЦИИ</label>
                                <div className="relative mt-1">
                                    <p className="w-full bg-slate-900/70 border border-slate-700 rounded-md p-3 text-sm text-slate-300 font-data pr-10">{artifact.seed}</p>
                                    <button onClick={handleCopySeed} className="absolute top-1/2 right-2 -translate-y-1/2 p-1 text-slate-400 hover:text-white">
                                        {copied ? <Check size={16} className="text-green-400" /> : <Copy size={16} />}
                                    </button>
                                </div>
                            </div>
                            <div className="text-xs font-data text-slate-500 space-y-1">
                                <p>ТИП: {artifact.type}</p>
                                <p>ID: {artifact.id}</p>
                                <p>ВРЕМЯ: {new Date(artifact.timestamp).toLocaleString()}</p>
                                {artifact.parentIds && <p>РОДИТЕЛИ: #{artifact.parentIds[0].slice(-6)}, #{artifact.parentIds[1].slice(-6)}</p>}
                            </div>
                        </div>
                    </div>

                    <footer className="flex justify-end items-center p-4 border-t border-slate-700/50 gap-4">
                        <button onClick={handleDelete} className="text-red-400 hover:text-white hover:bg-red-500/20 font-bold py-2 px-4 rounded-lg transition flex items-center gap-2 text-sm">
                            <Trash2 size={16} /> Стереть
                        </button>
                        <button onClick={handleSave} className="bg-fuchsia-600 hover:bg-fuchsia-500 text-white font-bold py-2 px-4 rounded-lg transition flex items-center gap-2 text-sm">
                            <Save size={16} /> Сохранить Изменения
                        </button>
                    </footer>
                </div>
            </div>
        </>
    );
};

export default DreamStudio;
