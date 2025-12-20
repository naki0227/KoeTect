/**
 * Animation System
 * GSAP-based animation execution
 */

import gsap from 'gsap';
import * as THREE from 'three';
import type { AnimationCommand } from '../../types';

/**
 * Find object by name in scene hierarchy
 */
export function findObjectByName(root: THREE.Object3D, name: string): THREE.Object3D | null {
    if (root.name === name) return root;

    for (const child of root.children) {
        const found = findObjectByName(child, name);
        if (found) return found;
    }

    return null;
}

/**
 * Execute animation command using GSAP
 */
export function executeAnimation(
    command: AnimationCommand,
    sceneRoot: THREE.Object3D | null
): Promise<void> {
    return new Promise((resolve, reject) => {
        if (!sceneRoot) {
            reject(new Error('No scene root available'));
            return;
        }

        const target = findObjectByName(sceneRoot, command.target);
        if (!target) {
            console.warn(`Animation target not found: ${command.target}`);
            resolve(); // Don't fail, just skip
            return;
        }

        const duration = command.duration ?? 1;
        const ease = command.ease ?? 'power2.inOut';
        const delay = command.delay ?? 0;

        let animationTarget: object;
        let animationProps: gsap.TweenVars;

        switch (command.action) {
            case 'rotate':
                if (Array.isArray(command.value)) {
                    animationTarget = target.rotation;
                    animationProps = {
                        x: command.value[0],
                        y: command.value[1],
                        z: command.value[2],
                        duration,
                        ease,
                        delay,
                        onComplete: () => resolve()
                    };
                } else {
                    resolve();
                    return;
                }
                break;

            case 'move':
                if (Array.isArray(command.value)) {
                    animationTarget = target.position;
                    animationProps = {
                        x: command.value[0],
                        y: command.value[1],
                        z: command.value[2],
                        duration,
                        ease,
                        delay,
                        onComplete: () => resolve()
                    };
                } else {
                    resolve();
                    return;
                }
                break;

            case 'scale':
                if (Array.isArray(command.value)) {
                    animationTarget = target.scale;
                    animationProps = {
                        x: command.value[0],
                        y: command.value[1],
                        z: command.value[2],
                        duration,
                        ease,
                        delay,
                        onComplete: () => resolve()
                    };
                } else if (typeof command.value === 'number') {
                    animationTarget = target.scale;
                    animationProps = {
                        x: command.value,
                        y: command.value,
                        z: command.value,
                        duration,
                        ease,
                        delay,
                        onComplete: () => resolve()
                    };
                } else {
                    resolve();
                    return;
                }
                break;

            case 'opacity':
                if (target instanceof THREE.Mesh && target.material instanceof THREE.Material) {
                    target.material.transparent = true;
                    animationTarget = target.material;
                    animationProps = {
                        opacity: typeof command.value === 'number' ? command.value : 1,
                        duration,
                        ease,
                        delay,
                        onComplete: () => resolve()
                    };
                } else {
                    resolve();
                    return;
                }
                break;

            case 'color':
                if (target instanceof THREE.Mesh &&
                    target.material instanceof THREE.MeshStandardMaterial &&
                    typeof command.value === 'string') {
                    const newColor = new THREE.Color(command.value);
                    animationTarget = target.material.color;
                    animationProps = {
                        r: newColor.r,
                        g: newColor.g,
                        b: newColor.b,
                        duration,
                        ease,
                        delay,
                        onComplete: () => resolve()
                    };
                } else {
                    resolve();
                    return;
                }
                break;

            default:
                resolve();
                return;
        }

        gsap.to(animationTarget, animationProps);
    });
}

/**
 * Create a shake animation on object
 */
export function shakeObject(target: THREE.Object3D, intensity = 0.1, duration = 0.5): Promise<void> {
    return new Promise((resolve) => {
        const originalPosition = target.position.clone();

        const tl = gsap.timeline({
            onComplete: () => {
                target.position.copy(originalPosition);
                resolve();
            }
        });

        for (let i = 0; i < 10; i++) {
            tl.to(target.position, {
                x: originalPosition.x + (Math.random() - 0.5) * intensity,
                y: originalPosition.y + (Math.random() - 0.5) * intensity,
                z: originalPosition.z + (Math.random() - 0.5) * intensity,
                duration: duration / 10,
                ease: 'none'
            });
        }
    });
}
