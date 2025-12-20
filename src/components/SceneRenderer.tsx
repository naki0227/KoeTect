/**
 * SceneRenderer Component
 * React Three Fiber component that renders the generated 3D scene
 */

import { useRef, useEffect, useMemo, useImperativeHandle, forwardRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import type { KoeTektScene } from '../types';
import { buildScene, disposeScene, getEnvironmentState, getDirectionalLightSettings } from '../engine';

interface SceneRendererProps {
    scene: KoeTektScene | null;
    disableAutoRotate?: boolean;
}

export interface SceneRendererHandle {
    getSceneGroup: () => THREE.Group | null;
}

export const SceneRenderer = forwardRef<SceneRendererHandle, SceneRendererProps>(
    function SceneRenderer({ scene, disableAutoRotate }, ref) {
        const groupRef = useRef<THREE.Group>(null);
        const builtSceneRef = useRef<THREE.Group | null>(null);

        // Build the scene when data changes
        const sceneGroup = useMemo(() => {
            if (!scene) return null;
            return buildScene(scene);
        }, [scene]);

        // Expose the scene group via ref
        useImperativeHandle(ref, () => ({
            getSceneGroup: () => builtSceneRef.current
        }), []);

        // Add/remove scene from the group
        useEffect(() => {
            if (!groupRef.current) return;

            // Clean up previous scene
            if (builtSceneRef.current) {
                groupRef.current.remove(builtSceneRef.current);
                disposeScene(builtSceneRef.current);
                builtSceneRef.current = null;
            }

            // Add new scene
            if (sceneGroup) {
                groupRef.current.add(sceneGroup);
                builtSceneRef.current = sceneGroup;
            }

            return () => {
                if (builtSceneRef.current) {
                    disposeScene(builtSceneRef.current);
                }
            };
        }, [sceneGroup]);

        // Animation and rotation loop
        useFrame((_, delta) => {
            if (!groupRef.current || !sceneGroup) return;

            // Auto-rotate when not directing
            if (!disableAutoRotate) {
                groupRef.current.rotation.y += delta * 0.1;
            }

            // Process object animations
            sceneGroup.traverse((obj) => {
                if (obj.userData.animation) {
                    const anim = obj.userData.animation;
                    const speed = anim.speed || 1;
                    obj.userData.animationTime = (obj.userData.animationTime || 0) + delta;
                    const t = obj.userData.animationTime;

                    switch (anim.type) {
                        case 'rotate':
                        case 'spin': {
                            const axis = anim.axis || 'y';
                            if (axis === 'x') obj.rotation.x += delta * speed;
                            else if (axis === 'y') obj.rotation.y += delta * speed;
                            else if (axis === 'z') obj.rotation.z += delta * speed;
                            break;
                        }
                        case 'float': {
                            const amplitude = anim.amplitude || 0.2;
                            const initial = obj.userData.initialPosition;
                            if (initial) {
                                obj.position.y = initial.y + Math.sin(t * speed * 2) * amplitude;
                            }
                            break;
                        }
                        case 'bounce': {
                            const height = anim.height || 0.3;
                            const initial = obj.userData.initialPosition;
                            if (initial) {
                                obj.position.y = initial.y + Math.abs(Math.sin(t * speed * 3)) * height;
                            }
                            break;
                        }
                        case 'sway': {
                            const angle = (anim.angle || 15) * Math.PI / 180;
                            const initial = obj.userData.initialRotation;
                            if (initial) {
                                obj.rotation.z = initial.z + Math.sin(t * speed) * angle;
                            }
                            break;
                        }
                    }
                }
            });
        });

        return <group ref={groupRef} />;
    }
);

interface EnvironmentRendererProps {
    scene: KoeTektScene | null;
}

export function EnvironmentRenderer({ scene }: EnvironmentRendererProps) {
    const envState = useMemo(() => {
        return getEnvironmentState(scene?.environment);
    }, [scene?.environment]);

    const lightSettings = useMemo(() => {
        return getDirectionalLightSettings(envState.backgroundType);
    }, [envState.backgroundType]);

    return (
        <>
            {/* Ambient light */}
            <ambientLight intensity={envState.ambientIntensity} />

            {/* Main directional light */}
            <directionalLight
                color={lightSettings.color}
                intensity={lightSettings.intensity}
                position={lightSettings.position}
                castShadow
                shadow-mapSize={[2048, 2048]}
            />

            {/* Fill light from opposite direction */}
            <directionalLight
                color={0x8888ff}
                intensity={0.2}
                position={[-5, 3, -5]}
            />

            {/* Ground plane for shadows */}
            <mesh
                rotation={[-Math.PI / 2, 0, 0]}
                position={[0, -0.5, 0]}
                receiveShadow
            >
                <planeGeometry args={[50, 50]} />
                <shadowMaterial opacity={0.3} />
            </mesh>

            {/* Fog effect based on weather */}
            {envState.fogDensity > 0 && (
                <fog attach="fog" args={[envState.fogColor, 10, 50]} />
            )}
        </>
    );
}
