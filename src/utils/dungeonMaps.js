// dungeon map layout (1 = wall, 0 = floor)

// Dungeon 1: Beginner
export const DUNGEON_1_MAP = [
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    [1, 0, 0, 1, 0, 0, 1, 1, 1, 1, 0, 0, 1],
    [1, 0, 1, 1, 0, 0, 1, 1, 1, 1, 0, 0, 1],
    [1, 0, 1, 1, 0, 1, 1, 1, 1, 1, 1, 0, 1],
    [1, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 1],
    [1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 1, 1, 1, 1, 0, 1, 1, 1, 1, 0, 1],
    [1, 0, 1, 0, 0, 0, 0, 1, 1, 1, 1, 0, 1],
    [1, 0, 1, 0, 1, 1, 1, 1, 1, 0, 0, 0, 1],
    [1, 0, 1, 0, 0, 0, 1, 1, 1, 0, 0, 0, 1],
    [1, 0, 1, 1, 1, 0, 1, 1, 1, 0, 0, 0, 1],
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]
]

// Dungeon 2: Intermediate
export const DUNGEON_2_MAP = [
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 1, 1, 1, 1, 0, 1, 1, 1, 1, 0, 1],
    [1, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1],
    [1, 0, 1, 0, 1, 1, 1, 1, 1, 0, 1, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 1, 1, 1, 0, 1, 0, 1, 1, 1, 0, 1],
    [1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1],
    [1, 1, 1, 1, 1, 0, 1, 0, 1, 1, 1, 1, 1],
    [1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1],
    [1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]
]

// Dungeon 3: Advanced
export const DUNGEON_3_MAP = [
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    [1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1],
    [1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1],
    [1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1],
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]
]

// ========== DUNGEON METADATA ==========

// Dungeon configurations with metadata
export const DUNGEONS = [
    {
        id: 1,
        name: 'Mazmorra Básica',
        difficulty: 'Principiante',
        map: DUNGEON_1_MAP,
        startPos: { x: 1, y: 1 },
        encounterRate: 0.2, // 20% chance
        description: 'Una mazmorra simple para comenzar tu aventura',
        minLevel: 1,
        maxLevel: 5
    },
    {
        id: 2,
        name: 'Laberinto Oscuro',
        difficulty: 'Intermedio',
        map: DUNGEON_2_MAP,
        startPos: { x: 1, y: 1 },
        encounterRate: 0.3, // 30% chance
        description: 'Un laberinto complejo con más enemigos',
        minLevel: 6,
        maxLevel: 10
    },
    {
        id: 3,
        name: 'Arena de Combate',
        difficulty: 'Avanzado',
        map: DUNGEON_3_MAP,
        startPos: { x: 6, y: 6 }, // Center of arena
        encounterRate: 0.4, // 40% chance
        description: 'Una arena abierta con combates intensos',
        minLevel: 11,
        maxLevel: 20
    }
]

// ========== HELPER FUNCTIONS ==========

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