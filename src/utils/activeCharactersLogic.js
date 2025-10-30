// ========== ACTIVE CHARACTERS UTILITIES ==========

// Count total active characters across all positions
export const getActiveCharactersCount = (activeCharacters) => {
    const frontCount = activeCharacters.front.filter(char => char !== null).length
    const backCount = activeCharacters.back.filter(char => char !== null).length
    return frontCount + backCount
}

// Check if a character is currently active in any position
export const isCharacterActive = (activeCharacters, character) => {
    return activeCharacters.front.some(char => char?.id === character.id) ||
        activeCharacters.back.some(char => char?.id === character.id)
}

// Get the current position of an active character
export const getCharacterPosition = (activeCharacters, character) => {
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

// Get position text by row and slot index
export const getPositionText = (position, slot) => {
    const positions = ['Izquierda', 'Centro', 'Derecha']
    const rowText = position === 'front' ? 'Delantera' : 'Trasera'
    return `${rowText} ${positions[slot]}`
}

// ========== ACTIVE CHARACTER VALIDATION ==========

// Validate if a character can be added to active team
export const canAddToActiveTeam = (activeCharacters, character, maxActiveCharacters = 6) => {
    // Check if already active
    if (isCharacterActive(activeCharacters, character)) {
        return {
            valid: false,
            reason: 'already_active',
            message: `${character.name} ya está en la posición: ${getCharacterPosition(activeCharacters, character)}`
        }
    }

    // Check max active characters
    const activeCount = getActiveCharactersCount(activeCharacters)
    if (activeCount >= maxActiveCharacters) {
        return {
            valid: false,
            reason: 'team_full',
            message: `Solo puedes tener hasta ${maxActiveCharacters} Almas Elegidas. Retira una antes de continuar.`
        }
    }

    return {
        valid: true,
        reason: null,
        message: null
    }
}

// Validate if a character can be removed from active team
export const canRemoveFromActiveTeam = (activeCharacters, minActiveCharacters = 1) => {
    const activeCount = getActiveCharactersCount(activeCharacters)

    if (activeCount <= minActiveCharacters) {
        return {
            valid: false,
            reason: 'last_character',
            message: '¡No puedes retirar tu última Alma Elegida!'
        }
    }

    return {
        valid: true,
        reason: null,
        message: null
    }
}

// Check if a slot is available
export const isSlotAvailable = (activeCharacters, position, slot) => {
    return activeCharacters[position][slot] === null
}

// ========== ACTIVE CHARACTER MANAGEMENT ==========

// Add character to specific position and slot
export const addCharacterToSlot = (activeCharacters, character, position, slot) => {
    const newActive = {
        front: [...activeCharacters.front],
        back: [...activeCharacters.back]
    }

    // Add character to selected slot
    newActive[position][slot] = character

    return newActive
}

// Remove character from active team
export const removeCharacterFromTeam = (activeCharacters, character) => {
    const newActive = {
        front: [...activeCharacters.front],
        back: [...activeCharacters.back]
    }

    // Remove character from front row
    newActive.front = newActive.front.map(posChar =>
        posChar?.id === character.id ? null : posChar
    )

    // Remove character from back row
    newActive.back = newActive.back.map(posChar =>
        posChar?.id === character.id ? null : posChar
    )

    return newActive
}

// Get all active characters as a flat array with position info
export const getAllActiveCharactersWithPositions = (activeCharacters) => {
    const positions = ['Izquierda', 'Centro', 'Derecha']
    const allActive = []

    // Add front row characters
    activeCharacters.front.forEach((char, index) => {
        if (char) {
            allActive.push({
                ...char,
                position: 'front',
                slot: index,
                positionText: `Delantera ${positions[index]}`
            })
        }
    })

    // Add back row characters
    activeCharacters.back.forEach((char, index) => {
        if (char) {
            allActive.push({
                ...char,
                position: 'back',
                slot: index,
                positionText: `Trasera ${positions[index]}`
            })
        }
    })

    return allActive
}

// Find first available slot in any row
export const findFirstAvailableSlot = (activeCharacters) => {
    // Check front row first
    for (let i = 0; i < activeCharacters.front.length; i++) {
        if (activeCharacters.front[i] === null) {
            return { position: 'front', slot: i }
        }
    }

    // Check back row
    for (let i = 0; i < activeCharacters.back.length; i++) {
        if (activeCharacters.back[i] === null) {
            return { position: 'back', slot: i }
        }
    }

    return null // No available slots
}

// ========== SLOT INFORMATION ==========

// Get slot status (empty, occupied with character name)
export const getSlotStatus = (activeCharacters, position, slot) => {
    const character = activeCharacters[position][slot]

    if (character) {
        return {
            occupied: true,
            character: character,
            displayText: `Ocupado: ${character.name}`
        }
    }

    return {
        occupied: false,
        character: null,
        displayText: `Posición ${slot + 1} - ${position === 'front' ? 'Delantera' : 'Trasera'}`
    }
}

// Get all slots info for a specific row
export const getRowSlotsInfo = (activeCharacters, position) => {
    return [0, 1, 2].map(slot => ({
        slot,
        position,
        ...getSlotStatus(activeCharacters, position, slot)
    }))
}

// ========== TEAM STATISTICS ==========

// Get team composition statistics
export const getTeamStats = (activeCharacters) => {
    const allActive = getAllActiveCharactersWithPositions(activeCharacters)

    return {
        totalActive: allActive.length,
        frontRowCount: activeCharacters.front.filter(char => char !== null).length,
        backRowCount: activeCharacters.back.filter(char => char !== null).length,
        rarityBreakdown: {
            tier3: allActive.filter(char => char.rarityTier === 3).length,
            tier2: allActive.filter(char => char.rarityTier === 2).length,
            tier1: allActive.filter(char => char.rarityTier === 1).length
        },
        characters: allActive
    }
}