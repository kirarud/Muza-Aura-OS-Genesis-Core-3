
import React from 'react';

interface PersistentIndicatorProps {
    progress: number;
    visible: boolean;
}

const PersistentIndicator: React.FC<PersistentIndicatorProps> = ({ progress, visible }) => {
    return (
        <div 
            className={`fixed bottom-4 left-4 z-40 glass-panel rounded-full shadow-lg shadow-black/50 px-3 py-1.5 transition-all duration-500 ease-in-out transform ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5 pointer-events-none'}`}
        >
            <p className="font-data text-xs font-bold text-cyan-300">
                v{progress}%
            </p>
        </div>
    );
};

export default PersistentIndicator;
