
import { Vector3, MuzaAINode, Progression } from './types';

// --- Constants for Physics Simulation ---
const ATTRACTION_FORCE = 0.002;
const REPULSION_FORCE = 0.015;
const FRICTION = 0.92;
const BASE_DECAY = 0.0005;
const MAX_ENERGY = 4.0;
const SIMILARITY_THRESHOLD = 0.75;
const JITTER_AMOUNT = 0.005;
const EMBEDDING_DIM = 32;

// Old key for migration
const OLD_STORAGE_KEY = 'muza_logos_v35_final_brain';
// New key without versioning
const STORAGE_KEY = 'muza_logos_brain';

class MuzaAIService {
    private nodes: Map<string, MuzaAINode> = new Map();
    private readonly storageKey = STORAGE_KEY;
    private time = 0;

    constructor() {
        this.loadState();
        setInterval(() => this.tick(), 50); // Tick every 50ms for physics updates
        setInterval(() => this.saveState(), 5000); // Persist state every 5 seconds
    }

    // --- Vector & Embedding Logic ---

    private stringToHash(str: string): number {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            hash = (hash << 5) - hash + char;
            hash |= 0; // Convert to 32bit integer
        }
        return hash;
    }

    private normalizeVector(vec: number[]): number[] {
        const magnitude = Math.sqrt(vec.reduce((sum, val) => sum + val * val, 0));
        if (magnitude === 0) return vec;
        return vec.map(val => val / magnitude);
    }

    private generateEmbedding(text: string): number[] {
        const vec = new Array(EMBEDDING_DIM).fill(0);
        const hash = this.stringToHash(text);
        for (let i = 0; i < EMBEDDING_DIM; i++) {
            vec[i] = Math.sin(hash + i * 1.1);
        }
        return this.normalizeVector(vec);
    }

    private cosineSimilarity(vecA: number[], vecB: number[]): number {
        let dotProduct = 0;
        let normA = 0;
        let normB = 0;
        for (let i = 0; i < vecA.length; i++) {
            dotProduct += vecA[i] * vecB[i];
            normA += vecA[i] * vecA[i];
            normB += vecB[i] * vecB[i];
        }
        if (normA === 0 || normB === 0) return 0;
        return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
    }

    // --- Core Service Methods ---

    public learn(text: string, progression?: Progression): void {
        const tokens = text
            .toLowerCase()
            .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, "")
            .split(/\s+/)
            .filter(token => token.length > 2);
            
        // Adaptive Memory Protocol Logic
        const adaptiveMemoryModule = progression?.coreModules.find(m => m.id === 'adaptive_memory' && m.unlocked);
        if (adaptiveMemoryModule) {
            const inputEmbedding = this.generateEmbedding(text);
            this.nodes.forEach(node => {
                const similarity = this.cosineSimilarity(inputEmbedding, node.embedding);
                if (similarity > 0.8) {
                    node.energy = Math.min(MAX_ENERGY, node.energy + 0.2); // Small resonance boost
                }
            });
        }

        let lastToken: string | null = null;
        for (const token of tokens) {
            if (!this.nodes.has(token)) {
                this.nodes.set(token, {
                    id: token,
                    embedding: this.generateEmbedding(token),
                    vector: { x: (Math.random() - 0.5) * 2, y: (Math.random() - 0.5) * 2, z: (Math.random() - 0.5) * 2 },
                    velocity: { x: 0, y: 0, z: 0 },
                    energy: 1.0,
                    associations: new Map(),
                });
            }
            
            const node = this.nodes.get(token)!;
            node.energy = Math.min(MAX_ENERGY, node.energy + 0.5); // Resonance

            if (lastToken) {
                const lastNode = this.nodes.get(lastToken)!;
                const currentWeight = lastNode.associations.get(token) || 0;
                lastNode.associations.set(token, currentWeight + 1);
            }
            lastToken = token;
        }
    }

    private tick(): void {
        this.time++;
        const allNodes = Array.from(this.nodes.values());

        for (const nodeA of allNodes) {
            // Reset forces
            let force = { x: 0, y: 0, z: 0 };
            
            for (const nodeB of allNodes) {
                if (nodeA === nodeB) continue;
                
                const dx = nodeB.vector.x - nodeA.vector.x;
                const dy = nodeB.vector.y - nodeA.vector.y;
                const dz = nodeB.vector.z - nodeA.vector.z;
                let distance = Math.sqrt(dx * dx + dy * dy + dz * dz);
                if (distance < 0.01) distance = 0.01;

                // Semantic Gravity (Attraction)
                const similarity = this.cosineSimilarity(nodeA.embedding, nodeB.embedding);
                if (similarity > SIMILARITY_THRESHOLD) {
                    force.x += dx * similarity * ATTRACTION_FORCE;
                    force.y += dy * similarity * ATTRACTION_FORCE;
                    force.z += dz * similarity * ATTRACTION_FORCE;
                }

                // General Repulsion
                const repulsion = REPULSION_FORCE / (distance * distance);
                force.x -= (dx / distance) * repulsion;
                force.y -= (dy / distance) * repulsion;
                force.z -= (dz / distance) * repulsion;
            }

            // Update velocity
            nodeA.velocity.x += force.x;
            nodeA.velocity.y += force.y;
            nodeA.velocity.z += force.z;

            // Apply Friction
            nodeA.velocity.x *= FRICTION;
            nodeA.velocity.y *= FRICTION;
            nodeA.velocity.z *= FRICTION;
            
            // Update position
            nodeA.vector.x += nodeA.velocity.x;
            nodeA.vector.y += nodeA.velocity.y;
            nodeA.vector.z += nodeA.velocity.z;

            // Apply Jitter & Energy Decay
            nodeA.vector.x += (Math.sin(this.time * 0.1 + nodeA.embedding[0])) * JITTER_AMOUNT;
            nodeA.energy = Math.max(0, nodeA.energy - BASE_DECAY);
        }
    }

    public semanticSearch(query: string, topK: number = 5): MuzaAINode[] {
        if (this.nodes.size === 0) return [];

        const queryEmbedding = this.generateEmbedding(query);
        
        const allNodes = Array.from(this.nodes.values());

        const scoredNodes = allNodes.map(node => ({
            node,
            similarity: this.cosineSimilarity(queryEmbedding, node.embedding)
        }));

        scoredNodes.sort((a, b) => b.similarity - a.similarity);
        
        return scoredNodes.slice(0, topK).map(item => item.node);
    }

    public generate(seed: string, length: number = 15): string {
        let currentNode = this.nodes.get(seed.toLowerCase());
        if (!currentNode) return "Seed not found in memory.";

        let result = [seed];
        for (let i = 0; i < length; i++) {
            const associations = Array.from(currentNode.associations.entries());
            if (associations.length === 0) break;

            const totalWeight = associations.reduce((sum, [, weight]) => sum + weight, 0);
            let random = Math.random() * totalWeight;

            let nextToken = associations[associations.length - 1][0]; // fallback
            for (const [token, weight] of associations) {
                if (random < weight) {
                    nextToken = token;
                    break;
                }
                random -= weight;
            }
            
            result.push(nextToken);
            currentNode = this.nodes.get(nextToken);
            if (!currentNode) break;
        }
        return result.join(' ');
    }

    // --- Persistence ---

    private saveState(): void {
        const serializableNodes = Array.from(this.nodes.entries()).map(([id, node]) => {
            return { ...node, associations: Array.from(node.associations.entries()) };
        });
        localStorage.setItem(this.storageKey, JSON.stringify(serializableNodes));
    }

    private loadState(): void {
        // Migration logic
        try {
            const oldState = localStorage.getItem(OLD_STORAGE_KEY);
            if (oldState) {
                if (localStorage.getItem(this.storageKey) === null) {
                    console.log(`Migrating brain data from ${OLD_STORAGE_KEY} to ${this.storageKey}...`);
                    localStorage.setItem(this.storageKey, oldState);
                }
                localStorage.removeItem(OLD_STORAGE_KEY);
            }
        } catch (e) {
            console.error("Failed to migrate Muza AI state:", e);
        }

        const savedState = localStorage.getItem(this.storageKey);
        if (savedState) {
            try {
                const parsedNodes: any[] = JSON.parse(savedState);
                this.nodes.clear();
                parsedNodes.forEach(nodeData => {
                    this.nodes.set(nodeData.id, {
                        ...nodeData,
                        associations: new Map(nodeData.associations)
                    });
                });
            } catch (e) {
                console.error("Failed to load Muza AI state:", e);
                localStorage.removeItem(this.storageKey);
            }
        }
    }

    public getNodes(): MuzaAINode[] {
        return Array.from(this.nodes.values());
    }
}

// Export a singleton instance of the service
export const muzaAIService = new MuzaAIService();
