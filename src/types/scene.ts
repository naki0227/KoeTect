/**
 * KoeTekt Scene Types
 * JSON schema types for Gemini API output
 */

// ============================================
// Geometry Types
// ============================================

/** 2D point for paths */
export interface Point2D {
    x: number;
    y: number;
}

/** 3D position/rotation/scale */
export interface Transform {
    position?: [number, number, number];
    rotation?: [number, number, number];
    scale?: [number, number, number];
}

/** Base object properties */
interface BaseObject extends Transform {
    name: string;
    color?: string;
    metalness?: number;
    roughness?: number;
}

// ============================================
// Vector Mode Geometries
// ============================================

/** Lathe geometry (回転体) - rotates a path around Y axis */
export interface LatheObject extends BaseObject {
    type: 'lathe';
    points: Point2D[];
    segments?: number;
}

/** Path point that can be a line or bezier curve */
export interface PathCommand {
    x: number;
    y: number;
    /** If present, this is a cubic bezier curve with control points */
    cp1x?: number;
    cp1y?: number;
    cp2x?: number;
    cp2y?: number;
}

/** Extrude geometry (押し出し) - extrudes a 2D shape along Z axis */
export interface ExtrudeObject extends BaseObject {
    type: 'vector_extrude';
    path: (Point2D | PathCommand)[];
    depth?: number;
    bevelEnabled?: boolean;
    bevelThickness?: number;
    bevelSize?: number;
}

// ============================================
// Primitive Mode Geometries
// ============================================

/** Box primitive */
export interface BoxObject extends BaseObject {
    type: 'box';
    width?: number;
    height?: number;
    depth?: number;
}

/** Sphere primitive */
export interface SphereObject extends BaseObject {
    type: 'sphere';
    radius?: number;
    widthSegments?: number;
    heightSegments?: number;
}

/** Cylinder primitive */
export interface CylinderObject extends BaseObject {
    type: 'cylinder';
    radiusTop?: number;
    radiusBottom?: number;
    height?: number;
    radialSegments?: number;
}

/** Cone primitive */
export interface ConeObject extends BaseObject {
    type: 'cone';
    radius?: number;
    height?: number;
    radialSegments?: number;
}

/** Torus primitive */
export interface TorusObject extends BaseObject {
    type: 'torus';
    radius?: number;
    tube?: number;
    radialSegments?: number;
    tubularSegments?: number;
}

// ============================================
// Group (Hierarchy)
// ============================================

/** Group object for hierarchical structure */
export interface GroupObject extends Transform {
    name: string;
    type: 'group';
    children: SceneObject[];
}

// ============================================
// Union Types
// ============================================

/** All geometry types */
export type GeometryObject =
    | LatheObject
    | ExtrudeObject
    | BoxObject
    | SphereObject
    | CylinderObject
    | ConeObject
    | TorusObject;

/** All scene object types */
export type SceneObject = GeometryObject | GroupObject;

// ============================================
// Environment
// ============================================

/** Background types */
export type BackgroundType =
    | 'space'
    | 'sunset'
    | 'night'
    | 'day'
    | 'dawn'
    | 'forest'
    | 'city'
    | 'ocean'
    | 'desert'
    | 'snow'
    | 'studio';

/** Weather types */
export type WeatherType =
    | 'clear'
    | 'rain'
    | 'snow'
    | 'fog'
    | 'storm';

/** Environment settings */
export interface Environment {
    background?: BackgroundType;
    weather?: WeatherType;
    ambientLight?: number;
    fogDensity?: number;
}

// ============================================
// Root Scene
// ============================================

/** KoeTekt Scene - Root JSON structure */
export interface KoeTektScene {
    sceneId: string;
    objects: SceneObject[];
    environment?: Environment;
}

// ============================================
// API Response
// ============================================

/** Gemini API response wrapper */
export interface GenerationResult {
    success: boolean;
    scene?: KoeTektScene;
    error?: string;
}
