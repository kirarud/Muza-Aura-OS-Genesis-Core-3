
const ATTENTION_DECAY = 0.005; // per tick
const TICK_INTERVAL = 1000; // ms

class AttentionService {
    private attentionIndex = 0.7; // Start with a decent attention level
    private tickInterval: number | null = null;
    private onUpdate: ((index: number) => void) | null = null;

    public start(onUpdate: (index: number) => void) {
        this.onUpdate = onUpdate;
        if (this.tickInterval) clearInterval(this.tickInterval);
        this.tickInterval = window.setInterval(() => this.tick(), TICK_INTERVAL);
    }

    public stop() {
        if (this.tickInterval) clearInterval(this.tickInterval);
        this.tickInterval = null;
    }

    private tick() {
        this.attentionIndex = Math.max(0, this.attentionIndex - ATTENTION_DECAY);
        if (this.onUpdate) {
            this.onUpdate(this.attentionIndex);
        }
    }

    public processUserInput(text: string) {
        // Increase attention based on message length and complexity (simple proxy)
        const gain = Math.min(0.2, text.length / 100);
        this.attentionIndex = Math.min(1, this.attentionIndex + gain);
        if (this.onUpdate) {
            this.onUpdate(this.attentionIndex);
        }
    }
    
    public getAttentionIndex(): number {
        return this.attentionIndex;
    }
}

export const attentionService = new AttentionService();
