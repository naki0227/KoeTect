/**
 * Physics System
 * Rapier physics integration (simplified for now)
 */

import * as THREE from 'three';
import gsap from 'gsap';
import type { PhysicsCommand } from '../../types';
import { findObjectByName, shakeObject } from './animationSystem';

// Physics state for objects
const physicsEnabled = new Set<string>();

/**
 * Execute physics command
 * Note: Full Rapier integration requires @react-three/rapier setup
 * This is a simplified version using GSAP for visual effects
 */
export function executePhysics(
    command: PhysicsCommand,
    sceneRoot: THREE.Object3D | null
): Promise<void> {
    return new Promise((resolve) => {
        if (!sceneRoot) {
            resolve();
            return;
        }

        switch (command.action) {
            case 'enable': {
                if (command.target) {
                    physicsEnabled.add(command.target);
                    console.log(`Physics enabled for: ${command.target}`);
                }
                resolve();
                break;
            }

            case 'disable': {
                if (command.target) {
                    physicsEnabled.delete(command.target);
                    console.log(`Physics disabled for: ${command.target}`);
                }
                resolve();
                break;
            }

            case 'apply_force': {
                if (command.target && Array.isArray(command.value)) {
                    const target = findObjectByName(sceneRoot, command.target);
                    if (target) {
                        // Simulate force with animation
                        gsap.to(target.position, {
                            x: target.position.x + command.value[0] * 0.1,
                            y: target.position.y + command.value[1] * 0.1,
                            z: target.position.z + command.value[2] * 0.1,
                            duration: 0.5,
                            ease: 'power2.out',
                            onComplete: () => resolve()
                        });
                    } else {
                        resolve();
                    }
                } else {
                    resolve();
                }
                break;
            }

            case 'apply_impulse': {
                if (command.target && Array.isArray(command.value)) {
                    const target = findObjectByName(sceneRoot, command.target);
                    if (target) {
                        // Quick impulse animation
                        const impulseScale = 0.2;
                        gsap.to(target.position, {
                            x: target.position.x + command.value[0] * impulseScale,
                            y: target.position.y + command.value[1] * impulseScale,
                            z: target.position.z + command.value[2] * impulseScale,
                            duration: 0.2,
                            ease: 'power3.out',
                            onComplete: () => resolve()
                        });
                    } else {
                        resolve();
                    }
                } else {
                    resolve();
                }
                break;
            }

            case 'explode': {
                const radius = command.radius || 3;
                const center = command.target
                    ? findObjectByName(sceneRoot, command.target)?.position || new THREE.Vector3()
                    : new THREE.Vector3();

                // Find all objects within radius and apply explosion force
                const explodedObjects: THREE.Object3D[] = [];

                sceneRoot.traverse((child) => {
                    if (child instanceof THREE.Mesh) {
                        const distance = child.position.distanceTo(center);
                        if (distance < radius && distance > 0) {
                            explodedObjects.push(child);
                        }
                    }
                });

                if (explodedObjects.length === 0) {
                    // Just shake the scene
                    shakeObject(sceneRoot, 0.3, 0.5).then(resolve);
                } else {
                    // Explode objects outward
                    const animations = explodedObjects.map((obj) => {
                        const direction = obj.position.clone().sub(center).normalize();
                        const force = (radius - obj.position.distanceTo(center)) / radius;

                        return gsap.to(obj.position, {
                            x: obj.position.x + direction.x * force * 2,
                            y: obj.position.y + direction.y * force * 2 + 1,
                            z: obj.position.z + direction.z * force * 2,
                            duration: 0.5,
                            ease: 'power2.out'
                        });
                    });

                    // Add rotation chaos
                    explodedObjects.forEach((obj) => {
                        gsap.to(obj.rotation, {
                            x: obj.rotation.x + (Math.random() - 0.5) * Math.PI * 2,
                            y: obj.rotation.y + (Math.random() - 0.5) * Math.PI * 2,
                            z: obj.rotation.z + (Math.random() - 0.5) * Math.PI * 2,
                            duration: 0.5,
                            ease: 'power2.out'
                        });
                    });

                    Promise.all(animations.map(a => new Promise(r => a.then(r))))
                        .then(() => resolve());
                }
                break;
            }

            case 'gravity': {
                // Simulate gravity drop
                sceneRoot.traverse((child) => {
                    if (child instanceof THREE.Mesh && child.position.y > 0) {
                        gsap.to(child.position, {
                            y: 0,
                            duration: 0.5,
                            ease: 'bounce.out'
                        });
                    }
                });
                setTimeout(resolve, 600);
                break;
            }

            default:
                resolve();
        }
    });
}

/**
 * Check if physics is enabled for an object
 */
export function isPhysicsEnabled(name: string): boolean {
    return physicsEnabled.has(name);
}

/**
 * Reset physics state
 */
export function resetPhysics(): void {
    physicsEnabled.clear();
}
