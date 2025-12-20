/**
 * AI Director Types
 * Command schemas for animation, camera, VFX, sound, and physics
 */

// ============================================
// Animation Commands (GSAP)
// ============================================

export type AnimationAction = 'rotate' | 'move' | 'scale' | 'color' | 'opacity';

export interface AnimationCommand {
    type: 'animation';
    target: string; // Object name (e.g., "Arm_R", "Wheel_FL")
    action: AnimationAction;
    value: [number, number, number] | number | string;
    duration?: number; // seconds
    ease?: string; // GSAP easing
    delay?: number;
}

// ============================================
// Camera Commands
// ============================================

export type CameraAction = 'dolly_in' | 'dolly_out' | 'pan' | 'orbit' | 'focus' | 'shake' | 'reset';

export interface CameraCommand {
    type: 'camera';
    action: CameraAction;
    target?: string; // Object name to focus on
    value?: [number, number, number] | number;
    duration?: number;
}

// ============================================
// VFX Commands (Post-processing)
// ============================================

export type VFXEffect =
    | 'bloom'
    | 'chromatic_aberration'
    | 'vignette'
    | 'noise'
    | 'glitch'
    | 'blur'
    | 'color_shift';

export interface VFXCommand {
    type: 'vfx';
    effect: VFXEffect;
    intensity?: number;
    duration?: number;
    color?: string;
}

// ============================================
// Sound Commands (Tone.js)
// ============================================

export type SynthType = 'NoiseSynth' | 'MetalSynth' | 'MembraneSynth' | 'FMSynth' | 'AMSynth';
export type SoundType = 'explosion' | 'impact' | 'whoosh' | 'laser' | 'charge' | 'powerup' | 'alarm';

export interface SoundCommand {
    type: 'sound';
    sound: SoundType;
    synth?: SynthType;
    volume?: number; // -60 to 0 dB
    duration?: number;
}

// ============================================
// Physics Commands (Rapier)
// ============================================

export type PhysicsAction = 'enable' | 'disable' | 'apply_force' | 'apply_impulse' | 'explode' | 'gravity';

export interface PhysicsCommand {
    type: 'physics';
    action: PhysicsAction;
    target?: string;
    value?: [number, number, number] | number;
    radius?: number; // For explosion
}

// ============================================
// Wait Command
// ============================================

export interface WaitCommand {
    type: 'wait';
    duration: number; // seconds
}

// ============================================
// Director Task
// ============================================

export type DirectorCommand =
    | AnimationCommand
    | CameraCommand
    | VFXCommand
    | SoundCommand
    | PhysicsCommand
    | WaitCommand;

export interface DirectorTask {
    id: string;
    command: DirectorCommand;
    parallel?: boolean; // Execute with next command simultaneously
    status: 'pending' | 'running' | 'completed' | 'failed';
}

// ============================================
// Direction Response
// ============================================

export interface DirectionResponse {
    description: string;
    tasks: DirectorCommand[];
}

// ============================================
// Director State
// ============================================

export interface DirectorState {
    isDirectorMode: boolean;
    isExecuting: boolean;
    currentTaskIndex: number;
    taskQueue: DirectorTask[];
    history: { role: 'user' | 'assistant'; content: string }[];
}

// ============================================
// VFX State
// ============================================

export interface VFXState {
    bloom: { enabled: boolean; intensity: number };
    chromaticAberration: { enabled: boolean; offset: number };
    vignette: { enabled: boolean; darkness: number };
    noise: { enabled: boolean; opacity: number };
    glitch: { enabled: boolean; strength: number };
}

export const DEFAULT_VFX_STATE: VFXState = {
    bloom: { enabled: false, intensity: 0 },
    chromaticAberration: { enabled: false, offset: 0 },
    vignette: { enabled: false, darkness: 0 },
    noise: { enabled: false, opacity: 0 },
    glitch: { enabled: false, strength: 0 }
};
