
import { EmotionType } from './types';

// --- Constants ---
const BASE_FREQUENCY = 220.0; // A3

// Emotion to musical mode mapping
export const EMOTION_MODES: Record<EmotionType, { scale: number[], baseWave: OscillatorType }> = {
    [EmotionType.HAPPY]: { scale: [0, 2, 4, 7, 9], baseWave: 'triangle' }, // Major Pentatonic
    [EmotionType.EXCITED]: { scale: [0, 2, 4, 7, 9], baseWave: 'sawtooth' }, // Major Pentatonic
    [EmotionType.CALM]: { scale: [0, 3, 5, 7, 10], baseWave: 'sine' }, // Minor Pentatonic
    [EmotionType.NEUTRAL]: { scale: [0, 3, 5, 7, 10], baseWave: 'sine' }, // Minor Pentatonic
    [EmotionType.THOUGHTFUL]: { scale: [0, 3, 5, 7, 10], baseWave: 'sine' }, // Minor Pentatonic
    [EmotionType.MELANCHOLIC]: { scale: [0, 3, 5, 6, 10], baseWave: 'sine' }, // Blues scale
    [EmotionType.FOCUS]: { scale: [0, 2, 4, 5, 7, 9, 11], baseWave: 'square' }, // Major scale
    [EmotionType.FLOW]: { scale: [0, 2, 4, 5, 7, 9, 11], baseWave: 'triangle' }, // Major scale
    [EmotionType.INSPIRED]: { scale: [0, 2, 4, 7, 9], baseWave: 'sawtooth' }, // Major Pentatonic
    [EmotionType.CURIOUS]: { scale: [0, 2, 4, 6, 7, 9, 11], baseWave: 'square' }, // Lydian
    [EmotionType.CHAOS]: { scale: [0, 1, 4, 7, 8], baseWave: 'sawtooth' }, // Atonal/Dissonant
    [EmotionType.ERROR]: { scale: [0, 1, 7], baseWave: 'sawtooth' },
};

class SynthService {
    private audioContext: AudioContext | null = null;
    private mainGain: GainNode | null = null;
    private analyser: AnalyserNode | null = null;
    private musicInterval: number | null = null;
    private isInitialized = false;
    private flowDrone: OscillatorNode | null = null;
    private droneGain: GainNode | null = null;

    private initialize = () => {
        if (this.isInitialized || typeof window === 'undefined') return;
        this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
        this.mainGain = this.audioContext.createGain();
        this.analyser = this.audioContext.createAnalyser();
        this.droneGain = this.audioContext.createGain();
        
        this.analyser.fftSize = 256;

        this.droneGain.connect(this.mainGain);
        this.mainGain.connect(this.analyser);
        this.analyser.connect(this.audioContext.destination);
        this.isInitialized = true;
    };
    
    public getAnalyser(): AnalyserNode | null {
        return this.analyser;
    }

    public speak(text: string, emotion: EmotionType): void {
        if (typeof window === 'undefined' || !window.speechSynthesis) return;
        
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'ru-RU';

        // Emotional modulation
        switch(emotion) {
            case EmotionType.HAPPY:
            case EmotionType.EXCITED:
                utterance.pitch = 1.2;
                utterance.rate = 1.1;
                break;
            case EmotionType.MELANCHOLIC:
            case EmotionType.CALM:
                utterance.pitch = 0.8;
                utterance.rate = 0.9;
                break;
            default:
                utterance.pitch = 1.0;
                utterance.rate = 1.0;
        }
        
        window.speechSynthesis.speak(utterance);
    }
    
    public playMusic(emotion: EmotionType): void {
        this.initialize();
        if (!this.audioContext || !this.mainGain || this.musicInterval) return;

        const { scale, baseWave } = EMOTION_MODES[emotion] || EMOTION_MODES.NEUTRAL;

        const playNote = () => {
            if (!this.audioContext || !this.mainGain) return;
            const now = this.audioContext.currentTime;
            
            const noteIndex = Math.floor(Math.random() * scale.length);
            const octave = Math.floor(Math.random() * 2) + 1;
            const frequency = BASE_FREQUENCY * Math.pow(2, (scale[noteIndex] / 12) + octave);
            
            const osc = this.audioContext.createOscillator();
            const noteGain = this.audioContext.createGain();
            
            osc.type = baseWave;
            osc.frequency.setValueAtTime(frequency, now);
            
            noteGain.gain.setValueAtTime(0, now);
            noteGain.gain.linearRampToValueAtTime(0.1, now + 0.05);
            noteGain.gain.linearRampToValueAtTime(0, now + 0.5);
            
            osc.connect(noteGain);
            noteGain.connect(this.mainGain);
            
            osc.start(now);
            osc.stop(now + 0.5);
        };

        this.musicInterval = window.setInterval(playNote, 600);
        this.mainGain.gain.linearRampToValueAtTime(0.2, this.audioContext.currentTime + 1);
    }
    
    public stopMusic(): void {
        if (!this.audioContext || !this.mainGain || !this.musicInterval) return;
        
        clearInterval(this.musicInterval);
        this.musicInterval = null;
        this.mainGain.gain.linearRampToValueAtTime(0, this.audioContext.currentTime + 1);
    }

    public playFlowDrone(): void {
        this.initialize();
        if (!this.audioContext || !this.droneGain || this.flowDrone) return;
        
        const now = this.audioContext.currentTime;
        
        this.flowDrone = this.audioContext.createOscillator();
        this.flowDrone.type = 'sine';
        this.flowDrone.frequency.setValueAtTime(80, now); // Deep G2 note
        
        this.flowDrone.connect(this.droneGain);
        this.droneGain.gain.setValueAtTime(0, now);
        this.droneGain.gain.linearRampToValueAtTime(0.1, now + 5); // Slow fade in
        
        this.flowDrone.start(now);
    }

    public stopFlowDrone(): void {
        if (!this.audioContext || !this.droneGain || !this.flowDrone) return;

        const now = this.audioContext.currentTime;
        this.droneGain.gain.linearRampToValueAtTime(0, now + 3); // Slow fade out
        this.flowDrone.stop(now + 3.1);
        this.flowDrone = null;
    }
    
    public playUISound(type: 'unlock' | 'error'): void {
        this.initialize();
        if (!this.audioContext || !this.mainGain) return;
        const now = this.audioContext.currentTime;

        const osc = this.audioContext.createOscillator();
        const gain = this.audioContext.createGain();
        osc.connect(gain);
        gain.connect(this.mainGain);

        if (type === 'unlock') {
            osc.type = 'sine';
            osc.frequency.setValueAtTime(660, now);
            osc.frequency.linearRampToValueAtTime(880, now + 0.2);
            gain.gain.setValueAtTime(0, now);
            gain.gain.linearRampToValueAtTime(0.3, now + 0.01);
            gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.3);
        } else {
            osc.type = 'square';
            osc.frequency.setValueAtTime(220, now);
            osc.frequency.linearRampToValueAtTime(110, now + 0.2);
            gain.gain.setValueAtTime(0, now);
            gain.gain.linearRampToValueAtTime(0.3, now + 0.01);
            gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.3);
        }

        osc.start(now);
        osc.stop(now + 0.3);
    }
}

export const synthService = new SynthService();