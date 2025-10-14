// ========== DAMAGE CALCULATION ==========

// Calculate base damage between attack and defense
export const calculateDamage = (attack, defense) => {
    const damage = Math.max(attack - defense, 1) // Minimum 1 damage
    return damage
}

// ========== COMBAT ACTIONS ==========

// Perform an attack between attacker and defender
export const performAttack = (attacker, defender, attackType) => {
    let damage = 0

    if (attackType === 'physical') {
        damage = calculateDamage(attacker.physicalAttack, defender.physicalDefense)
    } else if (attackType === 'psychic') {
        damage = calculateDamage(attacker.psychicAttack, defender.psychicDefense)
    }

    // Apply critical hit chance (10%)
    const isCritical = Math.random() < 0.1
    if (isCritical) {
        damage = Math.floor(damage * 1.5)
    }

    return {
        damage,
        attackType,
        isCritical
    }
}

// ========== ENEMY AI ==========

// Enemy AI to choose and perform attacks
export const enemyAI = (enemy, player) => {
    // Randomly choose between physical and psychic attack
    const attackTypes = ['physical', 'psychic']
    const randomAttack = attackTypes[Math.floor(Math.random() * attackTypes.length)]

    return performAttack(enemy, player, randomAttack)
}

// ========== BATTLE STATUS CHECK ==========

// Check if battle has ended and who won
export const checkBattleEnd = (playerCharacters, enemy) => {
    // Check if all players are defeated
    const alivePlayers = playerCharacters.filter(player => player.currentHp > 0)
    if (alivePlayers.length === 0) {
        return 'player_lost'
    } else if (enemy.currentHp <= 0) {
        return 'player_won'
    }
    return 'ongoing'
}

// ========== REWARDS AND PENALTIES ==========

// Calculate coins rewarded for winning battle
export const getBattleReward = () => {
    const baseCoins = Math.floor(Math.random() * 10) + 1 // 1-10 coins
    const bonus = 3 // +3 bonus coins
    return baseCoins + bonus
}

// Calculate coins lost for losing battle
export const getBattlePenalty = () => {
    return 50 // Lose 50 coins when losing
}

// ========== CHARACTER HP MANAGEMENT ==========

// Update character HP (for multiple characters)
export const updateCharacterHp = (characterId, newHp, currentHpState) => {
    return {
        ...currentHpState,
        [characterId]: Math.max(0, newHp)
    }
}

// Reset character HP to max (for multiple characters)
export const resetCharacterHp = (characterId, maxHp, currentHpState) => {
    return {
        ...currentHpState,
        [characterId]: maxHp
    }
}

// Get total alive players count
export const getAlivePlayersCount = (playerCharacters) => {
    return playerCharacters.filter(player => player.currentHp > 0).length
}

// Get first alive player (for targeting)
export const getFirstAlivePlayer = (playerCharacters) => {
    return playerCharacters.find(player => player.currentHp > 0) || null
}

// ========== ENEMY TARGETING LOGIC ==========

// Get random alive player target
export const getRandomAlivePlayer = (playerCharacters) => {
    const alivePlayers = playerCharacters.filter(player => player.currentHp > 0)
    if (alivePlayers.length === 0) return null

    const randomIndex = Math.floor(Math.random() * alivePlayers.length)
    return alivePlayers[randomIndex]
}

// ========== PLAYER TURN MANAGEMENT ==========

// Find next alive player for turn rotation
export const findNextAlivePlayer = (playerCharacters, currentIndex) => {
    const totalPlayers = playerCharacters.length
    for (let i = 1; i <= totalPlayers; i++) {
        const nextIndex = (currentIndex + i) % totalPlayers
        if (playerCharacters[nextIndex].currentHp > 0) {
            return nextIndex
        }
    }
    return -1 // No players found alive
}

// ========== UI UTILITY FUNCTIONS ==========

// Calculate HP percentage for health bars
export const getHpPercentage = (current, max) => {
    return Math.max((current / max) * 100, 0)
}

// ========== POSITION MANAGEMENT ==========

// Calculate position swap data for character movement
export const calculatePositionSwap = (combatPositions, currentPlayer) => {
    let currentPosition = null
    let currentSlot = null

    // Check front row
    for (let i = 0; i < combatPositions.front.length; i++) {
        if (combatPositions.front[i]?.id === currentPlayer.id) {
            currentPosition = 'front'
            currentSlot = i
            break
        }
    }

    // Check back row if not found in front
    if (!currentPosition) {
        for (let i = 0; i < combatPositions.back.length; i++) {
            if (combatPositions.back[i]?.id === currentPlayer.id) {
                currentPosition = 'back'
                currentSlot = i
                break
            }
        }
    }

    if (!currentPosition) return null

    const targetPosition = currentPosition === 'front' ? 'back' : 'front'
    const targetSlot = combatPositions[targetPosition].findIndex(slot => slot === null)

    if (targetSlot === -1) return null

    return {
        currentPosition,
        currentSlot,
        targetPosition,
        targetSlot
    }
}

// Execute position swap between rows
export const executePositionSwap = (combatPositions, swapData, currentPlayer) => {
    const newPositions = { ...combatPositions }
    const { currentPosition, currentSlot, targetPosition, targetSlot } = swapData

    newPositions[currentPosition][currentSlot] = null
    newPositions[targetPosition][targetSlot] = currentPlayer

    return newPositions
}

// ========== COMBAT STATE INITIALIZATION ==========

// Initialize combat state with player characters and enemy
export const initializeCombatState = (activeCharacters, enemy, playerCharactersHp, playerMaxHp) => {
    const playerCharacters = activeCharacters.front.concat(activeCharacters.back)
        .filter(char => char !== null)
        .map(char => ({
            ...char,
            currentHp: playerCharactersHp[char.id] || playerMaxHp,
            maxHp: playerMaxHp,
            physicalAttack: 12,
            psychicAttack: 10,
            physicalDefense: 8,
            psychicDefense: 6
        }))

    return {
        playerCharacters,
        enemy: {
            ...enemy,
            currentHp: enemy.maxHp || 80
        },
        currentTurn: 'player',
        currentPlayerTurnIndex: 0,
        battleLog: [],
        battleStatus: 'ongoing'
    }
}

// ========== BATTLE LOG MANAGEMENT ==========

// Add message to battle log
export const addToBattleLog = (battleLog, message) => {
    return [...battleLog, { message, timestamp: Date.now() }]
}

// Get last N battle log messages
export const getLastBattleLogs = (battleLog, count = 6) => {
    return battleLog.slice(-count)
}

// ========== COMBAT TEXT UTILITIES ==========

// Get position text for battle log
export const getPositionText = (position) => {
    return position === 'front' ? 'delantera' : 'trasera'
}

// Get attack type text for battle log
export const getAttackTypeText = (attackType) => {
    return attackType === 'physical' ? 'Ataque Físico' : 'Ataque Psíquico'
}

// Get battle result text
export const getBattleResultText = (result, enemyName) => {
    if (result === 'victory') {
        return `¡Victoria! Derrotaste a ${enemyName}`
    } else {
        return `¡Derrota! Fuiste derrotado por ${enemyName}`
    }
}