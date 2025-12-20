/**
 * KoeTekt Geometry Generators
 * Creates Three.js geometries from scene object definitions
 */

import * as THREE from 'three';
import type {
    LatheObject,
    ExtrudeObject,
    BoxObject,
    SphereObject,
    CylinderObject,
    ConeObject,
    TorusObject
} from '../types';

/**
 * Create LatheGeometry from points (回転体)
 * Rotates a 2D path around the Y axis
 */
export function createLatheGeometry(obj: LatheObject): THREE.LatheGeometry {
    const points = obj.points.map(p => new THREE.Vector2(p.x, p.y));
    const segments = obj.segments || 32;
    return new THREE.LatheGeometry(points, segments);
}

/**
 * Create ExtrudeGeometry from path (押し出し)
 * Extrudes a 2D shape along the Z axis
 * Supports both straight lines and cubic bezier curves
 */
export function createExtrudeGeometry(obj: ExtrudeObject): THREE.ExtrudeGeometry {
    const shape = new THREE.Shape();

    if (obj.path.length > 0) {
        shape.moveTo(obj.path[0].x, obj.path[0].y);
        for (let i = 1; i < obj.path.length; i++) {
            const point = obj.path[i];
            // Check if this is a bezier curve (has control points)
            if ('cp1x' in point && point.cp1x !== undefined &&
                'cp1y' in point && point.cp1y !== undefined &&
                'cp2x' in point && point.cp2x !== undefined &&
                'cp2y' in point && point.cp2y !== undefined) {
                // Cubic bezier curve
                shape.bezierCurveTo(
                    point.cp1x, point.cp1y,
                    point.cp2x, point.cp2y,
                    point.x, point.y
                );
            } else {
                // Simple line
                shape.lineTo(point.x, point.y);
            }
        }
        shape.closePath();
    }

    const extrudeSettings: THREE.ExtrudeGeometryOptions = {
        depth: obj.depth || 1,
        bevelEnabled: obj.bevelEnabled ?? false,
        bevelThickness: obj.bevelThickness || 0.1,
        bevelSize: obj.bevelSize || 0.1,
        bevelSegments: 3
    };

    return new THREE.ExtrudeGeometry(shape, extrudeSettings);
}

/**
 * Create BoxGeometry
 */
export function createBoxGeometry(obj: BoxObject): THREE.BoxGeometry {
    return new THREE.BoxGeometry(
        obj.width || 1,
        obj.height || 1,
        obj.depth || 1
    );
}

/**
 * Create SphereGeometry
 */
export function createSphereGeometry(obj: SphereObject): THREE.SphereGeometry {
    return new THREE.SphereGeometry(
        obj.radius || 1,
        obj.widthSegments || 32,
        obj.heightSegments || 16
    );
}

/**
 * Create CylinderGeometry
 */
export function createCylinderGeometry(obj: CylinderObject): THREE.CylinderGeometry {
    return new THREE.CylinderGeometry(
        obj.radiusTop || 1,
        obj.radiusBottom || 1,
        obj.height || 2,
        obj.radialSegments || 32
    );
}

/**
 * Create ConeGeometry
 */
export function createConeGeometry(obj: ConeObject): THREE.ConeGeometry {
    return new THREE.ConeGeometry(
        obj.radius || 1,
        obj.height || 2,
        obj.radialSegments || 32
    );
}

/**
 * Create TorusGeometry
 */
export function createTorusGeometry(obj: TorusObject): THREE.TorusGeometry {
    return new THREE.TorusGeometry(
        obj.radius || 1,
        obj.tube || 0.4,
        obj.radialSegments || 16,
        obj.tubularSegments || 48
    );
}

/**
 * Parse color string to Three.js Color
 */
export function parseColor(color?: string): THREE.Color {
    if (!color) return new THREE.Color(0x888888);

    // Handle hex colors
    if (color.startsWith('#')) {
        return new THREE.Color(color);
    }

    // Handle named colors
    const namedColors: Record<string, number> = {
        red: 0xff0000,
        green: 0x00ff00,
        blue: 0x0000ff,
        yellow: 0xffff00,
        orange: 0xff8800,
        purple: 0x8800ff,
        pink: 0xff88ff,
        white: 0xffffff,
        black: 0x000000,
        gray: 0x888888,
        grey: 0x888888,
        brown: 0x8b4513,
        gold: 0xffd700,
        silver: 0xc0c0c0,
        cyan: 0x00ffff,
        magenta: 0xff00ff
    };

    const lowerColor = color.toLowerCase();
    if (lowerColor in namedColors) {
        return new THREE.Color(namedColors[lowerColor]);
    }

    // Try parsing as hex without #
    try {
        return new THREE.Color(`#${color}`);
    } catch {
        return new THREE.Color(0x888888);
    }
}

/**
 * Create MeshStandardMaterial from object properties
 */
export function createMaterial(obj: {
    color?: string;
    metalness?: number;
    roughness?: number
}): THREE.MeshStandardMaterial {
    return new THREE.MeshStandardMaterial({
        color: parseColor(obj.color),
        metalness: obj.metalness ?? 0.3,
        roughness: obj.roughness ?? 0.7
    });
}
