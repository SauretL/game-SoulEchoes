// ========== DUNGEON MAP LAYOUTS ==========
// Map legend: 1 = wall, 0 = floor, 2 = stairs to next level

// ===== EASY DUNGEONS =====

// Dungeon 1: Easy - Simple Corridors
export const DUNGEON_1_MAP = [
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    [1, 0, 0, 1, 0, 0, 1, 1, 1, 1, 0, 0, 1, 0, 0, 1, 0, 0, 0, 1],
    [1, 0, 1, 1, 0, 0, 1, 1, 1, 1, 0, 0, 1, 0, 0, 0, 0, 1, 0, 1],
    [1, 0, 1, 1, 0, 1, 1, 1, 1, 1, 1, 0, 1, 0, 1, 1, 1, 1, 0, 1],
    [1, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 1, 0, 0, 1, 0, 0, 0, 1],
    [1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1],
    [1, 0, 1, 1, 1, 1, 0, 1, 1, 1, 1, 0, 1, 0, 1, 1, 0, 1, 1, 1],
    [1, 0, 1, 0, 0, 0, 0, 1, 1, 1, 1, 0, 1, 0, 0, 1, 0, 0, 0, 1],
    [1, 0, 1, 0, 1, 1, 1, 1, 1, 0, 0, 0, 1, 0, 1, 1, 1, 1, 0, 1],
    [1, 0, 1, 0, 0, 0, 1, 1, 1, 0, 0, 2, 1, 0, 0, 0, 0, 0, 0, 1], // Stairs at (x12,y10)
    [1, 0, 1, 1, 1, 0, 1, 1, 1, 0, 0, 0, 1, 1, 1, 1, 0, 1, 1, 1],
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1],
    [1, 0, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 0, 1, 0, 1, 0, 1],
    [1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]
]

// Dungeon 2: Easy - Open Rooms
export const DUNGEON_2_MAP = [
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 1, 1, 0, 1, 1, 0, 1, 1, 0, 1, 0, 0, 1, 1, 0, 0, 1],
    [1, 0, 0, 1, 1, 0, 1, 1, 0, 1, 1, 0, 1, 0, 0, 1, 1, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 1, 1, 0, 1, 1, 0, 1, 0, 0, 1, 1, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 1, 1, 0, 1, 1, 0, 1, 0, 0, 1, 1, 0, 0, 1],
    [1, 0, 0, 1, 1, 0, 1, 1, 0, 1, 1, 0, 1, 0, 0, 1, 1, 0, 0, 1],
    [1, 0, 0, 1, 1, 0, 1, 1, 0, 1, 1, 0, 1, 0, 0, 1, 1, 1, 0, 1],
    [1, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 1, 0, 0, 0, 1],
    [1, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 1, 0, 0, 0, 1],
    [1, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 1, 0, 0, 0, 1],
    [1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 1, 1, 1, 1, 1, 0, 0, 1, 1, 1, 1, 1, 1, 1, 0, 0, 1],
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1],
    [1, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 1],
    [1, 0, 0, 0, 2, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1], // Stairs at (x5,y2)
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]
]

// ===== MEDIUM DUNGEONS =====

// Dungeon 3: Medium - Maze Layout (20x20)
export const DUNGEON_3_MAP = [
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 1, 1, 1, 1, 0, 1, 1, 1, 1, 0, 1, 0, 1, 1, 1, 1, 0, 1],
    [1, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1, 0, 1, 0, 0, 0, 0, 1],
    [1, 0, 1, 0, 1, 1, 1, 1, 1, 0, 1, 0, 1, 0, 1, 0, 1, 1, 1, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 1, 1, 1, 0, 1, 0, 1, 1, 1, 0, 1, 1, 1, 1, 1, 0, 1, 1],
    [1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 1, 1, 1, 1, 0, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1],
    [1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 1, 0, 0, 0, 0, 0, 0, 1], // Stairs at (11,11)
    [1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 0, 1],
    [1, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1],
    [1, 0, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1],
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]
]

// Dungeon 4: Medium - Spiral Layout
export const DUNGEON_4_MAP = [
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 0, 1, 1, 1, 1, 0, 1],
    [1, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1, 0, 1, 0, 0, 1, 0, 1],
    [1, 0, 1, 0, 1, 0, 1, 1, 1, 0, 1, 0, 1, 0, 1, 0, 1, 1, 0, 1],
    [1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 0, 1],
    [1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 1],
    [1, 0, 1, 0, 1, 0, 0, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 0, 1],
    [1, 0, 1, 0, 1, 1, 1, 1, 1, 0, 1, 0, 1, 0, 1, 0, 1, 1, 0, 1],
    [1, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1, 0, 1, 0, 0, 0, 0, 1],
    [1, 0, 1, 1, 1, 1, 1, 1, 0, 1, 1, 0, 1, 0, 1, 1, 1, 1, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1], // Stairs at (x4,y5)
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1],
    [1, 0, 1, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1],
    [1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1],
    [1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1],
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]
]

// ===== HARD DUNGEONS =====

// Dungeon 5: Hard - Complex Maze with Rooms
export const DUNGEON_5_MAP = [
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    [1, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1],
    [1, 0, 1, 0, 1, 0, 1, 1, 0, 1, 0, 1, 1, 0, 1, 0, 1, 1, 0, 1],
    [1, 0, 1, 0, 0, 0, 1, 1, 0, 0, 0, 1, 1, 0, 0, 0, 1, 1, 0, 1],
    [1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1],
    [1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1],
    [1, 0, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 0, 1],
    [1, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 1],
    [1, 0, 1, 0, 1, 1, 1, 1, 1, 0, 1, 1, 0, 1, 1, 1, 0, 1, 0, 1],
    [1, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 1, 0, 1],
    [1, 0, 1, 1, 1, 0, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1],
    [1, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 1, 1, 0, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1],
    [1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1],
    [1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2, 1], //stairs at (x19, y2)
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]
]

// Dungeon 6: Hard - Ultimate Maze with Central Chamber
export const DUNGEON_6_MAP = [
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    [1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1],
    [1, 0, 1, 1, 1, 0, 1, 0, 1, 1, 1, 1, 1, 0, 1, 0, 1, 1, 0, 1],
    [1, 0, 1, 0, 0, 0, 1, 0, 1, 0, 0, 0, 1, 0, 1, 0, 1, 0, 0, 1],
    [1, 0, 1, 0, 1, 1, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 1],
    [1, 0, 1, 0, 0, 0, 0, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 0, 1],
    [1, 0, 1, 1, 1, 1, 1, 1, 1, 0, 1, 0, 1, 0, 1, 0, 1, 1, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 1],
    [1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    [1, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 1, 0, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 0, 1],
    [1, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 1],
    [1, 0, 1, 1, 1, 0, 1, 0, 1, 1, 1, 1, 1, 0, 1, 1, 0, 1, 0, 1],
    [1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 1, 0, 1],
    [1, 1, 1, 0, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 0, 1, 1, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 0, 1],
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]
]

// ========== ENEMY FORMATIONS CONFIGURATION ==========
// Each formation defines enemies with type, position (front/back), and slot (0-2)

export const ENEMY_FORMATIONS = {
    // ===== EASY FORMATIONS =====
    SINGLE_SEED: {
        id: 'single_seed',
        name: 'Semilla Solitaria',
        difficulty: 'easy',
        enemies: [
            { enemyId: 1, position: 'front', slot: 1 } // Single God Seed in center front
        ]
    },

    DOUBLE_SEED: {
        id: 'double_seed',
        name: 'Pareja de Semillas',
        difficulty: 'easy',
        enemies: [
            { enemyId: 1, position: 'front', slot: 0 }, // God Seed left
            { enemyId: 1, position: 'front', slot: 2 }  // God Seed right
        ]
    },

    SEED_TRIO: {
        id: 'seed_trio',
        name: 'Trío de Semillas',
        difficulty: 'easy',
        enemies: [
            { enemyId: 1, position: 'front', slot: 0 }, // God Seed left
            { enemyId: 1, position: 'front', slot: 1 }, // God Seed center
            { enemyId: 1, position: 'front', slot: 2 }  // God Seed right
        ]
    },

    // ===== MEDIUM FORMATIONS =====
    MIXED_PAIR: {
        id: 'mixed_pair',
        name: 'Dúo Divino',
        difficulty: 'medium',
        enemies: [
            { enemyId: 1, position: 'front', slot: 1 }, // God Seed front center
            { enemyId: 2, position: 'back', slot: 1 }   // God Gift back center
        ]
    },

    GIFT_GUARDIAN: {
        id: 'gift_guardian',
        name: 'Regalo Protegido',
        difficulty: 'medium',
        enemies: [
            { enemyId: 2, position: 'back', slot: 1 },  // God Gift back center (protected)
            { enemyId: 1, position: 'front', slot: 0 }, // God Seed left guard
            { enemyId: 1, position: 'front', slot: 2 }  // God Seed right guard
        ]
    },

    BALANCED_SQUAD: {
        id: 'balanced_squad',
        name: 'Escuadrón Equilibrado',
        difficulty: 'medium',
        enemies: [
            { enemyId: 1, position: 'front', slot: 0 }, // God Seed left front
            { enemyId: 2, position: 'front', slot: 2 }, // God Gift right front
            { enemyId: 1, position: 'back', slot: 1 }   // God Seed back center
        ]
    },

    // ===== HARD FORMATIONS =====
    DOUBLE_GIFT: {
        id: 'double_gift',
        name: 'Doble Regalo',
        difficulty: 'hard',
        enemies: [
            { enemyId: 2, position: 'front', slot: 0 }, // God Gift left
            { enemyId: 2, position: 'front', slot: 2 }, // God Gift right
            { enemyId: 1, position: 'back', slot: 1 }   // God Seed back support
        ]
    },

    FULL_ASSAULT: {
        id: 'full_assault',
        name: 'Asalto Completo',
        difficulty: 'hard',
        enemies: [
            { enemyId: 1, position: 'front', slot: 0 }, // God Seed left
            { enemyId: 2, position: 'front', slot: 1 }, // God Gift center
            { enemyId: 1, position: 'front', slot: 2 }, // God Seed right
            { enemyId: 2, position: 'back', slot: 0 },  // God Gift back left
            { enemyId: 1, position: 'back', slot: 2 }   // God Seed back right
        ]
    },

    GIFT_ARMY: {
        id: 'gift_army',
        name: 'Ejército de Regalos',
        difficulty: 'hard',
        enemies: [
            { enemyId: 2, position: 'front', slot: 0 }, // God Gift left
            { enemyId: 2, position: 'front', slot: 1 }, // God Gift center
            { enemyId: 2, position: 'front', slot: 2 }, // God Gift right
            { enemyId: 1, position: 'back', slot: 0 },  // God Seed back left
            { enemyId: 1, position: 'back', slot: 1 },  // God Seed back center
            { enemyId: 1, position: 'back', slot: 2 }   // God Seed back right (FULL PARTY!)
        ]
    }
}

// ========== DUNGEON CONFIGURATIONS ==========

export const DUNGEONS = [
    // ===== EASY DUNGEONS =====
    {
        id: 1,
        name: 'Sala de Iniciación',
        difficulty: 'Fácil',
        map: DUNGEON_1_MAP,
        startPos: { x: 1, y: 1 },
        stairsPos: { x: 11, y: 10 },
        nextDungeonId: 2,
        encounterRate: 0,
        description: 'Una sala simple para comenzar tu ascenso en la torre',
        availableFormations: [
            'SINGLE_SEED',
            'DOUBLE_SEED',
            'SEED_TRIO'
        ]
    },
    {
        id: 2,
        name: 'Pasillos Olvidados',
        difficulty: 'Fácil',
        map: DUNGEON_2_MAP,
        startPos: { x: 1, y: 1 },
        stairsPos: { x: 11, y: 10 },
        nextDungeonId: 3,
        encounterRate: 0,
        description: 'Corredores abandonados llenos de semillas divinas',
        availableFormations: [
            'SINGLE_SEED',
            'DOUBLE_SEED',
            'SEED_TRIO'
        ]
    },

    // ===== MEDIUM DUNGEONS =====
    {
        id: 3,
        name: 'Laberinto Engañoso',
        difficulty: 'Intermedio',
        map: DUNGEON_3_MAP,
        startPos: { x: 1, y: 1 },
        stairsPos: { x: 11, y: 11 },
        nextDungeonId: 4,
        encounterRate: 0,
        description: 'Un laberinto que prueba tu sentido de la orientación',
        availableFormations: [
            'MIXED_PAIR',
            'GIFT_GUARDIAN',
            'BALANCED_SQUAD'
        ]
    },
    {
        id: 4,
        name: 'Espiral de la Prueba',
        difficulty: 'Intermedio',
        map: DUNGEON_4_MAP,
        startPos: { x: 1, y: 1 },
        stairsPos: { x: 11, y: 11 },
        nextDungeonId: 5,
        encounterRate: 0,
        description: 'Una espiral descendente con enemigos más poderosos',
        availableFormations: [
            'MIXED_PAIR',
            'GIFT_GUARDIAN',
            'BALANCED_SQUAD'
        ]
    },

    // ===== HARD DUNGEONS =====
    {
        id: 5,
        name: 'Arena de los Campeones',
        difficulty: 'Difícil',
        map: DUNGEON_5_MAP,
        startPos: { x: 6, y: 6 },
        stairsPos: { x: 11, y: 11 },
        nextDungeonId: 6,
        encounterRate: 0,
        description: 'Una arena donde solo los más fuertes sobreviven',
        availableFormations: [
            'DOUBLE_GIFT',
            'FULL_ASSAULT',
            'GIFT_ARMY'
        ]
    },
    {
        id: 6,
        name: 'Cúspide de la Torre',
        difficulty: 'Difícil',
        map: DUNGEON_6_MAP,
        startPos: { x: 6, y: 6 },
        stairsPos: null,
        nextDungeonId: null,
        encounterRate: 0,
        description: 'La cima de la torre - ¡Enfrenta los desafíos finales!',
        availableFormations: [
            'DOUBLE_GIFT',
            'FULL_ASSAULT',
            'GIFT_ARMY'
        ]
    }
]

// ========== DUNGEON MANAGEMENT FUNCTIONS ==========

// Get dungeon by ID
export const getDungeonById = (dungeonId) => {
    return DUNGEONS.find(dungeon => dungeon.id === dungeonId) || DUNGEONS[0]
}

// Get all available dungeons
export const getAllDungeons = () => {
    return DUNGEONS
}

// Get default/first dungeon
export const getDefaultDungeon = () => {
    return DUNGEONS[0]
}

// ========== FORMATION MANAGEMENT FUNCTIONS ==========

// Get random formation for a specific dungeon
export const getRandomFormationForDungeon = (dungeonId) => {
    const dungeon = getDungeonById(dungeonId)
    if (!dungeon || !dungeon.availableFormations || dungeon.availableFormations.length === 0) {
        return null
    }

    // Pick random formation from available formations
    const randomIndex = Math.floor(Math.random() * dungeon.availableFormations.length)
    const formationKey = dungeon.availableFormations[randomIndex]

    return ENEMY_FORMATIONS[formationKey]
}

// Get formation by key
export const getFormationByKey = (formationKey) => {
    return ENEMY_FORMATIONS[formationKey] || null
}

// ========== STAIRS MANAGEMENT FUNCTIONS ==========

// Check if position has stairs
export const isStairsPosition = (dungeonId, position) => {
    const dungeon = getDungeonById(dungeonId)
    if (!dungeon || !dungeon.stairsPos) return false

    return position.x === dungeon.stairsPos.x && position.y === dungeon.stairsPos.y
}

// Get next dungeon ID
export const getNextDungeonId = (currentDungeonId) => {
    const dungeon = getDungeonById(currentDungeonId)
    return dungeon?.nextDungeonId || null
}

// Check if player can advance to next dungeon (always true - no level restrictions)
export const canAdvanceToNextDungeon = () => {
    return true
}

// Get stairs message
export const getStairsMessage = (currentDungeonId) => {
    const nextDungeonId = getNextDungeonId(currentDungeonId)
    if (!nextDungeonId) return '¡Has llegado a la cima de la torre! Esta es la mazmorra final.'

    const nextDungeon = getDungeonById(nextDungeonId)
    return `¡Has encontrado las escaleras al ${nextDungeon.name}!`
}