
import React, { useEffect } from 'react';
import { X } from 'lucide-react';

interface FullscreenImageViewerProps {
    src: string;
    onClose: () => void;
}

const FullscreenImageViewer: React.FC<FullscreenImageViewerProps> = ({ src, onClose }) => {
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                onClose();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [onClose]);

    return (
        <div 
            className="fixed inset-0 z-[60] bg-black/80 backdrop-blur-lg flex items-center justify-center animate-fade-in"
            onClick={onClose}
        >
            <button className="absolute top-4 right-4 p-2 text-white/70 hover:text-white transition-colors">
                <X size={32} />
            </button>
            <img 
                src={src} 
                alt="Fullscreen view" 
                className="max-w-[95vw] max-h-[95vh] object-contain shadow-2xl shadow-black"
                onClick={e => e.stopPropagation()} // Prevent closing when clicking on the image itself
            />
        </div>
    );
};

export default FullscreenImageViewer;
