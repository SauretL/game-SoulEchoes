// ========== DUNGEON MAP LAYOUTS ==========
// Map legend: 1 = wall, 0 = floor, 2 = stairs to next level, 3 = boss encounter

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
    [1, 0, 1, 0, 0, 0, 1, 1, 1, 0, 0, 2, 1, 0, 0, 0, 0, 0, 0, 1], // Stairs at (x:11, y:10)
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

// Dungeon 2: Easy - Open Rooms (BOSS LEVEL)
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
    [1, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 3, 1, 0, 0, 1, 0, 0, 0, 1], // Boss at (x:11, y:10)
    [1, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 1, 0, 0, 0, 1],
    [1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 1, 1, 1, 1, 1, 0, 0, 1, 1, 1, 1, 1, 1, 1, 0, 0, 1],
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1],
    [1, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 1],
    [1, 0, 0, 0, 2, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1], // Stairs at (x:4, y:18)
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]
]

// ===== MEDIUM DUNGEONS =====

// Dungeon 3: Medium - Maze Layout
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
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 1, 0, 0, 0, 0, 0, 0, 1], // Stairs at (x:11, y:11)
    [1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 0, 1],
    [1, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1],
    [1, 0, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1],
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]
]

// Dungeon 4: Medium - Spiral Layout (BOSS LEVEL)
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
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1],
    [1, 0, 1, 3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1], // Boss at (x:3, y:15)
    [1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 0, 1],
    [1, 0, 0, 0, 0, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1], //Stairs at (x:5, y:2)
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
    [1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2, 1], // Stairs at (x:18, y:18)
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]
]

// Dungeon 6: Hard - Ultimate Maze with Central Chamber (BOSS LEVEL)
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
    [1, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 3, 0, 0, 0, 0, 0, 0, 0, 1], // Boss at (x:11, y:11)
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
        name: 'Lone Seed',
        difficulty: 'easy',
        enemies: [
            { enemyId: 1, position: 'front', slot: 1 } // Single God Seed in center front
        ]
    },
    DOUBLE_SEED: {
        id: 'double_seed',
        name: 'Seed Pair',
        difficulty: 'easy',
        enemies: [
            { enemyId: 1, position: 'front', slot: 0 }, // God Seed left
            { enemyId: 1, position: 'front', slot: 2 }  // God Seed right
        ]
    },
    SEED_TRIO: {
        id: 'seed_trio',
        name: 'Seed Trio',
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
        name: 'Divine Duo',
        difficulty: 'medium',
        enemies: [
            { enemyId: 1, position: 'front', slot: 1 }, // God Seed front center
            { enemyId: 2, position: 'back', slot: 1 }   // God Gift back center
        ]
    },
    GIFT_GUARDIAN: {
        id: 'gift_guardian',
        name: 'Protected Gift',
        difficulty: 'medium',
        enemies: [
            { enemyId: 2, position: 'back', slot: 1 },  // God Gift back center (protected)
            { enemyId: 1, position: 'front', slot: 0 }, // God Seed left guard
            { enemyId: 1, position: 'front', slot: 2 }  // God Seed right guard
        ]
    },
    BALANCED_SQUAD: {
        id: 'balanced_squad',
        name: 'Balanced Squad',
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
        name: 'Double Gift',
        difficulty: 'hard',
        enemies: [
            { enemyId: 2, position: 'front', slot: 0 }, // God Gift left
            { enemyId: 2, position: 'front', slot: 2 }, // God Gift right
            { enemyId: 1, position: 'back', slot: 1 }   // God Seed back support
        ]
    },
    FULL_ASSAULT: {
        id: 'full_assault',
        name: 'Full Assault',
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
        name: 'Gift Army',
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
        name: 'Initiation Hall',
        difficulty: 'Easy',
        map: DUNGEON_1_MAP,
        startPos: { x: 1, y: 1 },
        nextDungeonId: 2,
        encounterRate: 0,
        description: 'A simple room to begin your ascent in the tower',
        availableFormations: [
            'SINGLE_SEED',
            'DOUBLE_SEED',
            'SEED_TRIO'
        ],
        isBossLevel: false
    },
    {
        id: 2,
        name: 'Forgotten Halls - BOSS',
        difficulty: 'Easy',
        map: DUNGEON_2_MAP,
        startPos: { x: 1, y: 1 },
        nextDungeonId: 3,
        encounterRate: 0,
        description: 'Abandoned corridors with a final guardian',
        availableFormations: [
            'SINGLE_SEED',
            'DOUBLE_SEED',
            'SEED_TRIO'
        ],
        isBossLevel: true
    },

    // ===== MEDIUM DUNGEONS =====
    {
        id: 3,
        name: 'Deceptive Labyrinth',
        difficulty: 'Medium',
        map: DUNGEON_3_MAP,
        startPos: { x: 1, y: 1 },
        nextDungeonId: 4,
        encounterRate: 0,
        description: 'A maze that tests your sense of direction',
        availableFormations: [
            'MIXED_PAIR',
            'GIFT_GUARDIAN',
            'BALANCED_SQUAD'
        ],
        isBossLevel: false
    },
    {
        id: 4,
        name: 'Spiral of Trial - BOSS',
        difficulty: 'Medium',
        map: DUNGEON_4_MAP,
        startPos: { x: 1, y: 1 },
        nextDungeonId: 5,
        encounterRate: 0,
        description: 'A descending spiral with a powerful guardian',
        availableFormations: [
            'MIXED_PAIR',
            'GIFT_GUARDIAN',
            'BALANCED_SQUAD'
        ],
        isBossLevel: true
    },

    // ===== HARD DUNGEONS =====
    {
        id: 5,
        name: 'Champions Arena',
        difficulty: 'Hard',
        map: DUNGEON_5_MAP,
        startPos: { x: 6, y: 6 },
        nextDungeonId: 6,
        encounterRate: 0,
        description: 'An arena where only the strongest survive',
        availableFormations: [
            'DOUBLE_GIFT',
            'FULL_ASSAULT',
            'GIFT_ARMY'
        ],
        isBossLevel: false
    },
    {
        id: 6,
        name: 'Tower Summit - FINAL BOSS',
        difficulty: 'Hard',
        map: DUNGEON_6_MAP,
        startPos: { x: 6, y: 6 },
        nextDungeonId: null,
        encounterRate: 0,
        description: 'The top of the tower - Face the final challenge!',
        availableFormations: [
            'DOUBLE_GIFT',
            'FULL_ASSAULT',
            'GIFT_ARMY'
        ],
        isBossLevel: true
    }
]

// ========== DUNGEON MANAGEMENT FUNCTIONS ==========

// Get dungeon by ID
export const getDungeonById = (dungeonId) => {
    return DUNGEONS.find(dungeon => dungeon.id === dungeonId) || DUNGEONS[0]
}

// Get all dungeons
export const getAllDungeons = () => {
    return DUNGEONS
}

// Get default/first dungeon
export const getDefaultDungeon = () => {
    return DUNGEONS[0]
}

// ========== DUNGEON AVAILABILITY FUNCTIONS ==========

// Get available dungeons - Only first floor available initially
// Players must progress sequentially through the tower
export const getAvailableDungeons = (defeatedBosses = []) => {
    console.log(`🏰 CALCULATING AVAILABLE DUNGEONS - Defeated bosses:`, defeatedBosses);

    const allDungeons = getAllDungeons();

    // Only the first dungeon is available at the start
    // Players must progress sequentially through the tower
    const available = [allDungeons[0]];

    console.log(`📊 FINAL AVAILABLE DUNGEONS:`, available.map(d => d.name));
    return available;
}

// Alternative: Get all dungeons (for testing)
export const getAllAvailableDungeons = () => {
    return getAllDungeons();
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
    if (!dungeon) return false

    // Search for stairs (value 2) in the map
    const map = dungeon.map
    return map[position.y]?.[position.x] === 2
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
    if (!nextDungeonId) return 'You have reached the top of the tower! This is the final dungeon.'

    const nextDungeon = getDungeonById(nextDungeonId)
    return `You found the stairs to ${nextDungeon.name}!`
}