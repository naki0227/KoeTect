/**
 * 3D Model Exporter
 * Export Three.js scenes to GLB and STL formats
 */

import * as THREE from 'three';
import { GLTFExporter } from 'three/addons/exporters/GLTFExporter.js';
import { STLExporter } from 'three/addons/exporters/STLExporter.js';

export interface ExportOptions {
    filename?: string;
    binary?: boolean;
}

/**
 * Export scene to GLB format (binary GLTF)
 * Preserves hierarchy, materials, and transforms
 */
export async function exportToGLB(
    scene: THREE.Object3D,
    options: ExportOptions = {}
): Promise<void> {
    const exporter = new GLTFExporter();
    const filename = options.filename || 'koetekt-scene';

    return new Promise((resolve, reject) => {
        exporter.parse(
            scene,
            (result) => {
                let blob: Blob;

                if (result instanceof ArrayBuffer) {
                    // Binary GLB
                    blob = new Blob([result], { type: 'application/octet-stream' });
                } else {
                    // JSON GLTF
                    const json = JSON.stringify(result, null, 2);
                    blob = new Blob([json], { type: 'application/json' });
                }

                downloadBlob(blob, `${filename}.glb`);
                resolve();
            },
            (error) => {
                console.error('GLB export error:', error);
                reject(error);
            },
            {
                binary: true,  // Always export as binary GLB
                includeCustomExtensions: false
            }
        );
    });
}

/**
 * Export scene to STL format (binary)
 * Flattens hierarchy, geometry only
 */
export function exportToSTL(
    scene: THREE.Object3D,
    options: ExportOptions = {}
): void {
    const exporter = new STLExporter();
    const filename = options.filename || 'koetekt-scene';

    // Export as binary STL
    const result = exporter.parse(scene, { binary: true });

    let blob: Blob;
    if (result instanceof DataView) {
        // Convert DataView to Uint8Array for Blob compatibility
        const buffer = result.buffer as ArrayBuffer;
        const uint8Array = new Uint8Array(buffer, result.byteOffset, result.byteLength);
        blob = new Blob([uint8Array], { type: 'application/octet-stream' });
    } else {
        blob = new Blob([result], { type: 'text/plain' });
    }

    downloadBlob(blob, `${filename}.stl`);
}

/**
 * Helper to download a blob
 */
function downloadBlob(blob: Blob, filename: string): void {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

/**
 * Export all formats at once
 */
export async function exportAll(
    scene: THREE.Object3D,
    baseFilename?: string
): Promise<void> {
    const filename = baseFilename || 'koetekt-scene';

    await exportToGLB(scene, { filename });
    exportToSTL(scene, { filename });
}
