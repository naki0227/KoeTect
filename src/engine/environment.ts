/**
 * KoeTekt Environment System
 * Handles background and weather effects
 */

import * as THREE from 'three';
import type { Environment, BackgroundType, WeatherType } from '../types';

/**
 * Background color/gradient configurations
 * Increased ambient for better visibility
 */
const BACKGROUND_COLORS: Record<BackgroundType, { top: number; bottom: number; ambient: number }> = {
    space: { top: 0x0a0a22, bottom: 0x050510, ambient: 0.6 },
    night: { top: 0x1a1a40, bottom: 0x2a2a50, ambient: 0.5 },
    dawn: { top: 0xff8855, bottom: 0x6a4565, ambient: 0.7 },
    sunset: { top: 0xff6500, bottom: 0xaa2200, ambient: 0.7 },
    day: { top: 0x87ceeb, bottom: 0xf0f8ff, ambient: 1.0 },
    forest: { top: 0x44aa44, bottom: 0x228822, ambient: 0.8 },
    city: { top: 0x4a5a6a, bottom: 0x2a3a4e, ambient: 0.7 },
    ocean: { top: 0x0077be, bottom: 0x003366, ambient: 0.7 },
    desert: { top: 0xf4a460, bottom: 0xdaa520, ambient: 0.9 },
    snow: { top: 0xe8e8ff, bottom: 0xc0c0e0, ambient: 1.0 },
    studio: { top: 0xfafafa, bottom: 0xe5e5e5, ambient: 1.5 }
};

/**
 * Weather configurations
 */
const WEATHER_CONFIG: Record<WeatherType, { fogColor: number; fogDensity: number }> = {
    clear: { fogColor: 0x000000, fogDensity: 0 },
    rain: { fogColor: 0x555566, fogDensity: 0.012 },
    snow: { fogColor: 0xffffff, fogDensity: 0.015 },
    fog: { fogColor: 0x999999, fogDensity: 0.04 },
    storm: { fogColor: 0x333344, fogDensity: 0.025 }
};

/**
 * Create gradient background texture
 */
export function createGradientBackground(topColor: number, bottomColor: number): THREE.Texture {
    const canvas = document.createElement('canvas');
    canvas.width = 2;
    canvas.height = 512;

    const ctx = canvas.getContext('2d')!;
    const gradient = ctx.createLinearGradient(0, 0, 0, 512);

    const topHex = '#' + topColor.toString(16).padStart(6, '0');
    const bottomHex = '#' + bottomColor.toString(16).padStart(6, '0');

    gradient.addColorStop(0, topHex);
    gradient.addColorStop(1, bottomHex);

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 2, 512);

    const texture = new THREE.CanvasTexture(canvas);
    texture.needsUpdate = true;

    return texture;
}

/**
 * Environment state for React components
 */
export interface EnvironmentState {
    backgroundColor: THREE.Color;
    ambientIntensity: number;
    fogColor: THREE.Color;
    fogDensity: number;
    backgroundType: BackgroundType;
    weatherType: WeatherType;
}

/**
 * Get environment state from Environment configuration
 */
export function getEnvironmentState(env?: Environment): EnvironmentState {
    const backgroundType = env?.background || 'studio';
    const weatherType = env?.weather || 'clear';

    const bgConfig = BACKGROUND_COLORS[backgroundType] || BACKGROUND_COLORS.studio;
    const weatherConfig = WEATHER_CONFIG[weatherType] || WEATHER_CONFIG.clear;

    return {
        backgroundColor: new THREE.Color(bgConfig.bottom),
        ambientIntensity: env?.ambientLight ?? bgConfig.ambient,
        fogColor: new THREE.Color(weatherConfig.fogColor),
        fogDensity: env?.fogDensity ?? weatherConfig.fogDensity,
        backgroundType,
        weatherType
    };
}

/**
 * Get directional light settings based on background type
 * Increased intensity for better visibility
 */
export function getDirectionalLightSettings(backgroundType: BackgroundType): {
    color: number;
    intensity: number;
    position: [number, number, number];
} {
    switch (backgroundType) {
        case 'sunset':
        case 'dawn':
            return { color: 0xff9966, intensity: 1.2, position: [5, 5, 10] };
        case 'night':
            return { color: 0x6666ff, intensity: 0.8, position: [0, 10, 5] };
        case 'space':
            return { color: 0xaaaaff, intensity: 0.8, position: [5, 10, 5] };
        case 'day':
            return { color: 0xffffff, intensity: 1.5, position: [10, 15, 10] };
        case 'forest':
            return { color: 0xaaffaa, intensity: 1.0, position: [5, 10, 5] };
        case 'city':
            return { color: 0xffffcc, intensity: 1.0, position: [5, 8, 10] };
        case 'ocean':
            return { color: 0xaaddff, intensity: 1.2, position: [10, 10, 10] };
        case 'desert':
            return { color: 0xffffaa, intensity: 1.5, position: [10, 15, 5] };
        case 'snow':
            return { color: 0xffffff, intensity: 1.3, position: [8, 12, 8] };
        case 'studio':
            return { color: 0xffffff, intensity: 2.5, position: [10, 20, 15] };
        default:
            return { color: 0xffffff, intensity: 1.5, position: [5, 10, 5] };
    }
}
