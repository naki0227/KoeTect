/**
 * VFX System
 * Post-processing effects control
 */

import gsap from 'gsap';
import type { VFXCommand, VFXState } from '../../types';

/**
 * Execute VFX command by updating VFX state
 */
export function executeVFX(
    command: VFXCommand,
    currentState: VFXState,
    setState: (state: VFXState) => void
): Promise<void> {
    return new Promise((resolve) => {
        const duration = command.duration ?? 0.5;
        const intensity = command.intensity ?? 1;

        switch (command.effect) {
            case 'bloom': {
                // Animate bloom intensity
                const proxy = { value: currentState.bloom.intensity };
                gsap.to(proxy, {
                    value: intensity,
                    duration: duration * 0.3,
                    ease: 'power2.out',
                    onUpdate: () => {
                        setState({
                            ...currentState,
                            bloom: { enabled: true, intensity: proxy.value }
                        });
                    },
                    onComplete: () => {
                        // Fade out after hold
                        setTimeout(() => {
                            gsap.to(proxy, {
                                value: 0,
                                duration: duration * 0.7,
                                ease: 'power2.in',
                                onUpdate: () => {
                                    setState({
                                        ...currentState,
                                        bloom: { enabled: proxy.value > 0.01, intensity: proxy.value }
                                    });
                                },
                                onComplete: resolve
                            });
                        }, duration * 300);
                    }
                });
                break;
            }

            case 'chromatic_aberration': {
                const proxy = { value: currentState.chromaticAberration.offset };
                gsap.to(proxy, {
                    value: intensity * 0.01,
                    duration: duration * 0.3,
                    ease: 'power2.out',
                    onUpdate: () => {
                        setState({
                            ...currentState,
                            chromaticAberration: { enabled: true, offset: proxy.value }
                        });
                    },
                    onComplete: () => {
                        setTimeout(() => {
                            gsap.to(proxy, {
                                value: 0,
                                duration: duration * 0.7,
                                ease: 'power2.in',
                                onUpdate: () => {
                                    setState({
                                        ...currentState,
                                        chromaticAberration: { enabled: proxy.value > 0.0001, offset: proxy.value }
                                    });
                                },
                                onComplete: resolve
                            });
                        }, duration * 300);
                    }
                });
                break;
            }

            case 'vignette': {
                const proxy = { value: currentState.vignette.darkness };
                gsap.to(proxy, {
                    value: intensity * 0.8,
                    duration: duration * 0.3,
                    ease: 'power2.out',
                    onUpdate: () => {
                        setState({
                            ...currentState,
                            vignette: { enabled: true, darkness: proxy.value }
                        });
                    },
                    onComplete: () => {
                        setTimeout(() => {
                            gsap.to(proxy, {
                                value: 0,
                                duration: duration * 0.7,
                                ease: 'power2.in',
                                onUpdate: () => {
                                    setState({
                                        ...currentState,
                                        vignette: { enabled: proxy.value > 0.01, darkness: proxy.value }
                                    });
                                },
                                onComplete: resolve
                            });
                        }, duration * 300);
                    }
                });
                break;
            }

            case 'noise': {
                const proxy = { value: 0 };
                gsap.to(proxy, {
                    value: intensity * 0.5,
                    duration: duration * 0.2,
                    ease: 'none',
                    onUpdate: () => {
                        setState({
                            ...currentState,
                            noise: { enabled: true, opacity: proxy.value }
                        });
                    },
                    onComplete: () => {
                        gsap.to(proxy, {
                            value: 0,
                            duration: duration * 0.8,
                            ease: 'power2.out',
                            onUpdate: () => {
                                setState({
                                    ...currentState,
                                    noise: { enabled: proxy.value > 0.01, opacity: proxy.value }
                                });
                            },
                            onComplete: resolve
                        });
                    }
                });
                break;
            }

            case 'glitch': {
                // Quick glitch effect
                setState({
                    ...currentState,
                    glitch: { enabled: true, strength: intensity }
                });

                setTimeout(() => {
                    setState({
                        ...currentState,
                        glitch: { enabled: false, strength: 0 }
                    });
                    resolve();
                }, duration * 1000);
                break;
            }

            case 'blur': {
                // Blur not directly supported, use vignette as substitute
                executeVFX({ ...command, effect: 'vignette' }, currentState, setState)
                    .then(resolve);
                break;
            }

            case 'color_shift': {
                // Use chromatic aberration for color shift
                executeVFX({ ...command, effect: 'chromatic_aberration' }, currentState, setState)
                    .then(resolve);
                break;
            }

            default:
                resolve();
        }
    });
}

/**
 * Reset all VFX to default state
 */
export function resetVFX(setState: (state: VFXState) => void): void {
    setState({
        bloom: { enabled: false, intensity: 0 },
        chromaticAberration: { enabled: false, offset: 0 },
        vignette: { enabled: false, darkness: 0 },
        noise: { enabled: false, opacity: 0 },
        glitch: { enabled: false, strength: 0 }
    });
}
