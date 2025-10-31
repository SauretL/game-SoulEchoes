// ========== UNIQUE ID GENERATION ==========

// Generate unique ID for enemy instances
export const generateUniqueEnemyId = (baseId, index) => {
    return `enemy_${baseId}_${index}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

// ========== DAMAGE CALCULATION ==========

export const calculateDamage = (attack, defense) => {
    // STEP 1: Calculate base damage
    const baseDamage = attack - defense

    // STEP 2: Determine multiplier range based on stat difference
    const difference = Math.abs(baseDamage)
    let minMultiplier, maxMultiplier

    if (difference <= 5) {
        // Close stats: wider variance (0.8x - 1.2x)
        minMultiplier = 0.8
        maxMultiplier = 1.2
    } else if (difference >= 6 && difference <= 10) {
        // Medium difference: moderate variance (0.85x - 1.15x)
        minMultiplier = 0.85
        maxMultiplier = 1.15
    } else {
        // Large difference: narrow variance (0.9x - 1.1x)
        minMultiplier = 0.9
        maxMultiplier = 1.1
    }

    // STEP 3: Apply random multiplier to base damage
    const randomMultiplier = minMultiplier + Math.random() * (maxMultiplier - minMultiplier)
    let finalDamage = baseDamage * randomMultiplier

    // STEP 4: Round up and ensure minimum damage of 1
    finalDamage = Math.ceil(finalDamage)
    finalDamage = Math.max(finalDamage, 1)

    return finalDamage
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

// Initialize combat state with player characters and enemies
export const initializeCombatState = (activeCharacters, enemies, playerCharactersHp, playerMaxHp) => {
    const playerCharacters = activeCharacters.front.concat(activeCharacters.back)
        .filter(char => char !== null)
        .map(char => ({
            ...char,
            currentHp: playerCharactersHp[char.id] || playerMaxHp,
            maxHp: playerMaxHp,
            physicalAttack: 12,
            psychicAttack: 10,
            physicalDefense: 6,
            psychicDefense: 2
        }))

    // enemies is an array
    const enemiesArray = Array.isArray(enemies) ? enemies : [enemies]

    // Generate unique IDs for each enemy instance
    const initializedEnemies = enemiesArray.map((enemy, index) => {
        const uniqueId = generateUniqueEnemyId(enemy.id, index)

        return {
            ...enemy,
            id: uniqueId, // Override with unique instance ID
            originalClassId: enemy.id, // Store original class ID for reference
            currentHp: enemy.currentHp || enemy.maxHp,
            isAlive: true
        }
    })

    return {
        playerCharacters,
        enemies: initializedEnemies,
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
    return position === 'front' ? 'fila delantera' : 'fila trasera'
}

// Get attack type text for battle log
export const getAttackTypeText = (attackType) => {
    return attackType === 'physical' ? 'Ataque Físico' : 'Ataque Psíquico'
}

// Get battle result text
export const getBattleResultText = (result, enemyName) => {
    if (result === 'victory') {
        return `¡Victoria! Has derrotado a ${enemyName}`
    } else {
        return `¡Derrota! Has sido derrotado por ${enemyName}`
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
        return { shouldEndBattle: false, error: 'La batalla ya terminó' }
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
    const criticalText = result.isCritical ? ' ¡GOLPE CRÍTICO!' : ''
    const logMessage = `${enemy.name} usa ${attackName} en ${targetPlayer.name} - ${actualDamage} de daño${criticalText}`

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
export const executePlayerAttack = (combatState, attackType, targetEnemy) => {
    const currentPlayer = combatState.playerCharacters[combatState.currentPlayerTurnIndex]

    // Skip defeated players
    if (currentPlayer.currentHp <= 0) {
        return { shouldSkipTurn: true }
    }

    // Perform attack against specific enemy
    const result = performAttack(currentPlayer, targetEnemy, attackType)

    // Ensure minimum 1 damage
    const actualDamage = Math.max(1, result.damage)

    // Create battle log message
    const attackName = attackType === 'physical' ? 'Ataque Físico' : 'Ataque Psíquico'
    const criticalText = result.isCritical ? ' ¡GOLPE CRÍTICO!' : ''
    const logMessage = `${currentPlayer.name} usa ${attackName} en ${targetEnemy.name} - ${actualDamage} de daño${criticalText}`

    // Calculate enemy HP after attack
    const updatedEnemyHp = Math.max(0, targetEnemy.currentHp - actualDamage)

    // Check if this specific enemy is defeated
    const enemyDefeated = updatedEnemyHp <= 0

    return {
        shouldEndBattle: enemyDefeated,
        shouldSkipTurn: false,
        updatedEnemyHp,
        logMessage,
        enemyDefeated
    }
}

// Execute position swap logic
export const executePlayerPositionSwap = (combatPositions, currentPlayer) => {
    // Calculate position swap
    const swapData = calculatePositionSwap(combatPositions, currentPlayer)

    if (!swapData) {
        return {
            success: false,
            message: `No hay espacio disponible en la ${swapData?.targetPosition === 'front' ? 'fila delantera' : 'fila trasera'}`
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

// ========== MULTI-ENEMY COMBAT FUNCTIONS ==========

// Check if all enemies are defeated
export const areAllEnemiesDefeated = (enemies) => {
    const allDefeated = enemies.every(enemy => enemy.currentHp <= 0 || !enemy.isAlive)
    return allDefeated
}

// Get random alive enemy for player targeting
export const getRandomAliveEnemy = (enemies) => {
    const aliveEnemies = enemies.filter(e => e.currentHp > 0 && e.isAlive)
    if (aliveEnemies.length === 0) return null

    const randomIndex = Math.floor(Math.random() * aliveEnemies.length)
    const selectedEnemy = aliveEnemies[randomIndex]

    return selectedEnemy
}

// Get all alive enemies for targeting
export const getAliveEnemies = (enemies) => {
    const aliveEnemies = enemies.filter(e => e.currentHp > 0 && e.isAlive)
    return aliveEnemies
}

// Check if enemy is targetable
export const isEnemyTargetable = (enemy) => {
    const targetable = enemy && enemy.currentHp > 0 && enemy.isAlive
    return targetable
}

// ========== TARGETING MODE MANAGEMENT ==========

// Validate attack type selection
export const canSelectAttackType = (currentTurn, battleStatus, currentPlayer) => {
    if (currentTurn !== 'player' || battleStatus !== 'ongoing') return false
    if (!currentPlayer || currentPlayer.currentHp <= 0) return false
    return true
}

// Get attack type display name
export const getAttackTypeName = (attackType) => {
    return attackType === 'physical' ? 'Ataque Físico' : 'Ataque Psíquico'
}

// Create targeting message for battle log
export const createTargetingMessage = (attackType) => {
    const attackName = getAttackTypeName(attackType)
    return `🎯 ${attackName} seleccionado - Haz clic en un enemigo para atacar`
}