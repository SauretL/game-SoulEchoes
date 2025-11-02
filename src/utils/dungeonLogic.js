// ========== POSITION MANAGEMENT ========== //

// Calculate new position based on direction
export const calculateNewPosition = (currentPos, direction, map) => {
    let newX = currentPos.x
    let newY = currentPos.y

    // Calculate new coordinates based on direction
    switch (direction) {
        case 'up':
            newY--
            break
        case 'down':
            newY++
            break
        case 'left':
            newX--
            break
        case 'right':
            newX++
            break
        default:
            return null // Invalid direction
    }

    // Check if new position is valid (within bounds and not a wall)
    // Allow stairs (value 2) as valid movement
    if (map[newY]?.[newX] === 0 || map[newY]?.[newX] === 2) {
        return { x: newX, y: newY }
    }

    return null // Position is blocked by wall
}

// Get position text for character display
export const getCharacterPositionText = (activeCharacters, character) => {
    const positions = ['Izquierda', 'Centro', 'Derecha']

    // Check front row
    const frontIndex = activeCharacters.front.findIndex(char => char?.id === character.id)
    if (frontIndex !== -1) {
        return `Delantera ${positions[frontIndex]}`
    }

    // Check back row
    const backIndex = activeCharacters.back.findIndex(char => char?.id === character.id)
    if (backIndex !== -1) {
        return `Trasera ${positions[backIndex]}`
    }

    return null
}

// ========== COMBAT ENCOUNTER LOGIC ==========

// Check if combat should be triggered (probability-based)
export const shouldTriggerCombat = (encounterRate = 0.2) => {
    return Math.random() < encounterRate
}

// ========== ACTIVE CHARACTERS PROCESSING ==========

// Get all active characters with their position data
export const getAllActiveCharacters = (activeCharacters) => {
    const positions = ['Izquierda', 'Centro', 'Derecha']
    const allActiveChars = []

    // Add front row characters
    activeCharacters.front.forEach((char, index) => {
        if (char) {
            allActiveChars.push({
                ...char,
                position: `Delantera ${positions[index]}`,
                row: 'front',
                slot: index
            })
        }
    })

    // Add back row characters
    activeCharacters.back.forEach((char, index) => {
        if (char) {
            allActiveChars.push({
                ...char,
                position: `Trasera ${positions[index]}`,
                row: 'back',
                slot: index
            })
        }
    })

    return allActiveChars
}

// Get count of active characters
export const getActiveCharactersCount = (activeCharacters) => {
    const frontCount = activeCharacters.front.filter(char => char !== null).length
    const backCount = activeCharacters.back.filter(char => char !== null).length
    return frontCount + backCount
}

// ========== MAP RENDERING UTILITIES ==========

// Get cell display character for map rendering
export const getCellDisplay = (cell, x, y, playerPos) => {
    // Player position
    if (x === playerPos.x && y === playerPos.y) {
        return '☻' // Player character
    }

    // Wall
    if (cell === 1) {
        return '█' // Wall
    }

    // Stairs
    if (cell === 2) {
        return '⇧' // Stairs to next level
    }

    // Floor
    return '·' // Floor
}

// ========== DUNGEON STATE UTILITIES ==========

// Get initial dungeon state
export const getInitialDungeonState = (startPosition = { x: 1, y: 1 }) => {
    return {
        playerPos: startPosition,
        coinsCollected: 0,
        pendingCoins: 0,
        combatTriggered: false
    }
}

// Reset dungeon state to initial values
export const resetDungeonState = (startPosition = { x: 1, y: 1 }) => {
    return getInitialDungeonState(startPosition)
}

// ========== KEYBOARD INPUT HANDLING ==========

// Map keyboard keys to movement directions
export const getDirectionFromKey = (key) => {
    const keyMap = {
        'ArrowUp': 'up',
        'ArrowDown': 'down',
        'ArrowLeft': 'left',
        'ArrowRight': 'right',
        'w': 'up',
        'W': 'up',
        's': 'down',
        'S': 'down',
        'a': 'left',
        'A': 'left',
        'd': 'right',
        'D': 'right'
    }

    return keyMap[key] || null
}

// Check if key is a reset command
export const isResetKey = (key) => {
    return key === 'r' || key === 'R'
}

// ========== PLAYER MOVEMENT LOGIC ==========

// Execute player movement with combat check
export const executePlayerMovement = (currentPos, direction, map, dungeonId, encounterRate = 0.2) => {
    // Calculate new position
    const newPosition = calculateNewPosition(currentPos, direction, map)

    // If position is invalid, return no change
    if (!newPosition) {
        return {
            moved: false,
            newPosition: currentPos,
            combatTriggered: false,
            levelUp: false
        }
    }

    // Check if player stepped on stairs
    const isOnStairs = map[newPosition.y]?.[newPosition.x] === 2

    // Check for combat encounter (only if not on stairs)
    const combatTriggered = !isOnStairs && shouldTriggerCombat(encounterRate)

    return {
        moved: true,
        newPosition,
        combatTriggered,
        levelUp: isOnStairs, // Signal level up if on stairs
        dungeonId // Pass dungeon ID so we can generate appropriate formation
    }
}
// ========== COIN MANAGEMENT ==========

// Process pending coins to collected coins
export const processPendingCoins = (pendingCoins) => {
    return {
        coinsToAdd: pendingCoins,
        newPendingCoins: 0
    }
}

// ========== HP MANAGEMENT FOR CHARACTERS ==========

// Reset all character HP to max
export const resetAllCharactersHP = (activeCharacters, maxHp) => {
    const allCharacters = [...activeCharacters.front, ...activeCharacters.back]
        .filter(char => char !== null)

    return allCharacters.map(char => ({
        characterId: char.id,
        newHp: maxHp
    }))
}

// ========== ENEMY PARTY GENERATION ==========

// Generate enemy party from formation configuration
export const generateEnemyPartyFromFormation = (formation, enemiesData) => {
    console.log(`🔍 DUNGEON ENEMY GENERATION - Iniciando generación de grupo enemigo desde formación`)
    console.log(`🔍 FORMATION DATA - Formación recibida:`, formation)
    console.log(`🔍 ENEMIES DATA SOURCE - Total enemigos disponibles: ${enemiesData?.length || 0}`)

    if (!formation || !formation.enemies || !enemiesData) {
        console.warn(`🔍 ENEMY GENERATION FAILED - Datos de formación o enemigos faltantes`)
        return []
    }

    console.log(`🔍 FORMATION ENEMIES - Configuración de enemigos en formación:`, formation.enemies)

    // Map formation config to actual enemy instances
    const enemyParty = formation.enemies.map((config, index) => {
        console.log(`🔍 PROCESSING ENEMY CONFIG [${index}] - Buscando enemigo ID: ${config.enemyId}, Posición: ${config.position}, Slot: ${config.slot}`)

        // Find enemy data by ID
        const enemyData = enemiesData.find(e => e.id === config.enemyId)

        if (!enemyData) {
            console.warn(`🔍 ENEMY NOT FOUND - Enemigo con ID ${config.enemyId} no encontrado en enemies.json`)
            return null
        }

        console.log(`🔍 ENEMY DATA FOUND - ${enemyData.name} encontrado:`, {
            id: enemyData.id,
            maxHp: enemyData.maxHp,
            physicalAttack: enemyData.physicalAttack,
            psychicAttack: enemyData.psychicAttack,
            physicalDefense: enemyData.physicalDefense,
            psychicDefense: enemyData.psychicDefense
        })

        // Create truly unique ID combining enemyId, position, slot, and timestamp
        const uniqueId = `enemy_${config.enemyId}_${config.position}_${config.slot}_${index}_${Date.now()}`

        console.log(`🔍 ENEMY INSTANCE CREATED - ID único: ${uniqueId}`)

        // Create enemy instance with combat properties
        return {
            id: uniqueId, // Truly unique ID for this instance
            enemyTypeId: config.enemyId, // Store original enemy type ID for reference
            ...enemyData, // Spread all enemy data (name, image, stats, etc.)
            currentHp: enemyData.maxHp, // Initialize current HP
            position: config.position, // front or back
            slot: config.slot, // 0, 1, or 2
            isAlive: true
        }
    }).filter(enemy => enemy !== null) // Remove any nulls from missing enemies

    console.log(`🔍 ENEMY PARTY COMPLETE - Grupo generado con ${enemyParty.length} enemigos:`,
        enemyParty.map(e => `${e.name} (ID: ${e.id}, HP: ${e.currentHp}/${e.maxHp})`))

    return enemyParty
}

// Generate random enemy party for a specific dungeon
export const generateRandomEnemyParty = (dungeonId, enemiesData, getRandomFormationForDungeon) => {
    console.log(`🔍 RANDOM ENEMY PARTY GENERATION - Iniciando para dungeon: ${dungeonId}`)
    console.log(`🔍 AVAILABLE ENEMIES DATA - Total tipos de enemigos: ${enemiesData?.length || 0}`)

    if (enemiesData && enemiesData.length > 0) {
        console.log(`🔍 ENEMY TYPES AVAILABLE - Lista de enemigos disponibles:`,
            enemiesData.map(e => `${e.name} (ID: ${e.id}, HP: ${e.maxHp})`))
    }

    // Get random formation for this dungeon
    const formation = getRandomFormationForDungeon(dungeonId)
    console.log(`🔍 SELECTED FORMATION - Formación aleatoria para dungeon ${dungeonId}:`, formation)

    if (!formation) {
        console.warn(`🔍 NO FORMATION FOUND - Sin formaciones disponibles para dungeon ${dungeonId}`)

        // Fallback to single enemy with unique ID
        const fallbackEnemy = enemiesData?.[0]
        if (fallbackEnemy) {
            console.log(`🔍 FALLBACK ENEMY CREATED - Usando enemigo por defecto: ${fallbackEnemy.name}`)
            const fallbackParty = [{
                ...fallbackEnemy,
                id: `enemy_fallback_${Date.now()}`, // Unique fallback ID
                enemyTypeId: fallbackEnemy.id,
                currentHp: fallbackEnemy.maxHp,
                position: 'front',
                slot: 1,
                isAlive: true
            }]
            console.log(`🔍 FALLBACK PARTY - Grupo de respaldo creado:`, fallbackParty)
            return fallbackParty
        } else {
            console.error(`🔍 CRITICAL ERROR - No hay enemigos disponibles para crear grupo de respaldo`)
            return []
        }
    }

    // Generate party from formation
    console.log(`🔍 GENERATING PARTY FROM FORMATION - Usando formación con ${formation.enemies?.length || 0} enemigos`)
    const enemyParty = generateEnemyPartyFromFormation(formation, enemiesData)

    console.log(`🔍 RANDOM ENEMY PARTY FINAL - Grupo enemigo completo para dungeon ${dungeonId}:`,
        enemyParty.map(e => ({
            name: e.name,
            id: e.id,
            typeId: e.enemyTypeId,
            hp: `${e.currentHp}/${e.maxHp}`,
            position: e.position,
            slot: e.slot,
            stats: {
                physAtk: e.physicalAttack,
                psyAtk: e.psychicAttack,
                physDef: e.physicalDefense,
                psyDef: e.psychicDefense
            }
        })))

    return enemyParty
}

// ========== VALIDATION UTILITIES ==========

// Check if movement is allowed (not in combat)
export const isMovementAllowed = (inCombat) => {
    return !inCombat
}

// Validate active characters configuration
export const hasActiveCharacters = (activeCharacters) => {
    const count = getActiveCharactersCount(activeCharacters)
    return count > 0
}

// ========== STAIRS MANAGEMENT ==========

// Check if position has stairs
export const isStairsPosition = (dungeonId, position, getDungeonById) => {
    const dungeon = getDungeonById(dungeonId)
    if (!dungeon || !dungeon.stairsPos) return false

    return position.x === dungeon.stairsPos.x && position.y === dungeon.stairsPos.y
}

// Get next dungeon ID
export const getNextDungeonId = (currentDungeonId, getDungeonById) => {
    const dungeon = getDungeonById(currentDungeonId)
    return dungeon?.nextDungeonId || null
}