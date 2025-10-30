// ========== ENEMY FORMATIONS ==========

// Enemy formation configurations
// Each formation defines enemies with their type, position (front/back), and slot (0-2)
export const ENEMY_FORMATIONS = {
    // ===== BEGINNER FORMATIONS =====
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

    // ===== INTERMEDIATE FORMATIONS =====
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

    // ===== ADVANCED FORMATIONS =====
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
        encounterRate: 0.2, // 20% chance per step
        description: 'Una mazmorra simple para comenzar tu aventura',
        minLevel: 1,
        maxLevel: 5,
        // Available enemy formations for this dungeon (beginner only)
        availableFormations: [
            'SINGLE_SEED',
            'DOUBLE_SEED',
            'SEED_TRIO'
        ]
    },
    {
        id: 2,
        name: 'Laberinto Oscuro',
        difficulty: 'Intermedio',
        map: DUNGEON_2_MAP,
        startPos: { x: 1, y: 1 },
        encounterRate: 0.3, // 30% chance per step
        description: 'Un laberinto complejo con más enemigos',
        minLevel: 6,
        maxLevel: 10,
        // Available enemy formations for this dungeon (beginner + intermediate)
        availableFormations: [
            'SINGLE_SEED',
            'DOUBLE_SEED',
            'SEED_TRIO',
            'MIXED_PAIR',
            'GIFT_GUARDIAN',
            'BALANCED_SQUAD'
        ]
    },
    {
        id: 3,
        name: 'Arena de Combate',
        difficulty: 'Avanzado',
        map: DUNGEON_3_MAP,
        startPos: { x: 6, y: 6 }, // Center of arena
        encounterRate: 0.4, // 40% chance per step
        description: 'Una arena abierta con combates intensos',
        minLevel: 11,
        maxLevel: 20,
        // Available enemy formations for this dungeon (all formations)
        availableFormations: [
            'SEED_TRIO',
            'MIXED_PAIR',
            'GIFT_GUARDIAN',
            'BALANCED_SQUAD',
            'DOUBLE_GIFT',
            'FULL_ASSAULT',
            'GIFT_ARMY'
        ]
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