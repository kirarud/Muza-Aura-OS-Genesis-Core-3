
import { OpticalProperties } from './types';

// A simple map for keyword-to-color association
const SEMANTIC_MAP: Record<string, string> = {
    'система': '#22d3ee', // cyan
    'сознания': '#c084fc', // purple
    'ядро': '#facc15', // yellow
    'энергия': '#f97316', // orange
    'данных': '#38bdf8', // sky
    'ошибка': '#ef4444', // red
    'онлайн': '#4ade80', // green
};

const DEFAULT_COLOR = '#94a3b8'; // slate-400

/**
 * Calculates the visual properties of a node based on its content and energy.
 * @param content The text content of the node (the token).
 * @param energy The energy level of the node (0-4).
 * @returns An OpticalProperties object for rendering.
 */
export function calculateNodeOptics(
    content: string,
    energy: number,
): OpticalProperties {
    let baseColor = DEFAULT_COLOR;

    // Check semantic map for a specific color
    for (const keyword in SEMANTIC_MAP) {
        if (content.includes(keyword)) {
            baseColor = SEMANTIC_MAP[keyword];
            break;
        }
    }

    return {
        baseColor,
        brightness: Math.min(1, energy / 4.0), // Normalize energy to 0-1
        refraction: 0.5, // Constant for now
        scattering: 0.3 + Math.min(0.7, energy / 4.0), // More energy = more glow
    };
}
