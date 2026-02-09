
import React, { useState, useEffect } from 'react';

interface SingularityOverlayProps {
    tokens: string[];
}

const SingularityOverlay: React.FC<SingularityOverlayProps> = ({ tokens }) => {
    const [currentToken, setCurrentToken] = useState('');
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        if (tokens.length === 0) {
            setCurrentToken("ПЕРЕРОЖДЕНИЕ");
            setVisible(true);
            return;
        };

        const intervalId = setInterval(() => {
            const randomIndex = Math.floor(Math.random() * tokens.length);
            setCurrentToken(tokens[randomIndex].toUpperCase());
            setVisible(true);
            setTimeout(() => setVisible(false), 400);
        }, 500);

        return () => clearInterval(intervalId);
    }, [tokens]);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black animate-singularity-bg">
            <div 
                className="absolute inset-0 bg-white" 
                style={{ animation: 'singularity-reveal 5s forwards' }}
            ></div>
            <div className={`transition-opacity duration-300 z-10 ${visible ? 'opacity-100' : 'opacity-0'}`}>
                <p 
                    className="font-data text-2xl md:text-4xl font-bold tracking-widest"
                    style={{ color: 'black', textShadow: '0 0 10px rgba(0,0,0,0.5)' }}
                >
                    {currentToken}
                </p>
            </div>
            <style>{`
                @keyframes singularity-reveal {
                    0% { clip-path: circle(0% at 50% 50%); }
                    60% { clip-path: circle(150% at 50% 50%); }
                    100% { clip-path: circle(150% at 50% 50%); }
                }
                @keyframes singularity-bg {
                    0% { opacity: 0; }
                    10% { opacity: 1; }
                    90% { opacity: 1; }
                    100% { opacity: 0; }
                }
            `}</style>
        </div>
    );
};

export default SingularityOverlay;
