/**
 * KoeTekt Scene Builder
 * Converts JSON scene data to Three.js objects
 */

import * as THREE from 'three';
import type {
    KoeTektScene,
    SceneObject,
    GeometryObject,
    GroupObject,
    LatheObject,
    ExtrudeObject,
    BoxObject,
    SphereObject,
    CylinderObject,
    ConeObject,
    TorusObject
} from '../types';
import {
    createLatheGeometry,
    createExtrudeGeometry,
    createBoxGeometry,
    createSphereGeometry,
    createCylinderGeometry,
    createConeGeometry,
    createTorusGeometry,
    createMaterial
} from './geometries';

/**
 * Apply transform (position, rotation, scale) to an object
 */
function applyTransform(
    object: THREE.Object3D,
    data: {
        position?: [number, number, number];
        rotation?: [number, number, number];
        scale?: [number, number, number]
    }
): void {
    if (data.position) {
        object.position.set(...data.position);
    }
    if (data.rotation) {
        object.rotation.set(...data.rotation);
    }
    if (data.scale) {
        object.scale.set(...data.scale);
    }
}

/**
 * Create geometry based on object type
 */
function createGeometry(obj: GeometryObject): THREE.BufferGeometry {
    switch (obj.type) {
        case 'lathe':
            return createLatheGeometry(obj as LatheObject);
        case 'vector_extrude':
            return createExtrudeGeometry(obj as ExtrudeObject);
        case 'box':
            return createBoxGeometry(obj as BoxObject);
        case 'sphere':
            return createSphereGeometry(obj as SphereObject);
        case 'cylinder':
            return createCylinderGeometry(obj as CylinderObject);
        case 'cone':
            return createConeGeometry(obj as ConeObject);
        case 'torus':
            return createTorusGeometry(obj as TorusObject);
        default:
            console.warn(`Unknown geometry type: ${(obj as GeometryObject).type}`);
            return new THREE.BoxGeometry(1, 1, 1);
    }
}

/**
 * Build a single scene object (recursively handles groups)
 */
function buildObject(data: SceneObject): THREE.Object3D {
    if (data.type === 'group') {
        const groupData = data as GroupObject;
        const group = new THREE.Group();
        group.name = groupData.name;

        applyTransform(group, groupData);

        // Recursively build children
        for (const child of groupData.children) {
            group.add(buildObject(child));
        }

        return group;
    } else {
        // It's a geometry object
        const geomData = data as GeometryObject;
        const geometry = createGeometry(geomData);
        const material = createMaterial(geomData);
        const mesh = new THREE.Mesh(geometry, material);

        mesh.name = geomData.name;
        mesh.castShadow = true;
        mesh.receiveShadow = true;

        applyTransform(mesh, geomData);

        return mesh;
    }
}

/**
 * Build complete scene from KoeTektScene data
 * Returns a Group containing all objects
 */
export function buildScene(sceneData: KoeTektScene): THREE.Group {
    const root = new THREE.Group();
    root.name = `scene_${sceneData.sceneId}`;

    for (const obj of sceneData.objects) {
        root.add(buildObject(obj));
    }

    return root;
}

/**
 * Dispose of all geometries and materials in a scene object
 */
export function disposeScene(object: THREE.Object3D): void {
    object.traverse((child) => {
        if (child instanceof THREE.Mesh) {
            child.geometry.dispose();
            if (Array.isArray(child.material)) {
                child.material.forEach(m => m.dispose());
            } else {
                child.material.dispose();
            }
        }
    });
}

/**
 * Get all object names in a scene (for debugging/UI)
 */
export function getObjectNames(object: THREE.Object3D, prefix = ''): string[] {
    const names: string[] = [];
    const fullName = prefix ? `${prefix}/${object.name}` : object.name;

    if (object.name) {
        names.push(fullName);
    }

    object.children.forEach(child => {
        names.push(...getObjectNames(child, fullName));
    });

    return names;
}
