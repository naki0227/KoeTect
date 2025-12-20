/**
 * VFXEffects Component
 * Post-processing effects for the 3D scene
 */

import { EffectComposer, Bloom, Vignette, Noise, ChromaticAberration } from '@react-three/postprocessing';
import { BlendFunction } from 'postprocessing';
import { Vector2 } from 'three';
import type { VFXState } from '../types';

interface VFXEffectsProps {
    vfxState: VFXState;
}

export function VFXEffects({ vfxState }: VFXEffectsProps) {
    const {
        bloom,
        chromaticAberration,
        vignette,
        noise
    } = vfxState;

    // Only render if at least one effect is enabled
    const hasActiveEffects = bloom.enabled ||
        chromaticAberration.enabled ||
        vignette.enabled ||
        noise.enabled;

    if (!hasActiveEffects) {
        return null;
    }

    return (
        <EffectComposer>
            <>
                {bloom.enabled && (
                    <Bloom
                        intensity={bloom.intensity}
                        luminanceThreshold={0.2}
                        luminanceSmoothing={0.9}
                        mipmapBlur
                    />
                )}

                {chromaticAberration.enabled && (
                    <ChromaticAberration
                        offset={new Vector2(chromaticAberration.offset, chromaticAberration.offset)}
                        blendFunction={BlendFunction.NORMAL}
                        radialModulation={false}
                        modulationOffset={0}
                    />
                )}

                {vignette.enabled && (
                    <Vignette
                        darkness={vignette.darkness}
                        offset={0.5}
                        blendFunction={BlendFunction.NORMAL}
                    />
                )}

                {noise.enabled && (
                    <Noise
                        opacity={noise.opacity}
                        blendFunction={BlendFunction.OVERLAY}
                    />
                )}
            </>
        </EffectComposer>
    );
}
