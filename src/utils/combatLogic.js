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

// ========== TURN MANAGEMENT ==========

// Handle end of player turn and determine next action (next player or enemy turn)
export const handleEndPlayerTurn = (combatState) => {
    const alivePlayers = combatState.playerCharacters.filter(player => player.currentHp > 0)

    // If no alive players, battle should end in defeat
    if (alivePlayers.length === 0) {
        return { shouldEndBattle: true, result: 'defeat' }
    }

    // Try to find the next alive player
    let nextIndex = (combatState.currentPlayerTurnIndex + 1) % combatState.playerCharacters.length
    let attempts = 0
    let foundNextPlayer = false

    // Search for next alive player
    while (attempts < combatState.playerCharacters.length) {
        if (combatState.playerCharacters[nextIndex].currentHp > 0) {
            foundNextPlayer = true
            break
        }
        nextIndex = (nextIndex + 1) % combatState.playerCharacters.length
        attempts++
    }

    // Check if we've cycled through all players
    if (foundNextPlayer && nextIndex > combatState.currentPlayerTurnIndex) {
        // There's another player in this round, continue with them
        return {
            shouldEndBattle: false,
            newState: {
                currentPlayerTurnIndex: nextIndex,
                currentTurn: 'player'
            }
        }
    } else if (foundNextPlayer && nextIndex <= combatState.currentPlayerTurnIndex) {
        // We've wrapped around - all players have had their turn, switch to enemy
        return {
            shouldEndBattle: false,
            newState: {
                currentTurn: 'enemy',
                currentPlayerTurnIndex: nextIndex
            }
        }
    } else {
        // Fallback: switch to enemy
        return {
            shouldEndBattle: false,
            newState: {
                currentTurn: 'enemy',
                currentPlayerTurnIndex: 0
            }
        }
    }
}

// Execute enemy turn logic
export const executeEnemyTurn = (combatState, enemy) => {
    // Validate if enemy can attack
    if (combatState.battleStatus !== 'ongoing') {
        return { shouldEndBattle: false, error: 'Battle already ended' }
    }

    // Check for alive players
    const alivePlayers = combatState.playerCharacters.filter(char => char.currentHp > 0)
    if (alivePlayers.length === 0) {
        return { shouldEndBattle: true, result: 'defeat' }
    }

    // Select random alive player as target
    const randomPlayerIndex = Math.floor(Math.random() * alivePlayers.length)
    const targetPlayer = alivePlayers[randomPlayerIndex]

    // Enemy attacks selected player
    const result = enemyAI(enemy, targetPlayer)

    // Ensure minimum 1 damage
    const actualDamage = Math.max(1, result.damage)

    // Calculate player HP after attack
    const updatedPlayerHp = Math.max(0, targetPlayer.currentHp - actualDamage)

    // Update players with new HP
    const updatedPlayers = combatState.playerCharacters.map(char =>
        char.id === targetPlayer.id
            ? { ...char, currentHp: updatedPlayerHp }
            : char
    )

    // Create battle log message
    const attackName = result.attackType === 'physical' ? 'Ataque Físico' : 'Ataque Psíquico'
    const criticalText = result.isCritical ? ' ¡CRÍTICO!' : ''
    const logMessage = `${enemy.name} usa ${attackName} contra ${targetPlayer.name} - ${actualDamage} daño${criticalText}`

    // Check if battle ends with this attack
    const battleResult = checkBattleEnd(updatedPlayers, enemy)

    if (battleResult === 'player_lost') {
        return {
            shouldEndBattle: true,
            result: 'defeat',
            updatedPlayers,
            logMessage,
            targetPlayerId: targetPlayer.id,
            updatedPlayerHp
        }
    }

    // Return updated state for continuing battle
    return {
        shouldEndBattle: false,
        updatedPlayers,
        logMessage,
        targetPlayerId: targetPlayer.id,
        updatedPlayerHp,
        newState: {
            playerCharacters: updatedPlayers,
            currentTurn: 'player',
            currentPlayerTurnIndex: findNextAlivePlayer(updatedPlayers, -1)
        }
    }
}

// Execute player attack logic
export const executePlayerAttack = (combatState, attackType) => {
    const currentPlayer = combatState.playerCharacters[combatState.currentPlayerTurnIndex]

    // Skip defeated players
    if (currentPlayer.currentHp <= 0) {
        return { shouldSkipTurn: true }
    }

    // Perform attack
    const result = performAttack(currentPlayer, combatState.enemy, attackType)

    // Ensure minimum 1 damage
    const actualDamage = Math.max(1, result.damage)

    // Create battle log message
    const attackName = attackType === 'physical' ? 'Ataque Físico' : 'Ataque Psíquico'
    const criticalText = result.isCritical ? ' ¡CRÍTICO!' : ''
    const logMessage = `${currentPlayer.name} usa ${attackName} - ${actualDamage} daño${criticalText}`

    // Calculate enemy HP after attack
    const updatedEnemyHp = Math.max(0, combatState.enemy.currentHp - actualDamage)

    // Check if battle ends with this attack
    const battleResult = checkBattleEnd(combatState.playerCharacters, {
        ...combatState.enemy,
        currentHp: updatedEnemyHp
    })

    if (battleResult === 'player_won') {
        return {
            shouldEndBattle: true,
            result: 'victory',
            updatedEnemyHp,
            logMessage
        }
    }

    // Battle continues
    return {
        shouldEndBattle: false,
        shouldSkipTurn: false,
        updatedEnemyHp,
        logMessage
    }
}

// Execute position swap logic
export const executePlayerPositionSwap = (combatPositions, currentPlayer) => {
    // Calculate position swap
    const swapData = calculatePositionSwap(combatPositions, currentPlayer)

    if (!swapData) {
        return {
            success: false,
            message: `No hay espacio disponible en la fila ${swapData?.targetPosition === 'front' ? 'delantera' : 'trasera'}`
        }
    }

    // Execute the position swap
    const newPositions = executePositionSwap(combatPositions, swapData, currentPlayer)

    const positionText = swapData.targetPosition === 'front' ? 'delantera' : 'trasera'
    const logMessage = `${currentPlayer.name} se mueve a la fila ${positionText}`

    return {
        success: true,
        newPositions,
        logMessage
    }
}