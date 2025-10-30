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

// Get random enemy from enemy list
export const getRandomEnemy = (enemies) => {
    if (!enemies || enemies.length === 0) return null
    const randomIndex = Math.floor(Math.random() * enemies.length)
    return enemies[randomIndex]
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
export const executePlayerMovement = (currentPos, direction, map, enemies, encounterRate = 0.2) => {
    // Calculate new position
    const newPosition = calculateNewPosition(currentPos, direction, map)

    // If position is invalid, return no change
    if (!newPosition) {
        return {
            moved: false,
            newPosition: currentPos,
            combatTriggered: false,
            enemy: null
        }
    }

    // Check for combat encounter
    const combatTriggered = shouldTriggerCombat(encounterRate) && enemies && enemies.length > 0
    const enemy = combatTriggered ? getRandomEnemy(enemies) : null

    return {
        moved: true,
        newPosition,
        combatTriggered,
        enemy
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