
import { HyperBit } from './types';

const QUANTUM_KEY = "muza-aura-os-genesis-v35-singularity"; // A simple key for our simulated encryption

class BridgeService {

    /**
     * Encodes a string with Unicode characters to a Base64 string.
     * @param str The string to encode.
     * @returns A Unicode-safe Base64 string.
     */
    private b64EncodeUnicode(str: string): string {
        return btoa(encodeURIComponent(str).replace(/%([0-9A-F]{2})/g,
            (match, p1) => String.fromCharCode(parseInt(p1, 16))
        ));
    }

    /**
     * Decodes a Base64 string that was encoded with Unicode characters.
     * @param str The Base64 string to decode.
     * @returns The original decoded string.
     */
    private b64DecodeUnicode(str: string): string {
        return decodeURIComponent(atob(str).split('').map(function(c) {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));
    }
    
    /**
     * A simple XOR cipher to simulate encryption. It's symmetric.
     * @param str The string to encrypt/decrypt.
     * @param key The key to use.
     * @returns The processed string.
     */
    private xorCipher(str: string, key: string): string {
        let result = '';
        for (let i = 0; i < str.length; i++) {
            result += String.fromCharCode(str.charCodeAt(i) ^ key.charCodeAt(i % key.length));
        }
        return result;
    }

    /**
     * Encodes a HyperBit object into a shareable string.
     * @param hyperbit The HyperBit to encode.
     * @returns A base64 encoded string with a protocol prefix.
     */
    public encodeQuantumLink(hyperbit: HyperBit): string {
        try {
            const jsonString = JSON.stringify(hyperbit);
            const encryptedString = this.xorCipher(jsonString, QUANTUM_KEY);
            const base64String = this.b64EncodeUnicode(encryptedString);
            return `MUZA://${base64String}`;
        } catch (error) {
            console.error("Failed to encode HyperBit:", error);
            return '';
        }
    }

    /**
     * Decodes a quantum link string back into a HyperBit object.
     * @param link The string to decode.
     * @returns A HyperBit object or null if decoding fails.
     */
    public decodeQuantumLink(link: string): HyperBit | null {
        if (!link.startsWith('MUZA://')) {
            return null;
        }

        try {
            const base64String = link.substring('MUZA://'.length);
            const encryptedString = this.b64DecodeUnicode(base64String);
            const jsonString = this.xorCipher(encryptedString, QUANTUM_KEY);
            const hyperbit = JSON.parse(jsonString) as HyperBit;
            // Basic validation
            if (hyperbit && hyperbit.id && hyperbit.content && hyperbit.type) {
                return hyperbit;
            }
            return null;
        } catch (error) {
            console.error("Failed to decode quantum link:", error);
            return null;
        }
    }
}

export const bridgeService = new BridgeService();
