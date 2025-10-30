// ========== POSITION MANAGEMENT ==========

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
    if (map[newY]?.[newX] === 0) {
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

    // Floor
    return '·' // Floor
}

// ========== DUNGEON STATE UTILITIES ==========

// Get initial dungeon state
export const getInitialDungeonState = () => {
    return {
        playerPos: { x: 1, y: 1 },
        coinsCollected: 0,
        pendingCoins: 0,
        combatTriggered: false
    }
}

// Reset dungeon state to initial values
export const resetDungeonState = () => {
    return getInitialDungeonState()
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
            enemyParty: null
        }
    }

    // Check for combat encounter
    const combatTriggered = shouldTriggerCombat(encounterRate)

    return {
        moved: true,
        newPosition,
        combatTriggered,
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
    if (!formation || !formation.enemies || !enemiesData) {
        return []
    }

    // Map formation config to actual enemy instances
    return formation.enemies.map((config, index) => {
        // Find enemy data by ID
        const enemyData = enemiesData.find(e => e.id === config.enemyId)

        if (!enemyData) {
            console.warn(`Enemy with ID ${config.enemyId} not found in enemies.json`)
            return null
        }

        // Create enemy instance with combat properties
        return {
            id: `enemy_${index}`, // Unique ID for this instance
            ...enemyData, // Spread all enemy data (name, image, stats, etc.)
            currentHp: enemyData.maxHp, // Initialize current HP
            position: config.position, // front or back
            slot: config.slot, // 0, 1, or 2
            isAlive: true
        }
    }).filter(enemy => enemy !== null) // Remove any nulls from missing enemies
}

// Generate random enemy party for a specific dungeon
export const generateRandomEnemyParty = (dungeonId, enemiesData, getRandomFormationForDungeon) => {
    // Get random formation for this dungeon
    const formation = getRandomFormationForDungeon(dungeonId)

    if (!formation) {
        console.warn(`No formations available for dungeon ${dungeonId}`)
        // Fallback to single enemy
        const fallbackEnemy = enemiesData[0]
        return [{
            ...fallbackEnemy,
            id: 'enemy_0',
            currentHp: fallbackEnemy.maxHp,
            position: 'front',
            slot: 1,
            isAlive: true
        }]
    }

    console.log(`Generated formation: ${formation.name} (${formation.difficulty}) with ${formation.enemies.length} enemies`)

    // Generate party from formation
    return generateEnemyPartyFromFormation(formation, enemiesData)
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