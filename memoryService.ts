
import { MuzaState, MemoryCrystal, Artifact } from './types';

// localStorage keys
const OLD_MAIN_STATE_KEY = 'muza_aura_os_main_state_v1';
const OLD_CHRONICLES_KEY = 'muza_aura_os_chronicles_v1';
const OLD_ARTIFACTS_KEY = 'muza_aura_os_artifacts_v1';

const MAIN_STATE_KEY = 'muza_aura_os_main_state';
const CHRONICLES_KEY = 'muza_aura_os_chronicles';
const ARTIFACTS_KEY = 'muza_aura_os_artifacts'; // This key is now for migration purposes only

// IndexedDB constants
const DB_NAME = 'MuzaAuraDB';
const DB_VERSION = 1;
const ARTIFACT_STORE_NAME = 'artifacts';


class MemoryService {
    private dbPromise: Promise<IDBDatabase> | null = null;

    private getDB(): Promise<IDBDatabase> {
        if (this.dbPromise) {
            return this.dbPromise;
        }
        this.dbPromise = new Promise((resolve, reject) => {
            const request = indexedDB.open(DB_NAME, DB_VERSION);
            request.onerror = () => {
                console.error("Error opening IndexedDB:", request.error);
                reject(request.error);
            };
            request.onsuccess = () => {
                resolve(request.result);
            };
            request.onupgradeneeded = (event) => {
                const db = (event.target as IDBOpenDBRequest).result;
                if (!db.objectStoreNames.contains(ARTIFACT_STORE_NAME)) {
                    db.createObjectStore(ARTIFACT_STORE_NAME, { keyPath: 'id' });
                }
            };
        });
        return this.dbPromise;
    }

    private migrate(newKey: string, oldKey: string) {
        try {
            const oldData = localStorage.getItem(oldKey);
            if (oldData) {
                console.log(`Migrating data from ${oldKey} to ${newKey}...`);
                if (localStorage.getItem(newKey) === null) {
                    localStorage.setItem(newKey, oldData);
                }
                localStorage.removeItem(oldKey);
            }
        } catch (error) {
            console.error(`Failed to migrate data for key ${oldKey}:`, error);
        }
    }
    
    // --- Main State ---
    public saveMainState(state: MuzaState): void {
        try {
            const stateToSave = { ...state };
            delete (stateToSave as any).artifacts;
            const serializedState = JSON.stringify(stateToSave);
            localStorage.setItem(MAIN_STATE_KEY, serializedState);
        } catch (error) {
            console.error("Error saving main state:", error);
        }
    }

    public loadMainState(): MuzaState | null {
        this.migrate(MAIN_STATE_KEY, OLD_MAIN_STATE_KEY);
        try {
            const serializedState = localStorage.getItem(MAIN_STATE_KEY);
            if (serializedState === null) {
                return null;
            }
            return JSON.parse(serializedState);
        } catch (error) {
            console.error("Error loading main state:", error);
            localStorage.removeItem(MAIN_STATE_KEY);
            return null;
        }
    }

    // --- Chronicles (Memory Crystals) ---
    public saveCrystal(crystal: MemoryCrystal): MemoryCrystal[] {
        const crystals = this.loadChronicles();
        const updatedCrystals = [...crystals, crystal];
        try {
            localStorage.setItem(CHRONICLES_KEY, JSON.stringify(updatedCrystals));
            return updatedCrystals;
        } catch (error) {
            console.error("Error saving memory crystal:", error);
            return crystals;
        }
    }

    public loadChronicles(): MemoryCrystal[] {
        this.migrate(CHRONICLES_KEY, OLD_CHRONICLES_KEY);
        try {
            const serializedChronicles = localStorage.getItem(CHRONICLES_KEY);
            return serializedChronicles ? JSON.parse(serializedChronicles) : [];
        } catch (error) {
            console.error("Error loading chronicles:", error);
            localStorage.removeItem(CHRONICLES_KEY);
            return [];
        }
    }

    public deleteCrystal(crystalId: string): MemoryCrystal[] {
        let crystals = this.loadChronicles();
        crystals = crystals.filter(c => c.id !== crystalId);
        try {
            localStorage.setItem(CHRONICLES_KEY, JSON.stringify(crystals));
            return crystals;
        } catch(error) {
            console.error("Error deleting crystal:", error);
            return this.loadChronicles();
        }
    }

    // --- Artifacts (now with IndexedDB) ---
    public async saveArtifacts(artifacts: Artifact[]): Promise<void> {
        try {
            const db = await this.getDB();
            const transaction = db.transaction(ARTIFACT_STORE_NAME, 'readwrite');
            const store = transaction.objectStore(ARTIFACT_STORE_NAME);
            await new Promise<void>((resolve, reject) => {
                const clearRequest = store.clear();
                clearRequest.onsuccess = () => resolve();
                clearRequest.onerror = () => reject(clearRequest.error);
            });
            
            for (const artifact of artifacts) {
                store.put(artifact);
            }

            return new Promise((resolve, reject) => {
                transaction.oncomplete = () => resolve();
                transaction.onerror = () => {
                    console.error('Error saving artifacts transaction:', transaction.error);
                    reject(transaction.error);
                };
            });
        } catch (error) {
            console.error("Error saving artifacts to IndexedDB:", error);
        }
    }

    public async loadArtifacts(): Promise<Artifact[]> {
        // One-time migration from localStorage to IndexedDB
        this.migrate(ARTIFACTS_KEY, OLD_ARTIFACTS_KEY);
        try {
            const serializedArtifacts = localStorage.getItem(ARTIFACTS_KEY);
            if (serializedArtifacts) {
                console.log('Migrating artifacts from localStorage to IndexedDB...');
                const artifacts = JSON.parse(serializedArtifacts) as Artifact[];
                await this.saveArtifacts(artifacts);
                localStorage.removeItem(ARTIFACTS_KEY);
                console.log('Artifact migration complete.');
                return artifacts;
            }
        } catch (error) {
            console.error("Error during artifact migration:", error);
        }
        
        // Load from IndexedDB
        try {
            const db = await this.getDB();
            const transaction = db.transaction(ARTIFACT_STORE_NAME, 'readonly');
            const store = transaction.objectStore(ARTIFACT_STORE_NAME);
            const request = store.getAll();

            return new Promise((resolve, reject) => {
                request.onsuccess = () => resolve(request.result);
                request.onerror = () => {
                    console.error('Error loading artifacts from IndexedDB:', request.error);
                    reject(request.error);
                };
            });
        } catch (error) {
            console.error("Error loading artifacts:", error);
            return [];
        }
    }

    // --- Data Wipe ---
    public async wipeAllData(): Promise<void> {
        // localStorage keys
        localStorage.removeItem(MAIN_STATE_KEY);
        localStorage.removeItem(CHRONICLES_KEY);
        localStorage.removeItem(ARTIFACTS_KEY);
        localStorage.removeItem('muza_logos_brain');

        // Old keys
        localStorage.removeItem(OLD_MAIN_STATE_KEY);
        localStorage.removeItem(OLD_CHRONICLES_KEY);
        localStorage.removeItem(OLD_ARTIFACTS_KEY);
        localStorage.removeItem('muza_logos_v35_final_brain');
        
        // Wipe IndexedDB
        try {
            await new Promise<void>((resolve, reject) => {
                const request = indexedDB.deleteDatabase(DB_NAME);
                request.onsuccess = () => resolve();
                request.onerror = (e) => reject(request.error);
                request.onblocked = (e) => {
                    console.warn("IndexedDB delete blocked. Please close other tabs.");
                    reject(new Error("IndexedDB delete blocked."));
                };
            });
            this.dbPromise = null;
        } catch(error) {
            console.error("Could not delete IndexedDB database.", error);
        }
        
        console.warn("All Muza Aura OS data has been wiped.");
    }
}

export const memoryService = new MemoryService();
