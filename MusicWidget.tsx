
import React from 'react';
import { Play, Pause } from 'lucide-react';

interface MusicWidgetProps {
    isPlaying: boolean;
    onTogglePlay: () => void;
}

const MusicWidget: React.FC<MusicWidgetProps> = ({ isPlaying, onTogglePlay }) => {
    return (
        <div className="absolute bottom-4 right-4 z-20">
            <button
                onClick={onTogglePlay}
                className="w-12 h-12 glass-panel rounded-full flex items-center justify-center text-slate-300 hover:text-cyan-300 hover:bg-cyan-500/10 transition-all duration-300 shadow-lg"
                aria-label={isPlaying ? "Pause music" : "Play music"}
            >
                {isPlaying ? <Pause size={20} /> : <Play size={20} />}
            </button>
        </div>
    );
};

export default MusicWidget;
