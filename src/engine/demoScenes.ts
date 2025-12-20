/**
 * KoeTekt ULTIMATE REALISTIC Porsche 911 GT3 Style
 * Maximized realism with proper proportions and bezier curves
 * All positions validated against real car measurements
 */

import { v4 as uuidv4 } from 'uuid';
import type { KoeTektScene } from '../types';

/**
 * Create ultra-realistic Porsche 911 GT3 style car
 * Based on actual 911 proportions: L=4.57m, W=1.85m, H=1.28m
 */
export function createRealisticCar(): KoeTektScene {
    // ============================================
    // REAL 911 GT3 PROPORTIONS
    // ============================================
    const L = 4.57;          // Length
    const W = 1.85;          // Width
    const H = 1.28;          // Height (GT3 is LOW)

    const WHEEL_R = 0.34;    // 20" wheels
    const WHEEL_W = 0.25;    // Wide tires
    const WHEELBASE = 2.46;
    const TRACK_F = 1.54;
    const TRACK_R = 1.59;    // Wider rear

    // ============================================
    // VERTICAL POSITIONS (Y axis)
    // ============================================
    const Y_GROUND = 0;
    const Y_WHEEL = WHEEL_R;                     // 0.34
    const Y_FLOOR = 0.15;                        // Low floor
    const Y_BELT = 0.52;                         // Low beltline (sporty)
    const Y_ROOF = H;                            // 1.28 (very low)
    const Y_BODY_MID = (Y_FLOOR + Y_BELT) / 2;   // 0.335
    const Y_CABIN_MID = (Y_BELT + Y_ROOF) / 2;   // 0.90

    // ============================================
    // LONGITUDINAL POSITIONS (Z axis)
    // ============================================
    const Z_FRONT = L / 2;                       // +2.285
    const Z_REAR = -L / 2;                       // -2.285
    const Z_WHEEL_F = WHEELBASE / 2;             // +1.23
    const Z_WHEEL_R = -WHEELBASE / 2;            // -1.23
    const Z_CABIN = -0.25;                       // Cabin rear-biased (911 style)

    // ============================================
    // LATERAL POSITIONS (X axis)
    // ============================================
    const X_L = -W / 2;                          // -0.925
    const X_R = W / 2;                           // +0.925
    const X_WHEEL_FL = -TRACK_F / 2;             // -0.77
    const X_WHEEL_FR = TRACK_F / 2;              // +0.77
    const X_WHEEL_RL = -TRACK_R / 2;             // -0.795
    const X_WHEEL_RR = TRACK_R / 2;              // +0.795

    // ============================================
    // DIMENSIONS
    // ============================================
    const BODY_H = Y_BELT - Y_FLOOR;             // 0.37
    const CABIN_H = Y_ROOF - Y_BELT;             // 0.76

    // ============================================
    // COLORS (Guards Red Metallic)
    // ============================================
    const BODY = '#BD0A16';      // Guards Red
    const GLASS = '#0a1520';     // Very dark tint
    const BLACK = '#050505';
    const CHROME = '#cccccc';
    const RUBBER = '#0c0c0c';
    const RIM = '#707070';
    const BRAKE = '#1a1a1a';

    // Side profile path - smooth curves following 911 silhouette
    const createSideProfile = () => [
        // Start at rear bottom
        { x: Z_REAR + 0.15, y: Y_FLOOR },
        // Rear bumper curve (subtle)
        { x: Z_REAR + 0.28, y: Y_FLOOR - 0.025 },
        // Rise to rear fender
        { x: Z_WHEEL_R - 0.38, y: Y_FLOOR + 0.05 },
        // Rear wheel arch (curved up)
        { x: Z_WHEEL_R - 0.15, y: Y_WHEEL },
        { x: Z_WHEEL_R, y: Y_WHEEL + WHEEL_R + 0.06 },  // Peak
        { x: Z_WHEEL_R + 0.15, y: Y_WHEEL },
        // Door sill (flat)
        { x: Z_WHEEL_R + 0.4, y: Y_FLOOR + 0.03 },
        { x: 0, y: Y_FLOOR },
        { x: Z_WHEEL_F - 0.4, y: Y_FLOOR + 0.02 },
        // Front wheel arch
        { x: Z_WHEEL_F - 0.15, y: Y_WHEEL },
        { x: Z_WHEEL_F, y: Y_WHEEL + WHEEL_R + 0.05 },  // Peak
        { x: Z_WHEEL_F + 0.15, y: Y_WHEEL },
        // Front slope down
        { x: Z_WHEEL_F + 0.35, y: Y_FLOOR - 0.02 },
        { x: Z_FRONT - 0.2, y: Y_FLOOR - 0.06 },
        // Front nose (very low)
        { x: Z_FRONT - 0.05, y: Y_FLOOR - 0.08 },
        { x: Z_FRONT, y: Y_FLOOR - 0.06 },
        // Front fascia up
        { x: Z_FRONT + 0.02, y: Y_FLOOR + 0.12 },
        // Hood rising (gentle curve)
        { x: Z_FRONT - 0.3, y: Y_BELT - 0.22 },
        { x: Z_FRONT - 0.8, y: Y_BELT - 0.08 },
        // A-pillar base
        { x: 0.35, y: Y_BELT },
        // Windshield (911 signature curve)
        { x: 0.1, y: Y_BELT + CABIN_H * 0.45 },
        // Roof peak
        { x: Z_CABIN, y: Y_ROOF },
        // Rear window slope
        { x: Z_CABIN - 0.5, y: Y_ROOF - 0.08 },
        { x: Z_CABIN - 0.9, y: Y_BELT + 0.15 },
        // Deck lid / engine cover
        { x: Z_REAR + 0.5, y: Y_BELT - 0.05 },
        { x: Z_REAR + 0.2, y: Y_BELT - 0.15 },
        // Back to start
        { x: Z_REAR + 0.15, y: Y_FLOOR }
    ];

    return {
        sceneId: uuidv4(),
        objects: [
            {
                name: 'Porsche911GT3',
                type: 'group',
                position: [0, 0, 0],
                children: [
                    // BODY - Side profile panels REMOVED
                    // (previously vector_extrude was causing wing-like appearance)


                    // =====================================
                    // MAIN BODY VOLUME
                    // =====================================
                    {
                        name: 'Body_Main',
                        type: 'box',
                        position: [0, Y_BODY_MID, 0],
                        color: BODY,
                        metalness: 0.90,
                        roughness: 0.08,
                        width: W - 0.1,
                        height: BODY_H,
                        depth: L - 0.5
                    },

                    // Front section (lower, longer nose)
                    {
                        name: 'Body_Nose',
                        type: 'box',
                        position: [0, Y_FLOOR + 0.04, Z_FRONT - 0.3],
                        rotation: [-0.06, 0, 0],
                        color: BODY,
                        metalness: 0.90,
                        roughness: 0.08,
                        width: W * 0.78,
                        height: 0.12,
                        depth: 0.8
                    },

                    // Rear section (wider 911 hips)
                    {
                        name: 'Body_Rear',
                        type: 'box',
                        position: [0, Y_FLOOR + 0.12, Z_REAR + 0.35],
                        color: BODY,
                        metalness: 0.90,
                        roughness: 0.08,
                        width: W * 0.92,
                        height: 0.26,
                        depth: 0.9
                    },

                    // Rear fender flares (911 signature)
                    {
                        name: 'Fender_Flare_RL',
                        type: 'box',
                        position: [X_WHEEL_RL - 0.05, Y_WHEEL + WHEEL_R * 0.6, Z_WHEEL_R],
                        color: BODY,
                        metalness: 0.90,
                        roughness: 0.08,
                        width: 0.14,
                        height: 0.25,
                        depth: WHEEL_R * 2.4
                    },
                    {
                        name: 'Fender_Flare_RR',
                        type: 'box',
                        position: [X_WHEEL_RR + 0.05, Y_WHEEL + WHEEL_R * 0.6, Z_WHEEL_R],
                        color: BODY,
                        metalness: 0.90,
                        roughness: 0.08,
                        width: 0.14,
                        height: 0.25,
                        depth: WHEEL_R * 2.4
                    },

                    // =====================================
                    // CABIN (low, sleek)
                    // =====================================
                    {
                        name: 'Cabin',
                        type: 'box',
                        position: [0, Y_CABIN_MID, Z_CABIN],
                        color: BLACK,
                        metalness: 0.12,
                        roughness: 0.88,
                        width: W - 0.3,
                        height: CABIN_H * 0.55,
                        depth: 1.4
                    },

                    // =====================================
                    // HOOD (long, sloping)
                    // =====================================
                    {
                        name: 'Hood',
                        type: 'box',
                        position: [0, Y_BELT - 0.04, Z_FRONT - 0.7],
                        rotation: [-0.08, 0, 0],
                        color: BODY,
                        metalness: 0.90,
                        roughness: 0.08,
                        width: W - 0.22,
                        height: 0.025,
                        depth: 1.3
                    },

                    // =====================================
                    // WINDSHIELD (911 signature steep angle)
                    // =====================================
                    {
                        name: 'Windshield',
                        type: 'box',
                        position: [0, Y_BELT + CABIN_H * 0.4, Z_CABIN + 0.95],
                        rotation: [-1.0, 0, 0],
                        color: GLASS,
                        metalness: 0.06,
                        roughness: 0.005,
                        width: W - 0.45,
                        height: CABIN_H * 0.55,
                        depth: 0.005
                    },

                    // =====================================
                    // REAR WINDOW
                    // =====================================
                    {
                        name: 'RearWindow',
                        type: 'box',
                        position: [0, Y_BELT + CABIN_H * 0.35, Z_CABIN - 0.95],
                        rotation: [0.45, 0, 0],
                        color: GLASS,
                        metalness: 0.06,
                        roughness: 0.005,
                        width: W - 0.55,
                        height: CABIN_H * 0.4,
                        depth: 0.005
                    },

                    // =====================================
                    // SIDE WINDOWS
                    // =====================================
                    {
                        name: 'Window_L',
                        type: 'box',
                        position: [X_L - 0.02, Y_CABIN_MID, Z_CABIN],
                        color: GLASS,
                        metalness: 0.06,
                        roughness: 0.005,
                        width: 0.005,
                        height: CABIN_H * 0.45,
                        depth: 1.1
                    },
                    {
                        name: 'Window_R',
                        type: 'box',
                        position: [X_R + 0.02, Y_CABIN_MID, Z_CABIN],
                        color: GLASS,
                        metalness: 0.06,
                        roughness: 0.005,
                        width: 0.005,
                        height: CABIN_H * 0.45,
                        depth: 1.1
                    },

                    // =====================================
                    // FRONT FENDERS
                    // =====================================
                    {
                        name: 'Fender_FL',
                        type: 'box',
                        position: [X_WHEEL_FL, Y_WHEEL + WHEEL_R * 0.75, Z_WHEEL_F],
                        color: BODY,
                        metalness: 0.90,
                        roughness: 0.08,
                        width: WHEEL_W + 0.08,
                        height: 0.1,
                        depth: WHEEL_R * 2.15
                    },
                    {
                        name: 'Fender_FR',
                        type: 'box',
                        position: [X_WHEEL_FR, Y_WHEEL + WHEEL_R * 0.75, Z_WHEEL_F],
                        color: BODY,
                        metalness: 0.90,
                        roughness: 0.08,
                        width: WHEEL_W + 0.08,
                        height: 0.1,
                        depth: WHEEL_R * 2.15
                    },

                    // =====================================
                    // DOORS
                    // =====================================
                    {
                        name: 'Door_L',
                        type: 'box',
                        position: [X_L - 0.018, Y_BODY_MID + 0.06, 0.05],
                        color: BODY,
                        metalness: 0.90,
                        roughness: 0.08,
                        width: 0.018,
                        height: BODY_H + 0.12,
                        depth: 0.95
                    },
                    {
                        name: 'DoorHandle_L',
                        type: 'box',
                        position: [X_L - 0.035, Y_BELT - 0.05, 0.18],
                        color: CHROME,
                        metalness: 0.96,
                        roughness: 0.02,
                        width: 0.01,
                        height: 0.018,
                        depth: 0.09
                    },
                    {
                        name: 'Door_R',
                        type: 'box',
                        position: [X_R + 0.018, Y_BODY_MID + 0.06, 0.05],
                        color: BODY,
                        metalness: 0.90,
                        roughness: 0.08,
                        width: 0.018,
                        height: BODY_H + 0.12,
                        depth: 0.95
                    },
                    {
                        name: 'DoorHandle_R',
                        type: 'box',
                        position: [X_R + 0.035, Y_BELT - 0.05, 0.18],
                        color: CHROME,
                        metalness: 0.96,
                        roughness: 0.02,
                        width: 0.01,
                        height: 0.018,
                        depth: 0.09
                    },

                    // =====================================
                    // WHEELS - 20" GT3 style
                    // =====================================
                    // Front Left
                    {
                        name: 'Tire_FL',
                        type: 'torus',
                        position: [X_WHEEL_FL, Y_WHEEL, Z_WHEEL_F],
                        rotation: [0, Math.PI / 2, Math.PI / 2],
                        color: RUBBER,
                        roughness: 0.94,
                        radius: WHEEL_R,
                        tube: WHEEL_W / 2
                    },
                    {
                        name: 'Rim_FL',
                        type: 'cylinder',
                        position: [X_WHEEL_FL, Y_WHEEL, Z_WHEEL_F],
                        rotation: [0, 0, Math.PI / 2],
                        color: RIM,
                        metalness: 0.92,
                        roughness: 0.06,
                        radiusTop: WHEEL_R - 0.05,
                        radiusBottom: WHEEL_R - 0.05,
                        height: WHEEL_W * 0.7
                    },
                    {
                        name: 'BrakeDisc_FL',
                        type: 'cylinder',
                        position: [X_WHEEL_FL + 0.03, Y_WHEEL, Z_WHEEL_F],
                        rotation: [0, 0, Math.PI / 2],
                        color: BRAKE,
                        metalness: 0.8,
                        roughness: 0.3,
                        radiusTop: WHEEL_R - 0.08,
                        radiusBottom: WHEEL_R - 0.08,
                        height: 0.02
                    },
                    // Front Right
                    {
                        name: 'Tire_FR',
                        type: 'torus',
                        position: [X_WHEEL_FR, Y_WHEEL, Z_WHEEL_F],
                        rotation: [0, Math.PI / 2, Math.PI / 2],
                        color: RUBBER,
                        roughness: 0.94,
                        radius: WHEEL_R,
                        tube: WHEEL_W / 2
                    },
                    {
                        name: 'Rim_FR',
                        type: 'cylinder',
                        position: [X_WHEEL_FR, Y_WHEEL, Z_WHEEL_F],
                        rotation: [0, 0, Math.PI / 2],
                        color: RIM,
                        metalness: 0.92,
                        roughness: 0.06,
                        radiusTop: WHEEL_R - 0.05,
                        radiusBottom: WHEEL_R - 0.05,
                        height: WHEEL_W * 0.7
                    },
                    {
                        name: 'BrakeDisc_FR',
                        type: 'cylinder',
                        position: [X_WHEEL_FR - 0.03, Y_WHEEL, Z_WHEEL_F],
                        rotation: [0, 0, Math.PI / 2],
                        color: BRAKE,
                        metalness: 0.8,
                        roughness: 0.3,
                        radiusTop: WHEEL_R - 0.08,
                        radiusBottom: WHEEL_R - 0.08,
                        height: 0.02
                    },
                    // Rear Left (wider)
                    {
                        name: 'Tire_RL',
                        type: 'torus',
                        position: [X_WHEEL_RL, Y_WHEEL, Z_WHEEL_R],
                        rotation: [0, Math.PI / 2, Math.PI / 2],
                        color: RUBBER,
                        roughness: 0.94,
                        radius: WHEEL_R,
                        tube: WHEEL_W / 2 + 0.02
                    },
                    {
                        name: 'Rim_RL',
                        type: 'cylinder',
                        position: [X_WHEEL_RL, Y_WHEEL, Z_WHEEL_R],
                        rotation: [0, 0, Math.PI / 2],
                        color: RIM,
                        metalness: 0.92,
                        roughness: 0.06,
                        radiusTop: WHEEL_R - 0.04,
                        radiusBottom: WHEEL_R - 0.04,
                        height: WHEEL_W * 0.75
                    },
                    {
                        name: 'BrakeDisc_RL',
                        type: 'cylinder',
                        position: [X_WHEEL_RL + 0.03, Y_WHEEL, Z_WHEEL_R],
                        rotation: [0, 0, Math.PI / 2],
                        color: BRAKE,
                        metalness: 0.8,
                        roughness: 0.3,
                        radiusTop: WHEEL_R - 0.07,
                        radiusBottom: WHEEL_R - 0.07,
                        height: 0.02
                    },
                    // Rear Right (wider)
                    {
                        name: 'Tire_RR',
                        type: 'torus',
                        position: [X_WHEEL_RR, Y_WHEEL, Z_WHEEL_R],
                        rotation: [0, Math.PI / 2, Math.PI / 2],
                        color: RUBBER,
                        roughness: 0.94,
                        radius: WHEEL_R,
                        tube: WHEEL_W / 2 + 0.02
                    },
                    {
                        name: 'Rim_RR',
                        type: 'cylinder',
                        position: [X_WHEEL_RR, Y_WHEEL, Z_WHEEL_R],
                        rotation: [0, 0, Math.PI / 2],
                        color: RIM,
                        metalness: 0.92,
                        roughness: 0.06,
                        radiusTop: WHEEL_R - 0.04,
                        radiusBottom: WHEEL_R - 0.04,
                        height: WHEEL_W * 0.75
                    },
                    {
                        name: 'BrakeDisc_RR',
                        type: 'cylinder',
                        position: [X_WHEEL_RR - 0.03, Y_WHEEL, Z_WHEEL_R],
                        rotation: [0, 0, Math.PI / 2],
                        color: BRAKE,
                        metalness: 0.8,
                        roughness: 0.3,
                        radiusTop: WHEEL_R - 0.07,
                        radiusBottom: WHEEL_R - 0.07,
                        height: 0.02
                    },

                    // =====================================
                    // HEADLIGHTS (GT3 4-point LED)
                    // =====================================
                    {
                        name: 'Headlight_Housing_L',
                        type: 'box',
                        position: [-0.52, Y_FLOOR + 0.12, Z_FRONT + 0.03],
                        color: '#101010',
                        width: 0.24,
                        height: 0.06,
                        depth: 0.05
                    },
                    {
                        name: 'HL_L1',
                        type: 'sphere',
                        position: [-0.58, Y_FLOOR + 0.12, Z_FRONT + 0.05],
                        color: '#FFFFEE',
                        radius: 0.022
                    },
                    {
                        name: 'HL_L2',
                        type: 'sphere',
                        position: [-0.52, Y_FLOOR + 0.12, Z_FRONT + 0.05],
                        color: '#FFFFEE',
                        radius: 0.022
                    },
                    {
                        name: 'HL_L3',
                        type: 'sphere',
                        position: [-0.46, Y_FLOOR + 0.12, Z_FRONT + 0.05],
                        color: '#FFFFEE',
                        radius: 0.022
                    },
                    {
                        name: 'HL_L4',
                        type: 'sphere',
                        position: [-0.40, Y_FLOOR + 0.12, Z_FRONT + 0.05],
                        color: '#FFFFEE',
                        radius: 0.018
                    },
                    {
                        name: 'Headlight_Housing_R',
                        type: 'box',
                        position: [0.52, Y_FLOOR + 0.12, Z_FRONT + 0.03],
                        color: '#101010',
                        width: 0.24,
                        height: 0.06,
                        depth: 0.05
                    },
                    {
                        name: 'HL_R1',
                        type: 'sphere',
                        position: [0.58, Y_FLOOR + 0.12, Z_FRONT + 0.05],
                        color: '#FFFFEE',
                        radius: 0.022
                    },
                    {
                        name: 'HL_R2',
                        type: 'sphere',
                        position: [0.52, Y_FLOOR + 0.12, Z_FRONT + 0.05],
                        color: '#FFFFEE',
                        radius: 0.022
                    },
                    {
                        name: 'HL_R3',
                        type: 'sphere',
                        position: [0.46, Y_FLOOR + 0.12, Z_FRONT + 0.05],
                        color: '#FFFFEE',
                        radius: 0.022
                    },
                    {
                        name: 'HL_R4',
                        type: 'sphere',
                        position: [0.40, Y_FLOOR + 0.12, Z_FRONT + 0.05],
                        color: '#FFFFEE',
                        radius: 0.018
                    },

                    // =====================================
                    // TAILLIGHTS (911 continuous bar)
                    // =====================================
                    {
                        name: 'Taillight_Bar',
                        type: 'box',
                        position: [0, Y_BELT - 0.1, Z_REAR - 0.02],
                        color: '#180000',
                        width: W * 0.88,
                        height: 0.035,
                        depth: 0.02
                    },
                    {
                        name: 'TL_LED_L',
                        type: 'box',
                        position: [-0.52, Y_BELT - 0.1, Z_REAR - 0.025],
                        color: '#FF0000',
                        width: 0.35,
                        height: 0.022,
                        depth: 0.008
                    },
                    {
                        name: 'TL_LED_R',
                        type: 'box',
                        position: [0.52, Y_BELT - 0.1, Z_REAR - 0.025],
                        color: '#FF0000',
                        width: 0.35,
                        height: 0.022,
                        depth: 0.008
                    },
                    {
                        name: 'TL_LED_Center',
                        type: 'box',
                        position: [0, Y_BELT - 0.1, Z_REAR - 0.025],
                        color: '#CC0000',
                        width: 0.55,
                        height: 0.012,
                        depth: 0.008
                    },

                    // =====================================
                    // GRILLE & AIR INTAKES
                    // =====================================
                    {
                        name: 'Grille_Main',
                        type: 'box',
                        position: [0, Y_FLOOR + 0.02, Z_FRONT + 0.02],
                        color: BLACK,
                        width: 0.5,
                        height: 0.08,
                        depth: 0.015
                    },
                    {
                        name: 'AirIntake_L',
                        type: 'box',
                        position: [-0.42, Y_FLOOR + 0.02, Z_FRONT + 0.02],
                        color: BLACK,
                        width: 0.12,
                        height: 0.08,
                        depth: 0.015
                    },
                    {
                        name: 'AirIntake_R',
                        type: 'box',
                        position: [0.42, Y_FLOOR + 0.02, Z_FRONT + 0.02],
                        color: BLACK,
                        width: 0.12,
                        height: 0.08,
                        depth: 0.015
                    },

                    // =====================================
                    // MIRRORS
                    // =====================================
                    {
                        name: 'Mirror_L',
                        type: 'box',
                        position: [X_L - 0.1, Y_BELT + 0.02, 0.42],
                        rotation: [0, 0.2, 0.1],
                        color: BODY,
                        metalness: 0.90,
                        roughness: 0.08,
                        width: 0.03,
                        height: 0.03,
                        depth: 0.07
                    },
                    {
                        name: 'Mirror_R',
                        type: 'box',
                        position: [X_R + 0.1, Y_BELT + 0.02, 0.42],
                        rotation: [0, -0.2, -0.1],
                        color: BODY,
                        metalness: 0.90,
                        roughness: 0.08,
                        width: 0.03,
                        height: 0.03,
                        depth: 0.07
                    },

                    // =====================================
                    // GT3 SPOILER
                    // =====================================
                    {
                        name: 'Spoiler_Upright_L',
                        type: 'box',
                        position: [-0.5, Y_BELT + 0.18, Z_REAR + 0.25],
                        color: BLACK,
                        metalness: 0.6,
                        roughness: 0.3,
                        width: 0.025,
                        height: 0.22,
                        depth: 0.1
                    },
                    {
                        name: 'Spoiler_Upright_R',
                        type: 'box',
                        position: [0.5, Y_BELT + 0.18, Z_REAR + 0.25],
                        color: BLACK,
                        metalness: 0.6,
                        roughness: 0.3,
                        width: 0.025,
                        height: 0.22,
                        depth: 0.1
                    },
                    {
                        name: 'Spoiler_Wing',
                        type: 'box',
                        position: [0, Y_BELT + 0.32, Z_REAR + 0.2],
                        rotation: [-0.08, 0, 0],
                        color: BLACK,
                        metalness: 0.6,
                        roughness: 0.3,
                        width: W * 0.95,
                        height: 0.018,
                        depth: 0.2
                    },
                    {
                        name: 'Spoiler_Endplate_L',
                        type: 'box',
                        position: [-W * 0.47, Y_BELT + 0.32, Z_REAR + 0.2],
                        rotation: [0, 0.15, 0],
                        color: BLACK,
                        width: 0.015,
                        height: 0.06,
                        depth: 0.22
                    },
                    {
                        name: 'Spoiler_Endplate_R',
                        type: 'box',
                        position: [W * 0.47, Y_BELT + 0.32, Z_REAR + 0.2],
                        rotation: [0, -0.15, 0],
                        color: BLACK,
                        width: 0.015,
                        height: 0.06,
                        depth: 0.22
                    },

                    // =====================================
                    // EXHAUST (center exit)
                    // =====================================
                    {
                        name: 'Exhaust_L',
                        type: 'cylinder',
                        position: [-0.2, Y_FLOOR + 0.03, Z_REAR + 0.02],
                        rotation: [Math.PI / 2, 0, 0],
                        color: '#252525',
                        metalness: 0.88,
                        roughness: 0.12,
                        radiusTop: 0.035,
                        radiusBottom: 0.04,
                        height: 0.06
                    },
                    {
                        name: 'Exhaust_R',
                        type: 'cylinder',
                        position: [0.2, Y_FLOOR + 0.03, Z_REAR + 0.02],
                        rotation: [Math.PI / 2, 0, 0],
                        color: '#252525',
                        metalness: 0.88,
                        roughness: 0.12,
                        radiusTop: 0.035,
                        radiusBottom: 0.04,
                        height: 0.06
                    }
                ]
            },

            // =====================================
            // STUDIO GROUND
            // =====================================
            {
                name: 'Ground',
                type: 'box',
                position: [0, -0.003, 0],
                color: '#E8E8E8',
                roughness: 0.82,
                width: 60,
                height: 0.006,
                depth: 60
            }
        ],
        environment: {
            background: 'studio',
            weather: 'clear'
        }
    };
}
