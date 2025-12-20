/**
 * Sound System
 * Tone.js procedural sound effects
 */

import * as Tone from 'tone';
import type { SoundCommand, SoundType } from '../../types';

// Keep synths cached to avoid recreation
let noiseSynth: Tone.NoiseSynth | null = null;
let metalSynth: Tone.MetalSynth | null = null;
let membraneSynth: Tone.MembraneSynth | null = null;
let fmSynth: Tone.FMSynth | null = null;

/**
 * Initialize audio context (must be called after user interaction)
 */
export async function initAudio(): Promise<void> {
    await Tone.start();
    console.log('Audio context started');
}

/**
 * Get or create synth instances
 */
function getNoiseSynth(): Tone.NoiseSynth {
    if (!noiseSynth) {
        noiseSynth = new Tone.NoiseSynth({
            noise: { type: 'white' },
            envelope: { attack: 0.005, decay: 0.1, sustain: 0 }
        }).toDestination();
    }
    return noiseSynth;
}

function getMetalSynth(): Tone.MetalSynth {
    if (!metalSynth) {
        metalSynth = new Tone.MetalSynth({
            envelope: { attack: 0.001, decay: 0.4, release: 0.2 },
            harmonicity: 5.1,
            modulationIndex: 32,
            resonance: 4000,
            octaves: 1.5
        }).toDestination();
    }
    return metalSynth;
}

function getMembraneSynth(): Tone.MembraneSynth {
    if (!membraneSynth) {
        membraneSynth = new Tone.MembraneSynth({
            pitchDecay: 0.05,
            octaves: 4,
            oscillator: { type: 'sine' },
            envelope: { attack: 0.001, decay: 0.4, sustain: 0.01, release: 1.4 }
        }).toDestination();
    }
    return membraneSynth;
}

function getFMSynth(): Tone.FMSynth {
    if (!fmSynth) {
        fmSynth = new Tone.FMSynth({
            harmonicity: 3,
            modulationIndex: 10,
            envelope: { attack: 0.01, decay: 0.2, sustain: 0.2, release: 0.2 }
        }).toDestination();
    }
    return fmSynth;
}

/**
 * Play explosion sound effect
 */
function playExplosion(volume: number, duration: number): void {
    const noise = getNoiseSynth();
    noise.volume.value = volume;
    noise.envelope.decay = duration * 0.8;
    noise.triggerAttackRelease(duration);

    // Add low frequency boom
    const membrane = getMembraneSynth();
    membrane.volume.value = volume - 6;
    membrane.triggerAttackRelease('C1', duration * 0.5);
}

/**
 * Play impact sound effect
 */
function playImpact(volume: number, duration: number): void {
    const metal = getMetalSynth();
    metal.volume.value = volume;
    metal.envelope.decay = duration;
    metal.triggerAttackRelease('C2', duration);
}

/**
 * Play whoosh sound effect
 */
function playWhoosh(volume: number, duration: number): void {
    const noise = getNoiseSynth();
    noise.volume.value = volume - 10;
    noise.envelope.attack = duration * 0.1;
    noise.envelope.decay = duration * 0.9;
    noise.triggerAttackRelease(duration);
}

/**
 * Play laser sound effect
 */
function playLaser(volume: number, duration: number): void {
    const fm = getFMSynth();
    fm.volume.value = volume;

    // Pitch sweep down
    fm.triggerAttackRelease('C5', duration * 0.5);
    fm.frequency.rampTo('C2', duration * 0.5);
}

/**
 * Play charge-up sound effect
 */
function playCharge(volume: number, duration: number): void {
    const fm = getFMSynth();
    fm.volume.value = volume - 6;

    // Pitch sweep up
    fm.frequency.value = 100;
    fm.triggerAttackRelease('C2', duration);
    fm.frequency.rampTo(2000, duration);
}

/**
 * Play power-up sound effect
 */
function playPowerup(volume: number, duration: number): void {
    const fm = getFMSynth();
    fm.volume.value = volume - 3;

    // Quick ascending notes
    const now = Tone.now();
    fm.triggerAttackRelease('C4', 0.1, now);
    fm.triggerAttackRelease('E4', 0.1, now + 0.1);
    fm.triggerAttackRelease('G4', 0.1, now + 0.2);
    fm.triggerAttackRelease('C5', duration - 0.3, now + 0.3);
}

/**
 * Play alarm sound effect
 */
function playAlarm(volume: number, duration: number): void {
    const fm = getFMSynth();
    fm.volume.value = volume - 6;

    const now = Tone.now();
    const beeps = Math.floor(duration / 0.3);

    for (let i = 0; i < beeps; i++) {
        fm.triggerAttackRelease('A4', 0.1, now + i * 0.3);
    }
}

/**
 * Sound effect mapping
 */
const SOUND_MAP: Record<SoundType, (volume: number, duration: number) => void> = {
    explosion: playExplosion,
    impact: playImpact,
    whoosh: playWhoosh,
    laser: playLaser,
    charge: playCharge,
    powerup: playPowerup,
    alarm: playAlarm
};

/**
 * Execute sound command
 */
export async function executeSound(command: SoundCommand): Promise<void> {
    // Ensure audio is started
    if (Tone.context.state !== 'running') {
        await initAudio();
    }

    const volume = command.volume ?? -12;
    const duration = command.duration ?? 0.5;

    const playFn = SOUND_MAP[command.sound];
    if (playFn) {
        playFn(volume, duration);
    } else {
        console.warn(`Unknown sound type: ${command.sound}`);
    }

    // Wait for sound to complete
    return new Promise(resolve => {
        setTimeout(resolve, duration * 1000);
    });
}

/**
 * Dispose all synths
 */
export function disposeAudio(): void {
    noiseSynth?.dispose();
    metalSynth?.dispose();
    membraneSynth?.dispose();
    fmSynth?.dispose();

    noiseSynth = null;
    metalSynth = null;
    membraneSynth = null;
    fmSynth = null;
}
