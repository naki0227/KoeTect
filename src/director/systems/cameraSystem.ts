/**
 * Camera System
 * Camera control execution
 */

import gsap from 'gsap';
import * as THREE from 'three';
import type { CameraCommand } from '../../types';
import { findObjectByName } from './animationSystem';

export interface CameraController {
    camera: THREE.Camera;
    controls: {
        target: THREE.Vector3;
        update: () => void;
        enabled: boolean;
    };
}

/**
 * Execute camera command
 */
export function executeCamera(
    command: CameraCommand,
    controller: CameraController | null,
    sceneRoot: THREE.Object3D | null
): Promise<void> {
    return new Promise((resolve) => {
        if (!controller) {
            console.warn('No camera controller available');
            resolve();
            return;
        }

        const { camera, controls } = controller;
        const duration = command.duration ?? 1;

        switch (command.action) {
            case 'dolly_in': {
                const distance = (command.value as number) ?? 5;
                const direction = new THREE.Vector3();
                camera.getWorldDirection(direction);

                gsap.to(camera.position, {
                    x: camera.position.x + direction.x * distance,
                    y: camera.position.y + direction.y * distance,
                    z: camera.position.z + direction.z * distance,
                    duration,
                    ease: 'power2.inOut',
                    onUpdate: () => controls.update(),
                    onComplete: () => resolve()
                });
                break;
            }

            case 'dolly_out': {
                const distance = (command.value as number) ?? 5;
                const direction = new THREE.Vector3();
                camera.getWorldDirection(direction);

                gsap.to(camera.position, {
                    x: camera.position.x - direction.x * distance,
                    y: camera.position.y - direction.y * distance,
                    z: camera.position.z - direction.z * distance,
                    duration,
                    ease: 'power2.inOut',
                    onUpdate: () => controls.update(),
                    onComplete: () => resolve()
                });
                break;
            }

            case 'focus': {
                if (command.target && sceneRoot) {
                    const target = findObjectByName(sceneRoot, command.target);
                    if (target) {
                        const worldPos = new THREE.Vector3();
                        target.getWorldPosition(worldPos);

                        gsap.to(controls.target, {
                            x: worldPos.x,
                            y: worldPos.y,
                            z: worldPos.z,
                            duration,
                            ease: 'power2.inOut',
                            onUpdate: () => controls.update(),
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

            case 'pan': {
                if (Array.isArray(command.value)) {
                    gsap.to(controls.target, {
                        x: controls.target.x + command.value[0],
                        y: controls.target.y + command.value[1],
                        z: controls.target.z + command.value[2],
                        duration,
                        ease: 'power2.inOut',
                        onUpdate: () => controls.update(),
                        onComplete: () => resolve()
                    });
                } else {
                    resolve();
                }
                break;
            }

            case 'orbit': {
                const angle = (command.value as number) ?? Math.PI / 4;
                const radius = camera.position.length();
                const startAngle = Math.atan2(camera.position.x, camera.position.z);

                gsap.to({}, {
                    duration,
                    ease: 'power2.inOut',
                    onUpdate: function () {
                        const progress = this.progress();
                        const currentAngle = startAngle + angle * progress;
                        camera.position.x = Math.sin(currentAngle) * radius;
                        camera.position.z = Math.cos(currentAngle) * radius;
                        controls.update();
                    },
                    onComplete: () => resolve()
                });
                break;
            }

            case 'shake': {
                const intensity = (command.value as number) ?? 0.3;
                const originalPosition = camera.position.clone();

                const tl = gsap.timeline({
                    onComplete: () => {
                        camera.position.copy(originalPosition);
                        controls.update();
                        resolve();
                    }
                });

                for (let i = 0; i < 20; i++) {
                    tl.to(camera.position, {
                        x: originalPosition.x + (Math.random() - 0.5) * intensity,
                        y: originalPosition.y + (Math.random() - 0.5) * intensity,
                        z: originalPosition.z + (Math.random() - 0.5) * intensity,
                        duration: duration / 20,
                        ease: 'none',
                        onUpdate: () => controls.update()
                    });
                }
                break;
            }

            case 'reset': {
                gsap.to(camera.position, {
                    x: 8,
                    y: 5,
                    z: 8,
                    duration,
                    ease: 'power2.inOut',
                    onUpdate: () => controls.update()
                });
                gsap.to(controls.target, {
                    x: 0,
                    y: 0,
                    z: 0,
                    duration,
                    ease: 'power2.inOut',
                    onUpdate: () => controls.update(),
                    onComplete: () => resolve()
                });
                break;
            }

            default:
                resolve();
        }
    });
}
