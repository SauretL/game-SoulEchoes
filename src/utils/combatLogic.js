// ========== IMPORTS ==========
import {
    STATUS_EFFECTS,
    applyStatusEffect,
    processStartOfTurnStatusEffects,
    processDamageTriggeredStatusEffects,
    processEndOfTurnStatusEffects,
    applyStatusEffectStats,
    canCharacterActNormally,
    getConfusionAttackTarget,
    getStatusEffectDisplayInfo,
    getStatusEffectText,
    createStatusEffectMessage,
    hasStatusEffects
} from './statusEffects'

import {
    ATTACKS,
    getAttack,
    getSpecialAttacks,
    getBasicAttacks
} from './attacks'

// ========== UNIQUE ID GENERATION ==========

// Generate unique ID for enemy instances
export const generateUniqueEnemyId = (baseId, index) => {
    return `enemy_${baseId}_${index}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

// ========== DAMAGE CALCULATION SYSTEM ==========

export const calculateDamage = (attack, defense, isStatusEffect = false) => {
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

    // STEP 5: Status effects cannot crit and have reduced damage
    if (isStatusEffect) {
        finalDamage = Math.max(1, Math.floor(finalDamage * 0.8))
    }

    return finalDamage
}

// ========== COMBAT ACTIONS SYSTEM ==========

// Perform basic attack
export const performAttack = (attacker, defender, attackType, isSpecial = false, specialAttackType = null) => {
    // Apply status effect stat modifications to defender
    const defenderStats = applyStatusEffectStats(defender)
    const modifiedDefender = {
        ...defender,
        physicalDefense: defenderStats.physicalDefense,
        psychicDefense: defenderStats.psychicDefense
    }

    let damage = 0
    let attackResult = {}

    if (isSpecial && specialAttackType) {
        attackResult = performSpecialAttack(attacker, modifiedDefender, specialAttackType)
    } else {
        // Basic attack
        if (attackType === 'physical') {
            damage = calculateDamage(attacker.physicalAttack, modifiedDefender.physicalDefense)
        } else if (attackType === 'psychic') {
            damage = calculateDamage(attacker.psychicAttack, modifiedDefender.psychicDefense)
        }

        // Apply critical hit chance (10%)
        const isCritical = Math.random() < 0.1
        if (isCritical) {
            damage = Math.floor(damage * 1.5)
        }

        attackResult = {
            damage,
            attackType,
            isCritical,
            isSpecial: false
        }
    }

    // Process trauma if defender receives damage
    if (attackResult.damage > 0) {
        const traumaEffects = processDamageTriggeredStatusEffects(defender, attackResult.attackType)
        traumaEffects.forEach(effect => {
            if (effect.type === STATUS_EFFECTS.TRAUMA) {
                // Add trauma damage to the attack
                attackResult.traumaDamage = effect.damage
                attackResult.totalDamage = attackResult.damage + effect.damage
            }
        })
    }

    return attackResult
}

// Perform special attack with status effect chance
export const performSpecialAttack = (attacker, defender, attackId) => {
    const attack = getAttack(attackId)

    if (!attack) {
        console.warn(`Unknown attack: ${attackId}`)
        return performAttack(attacker, defender, 'physical')
    }

    // Apply status effect stat modifications to defender
    const defenderStats = applyStatusEffectStats(defender)
    const modifiedDefender = {
        ...defender,
        physicalDefense: defenderStats.physicalDefense,
        psychicDefense: defenderStats.psychicDefense
    }

    // Calculate damage
    let damage = 0
    if (attack.type === 'physical') {
        damage = calculateDamage(attacker.physicalAttack + attack.damage, modifiedDefender.physicalDefense)
    } else if (attack.type === 'psychic') {
        damage = calculateDamage(attacker.psychicAttack + attack.damage, modifiedDefender.psychicDefense)
    }

    // Apply critical hit chance
    const isCritical = Math.random() < 0.1
    if (isCritical) {
        damage = Math.floor(damage * 1.5)
    }

    // Check for status effect application
    const appliedStatuses = []

    if (attack.statusEffects) {
        attack.statusEffects.forEach(statusEffect => {
            if (Math.random() < statusEffect.chance) {
                const applied = applyStatusEffect(defender, statusEffect.type, statusEffect.stacks, attacker.id)
                if (applied) {
                    appliedStatuses.push({
                        type: statusEffect.type,
                        stacks: statusEffect.stacks
                    })
                }
            }
        })
    }

    return {
        damage,
        attackType: attack.type,
        isCritical,
        isSpecial: true,
        specialAttackName: attack.name,
        statusApplied: appliedStatuses.length > 0,
        appliedStatuses: appliedStatuses,
        attackId: attack.id
    }
}

// ========== STATUS EFFECTS TURN PROCESSING ==========

// Process start of turn status effects for a character
export const processCharacterStartOfTurn = (character) => {
    const statusEffects = processStartOfTurnStatusEffects(character)
    let totalDamage = 0
    let statusMessages = []

    statusEffects.forEach(effect => {
        if (effect.type === STATUS_EFFECTS.BLEEDING && effect.damage > 0) {
            totalDamage += effect.damage
            statusMessages.push({
                message: `${character.name} sufre ${effect.damage} de daño por Sangrado (${effect.stacks} stacks)`,
                type: 'bleeding'
            })
        }
    })

    return {
        damage: totalDamage,
        messages: statusMessages,
        isConfused: statusEffects.some(effect => effect.type === STATUS_EFFECTS.CONFUSION)
    }
}

// Process end of turn status effects
export const processCharacterEndOfTurn = (character) => {
    processEndOfTurnStatusEffects(character)
}

// Handle confused character turn
export const handleConfusedTurn = (confusedCharacter, allies) => {
    const target = getConfusionAttackTarget(confusedCharacter, allies)

    if (!target) {
        return {
            success: false,
            message: `${confusedCharacter.name} está confuso pero no hay aliados para atacar`
        }
    }

    // Random attack type
    const attackTypes = ['physical', 'psychic']
    const randomAttackType = attackTypes[Math.floor(Math.random() * attackTypes.length)]

    const attackResult = performAttack(confusedCharacter, target, randomAttackType)

    return {
        success: true,
        target: target,
        attackResult: attackResult,
        message: `${confusedCharacter.name} está confuso y ataca a ${target.name}`
    }
}

// ========== ENEMY AI SYSTEM ==========

// Enhanced enemy AI to use special attacks occasionally
export const enemyAI = (enemy, player) => {
    // 20% chance to use special attack if enemy has one
    const useSpecialAttack = Math.random() < 0.2

    if (useSpecialAttack && enemy.specialAttacks && enemy.specialAttacks.length > 0) {
        const randomSpecial = enemy.specialAttacks[Math.floor(Math.random() * enemy.specialAttacks.length)]
        return performSpecialAttack(enemy, player, randomSpecial)
    } else {
        // Fallback to basic attack
        const attackTypes = ['physical', 'psychic']
        const randomAttack = attackTypes[Math.floor(Math.random() * attackTypes.length)]
        return performAttack(enemy, player, randomAttack)
    }
}

// ========== BATTLE STATUS CHECK SYSTEM ==========

// Check if battle has ended and who won
export const checkBattleEnd = (playerCharacters, enemies) => {
    // Check if all players are defeated
    const alivePlayers = playerCharacters.filter(player => player.currentHp > 0)
    if (alivePlayers.length === 0) {
        return 'player_lost'
    }

    // Check if all enemies are defeated
    const aliveEnemies = enemies.filter(enemy => enemy.currentHp > 0 && enemy.isAlive)
    if (aliveEnemies.length === 0) {
        return 'player_won'
    }

    return 'ongoing'
}

// ========== REWARDS AND PENALTIES SYSTEM ==========

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

// ========== CHARACTER HP MANAGEMENT SYSTEM ==========

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

// ========== ENEMY TARGETING LOGIC SYSTEM ==========

// Get random alive player target
export const getRandomAlivePlayer = (playerCharacters) => {
    const alivePlayers = playerCharacters.filter(player => player.currentHp > 0)
    if (alivePlayers.length === 0) return null

    const randomIndex = Math.floor(Math.random() * alivePlayers.length)
    return alivePlayers[randomIndex]
}

// ========== PLAYER TURN MANAGEMENT SYSTEM ==========

// Find next alive player for turn rotation
export const findNextAlivePlayer = (playerCharacters, currentIndex) => {
    const totalPlayers = playerCharacters.length
    let startIndex = currentIndex + 1

    // If starting from -1, start from beginning
    if (currentIndex === -1) {
        startIndex = 0
    }

    for (let i = 0; i < totalPlayers; i++) {
        const nextIndex = (startIndex + i) % totalPlayers
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

// ========== POSITION MANAGEMENT SYSTEM ==========

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

// ========== COMBAT STATE INITIALIZATION SYSTEM ==========

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
            psychicDefense: 2,
            statusEffects: {} // Initialize status effects
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
            isAlive: true,
            statusEffects: {} // Initialize status effects
        }
    })

    // Find first alive player
    const firstAliveIndex = findNextAlivePlayer(playerCharacters, -1)

    return {
        playerCharacters,
        enemies: initializedEnemies,
        currentTurn: 'player',
        currentPlayerTurnIndex: firstAliveIndex,
        battleLog: [],
        battleStatus: 'ongoing'
    }
}

// ========== BATTLE LOG MANAGEMENT SYSTEM ==========

// Add message to battle log
export const addToBattleLog = (battleLog, message) => {
    return [...battleLog, { message, timestamp: Date.now() }]
}

// Get last N battle log messages
export const getLastBattleLogs = (battleLog, count = 6) => {
    return battleLog.slice(-count)
}

// ========== COMBAT TEXT UTILITIES SYSTEM ==========

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

// ========== TURN EXECUTION SYSTEM ==========

// Handle end of player turn and determine next action
export const handleEndPlayerTurn = (combatState) => {
    const alivePlayers = combatState.playerCharacters.filter(player => player.currentHp > 0)

    // If no alive players, battle should end in defeat
    if (alivePlayers.length === 0) {
        return { shouldEndBattle: true, result: 'defeat' }
    }

    // Find next alive player starting from current position
    const nextIndex = findNextAlivePlayer(combatState.playerCharacters, combatState.currentPlayerTurnIndex)

    // If no next player found, battle should end
    if (nextIndex === -1) {
        return { shouldEndBattle: true, result: 'defeat' }
    }

    // Check if we've cycled through all players (wrapped around)
    if (nextIndex <= combatState.currentPlayerTurnIndex) {
        // We've wrapped around - all players have had their turn, switch to enemy
        return {
            shouldEndBattle: false,
            newState: {
                currentTurn: 'enemy',
                currentPlayerTurnIndex: nextIndex
            }
        }
    } else {
        // There's another player in this round, continue with them
        return {
            shouldEndBattle: false,
            newState: {
                currentPlayerTurnIndex: nextIndex,
                currentTurn: 'player'
            }
        }
    }
}

// Execute enemy turn logic with status effects
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

    // Update players with new HP and status effects if any
    const updatedPlayers = combatState.playerCharacters.map(char => {
        if (char.id === targetPlayer.id) {
            const updatedChar = { ...char, currentHp: updatedPlayerHp }

            // Apply status effects if any
            if (result.statusApplied && result.appliedStatuses) {
                result.appliedStatuses.forEach(status => {
                    applyStatusEffect(updatedChar, status.type, status.stacks, enemy.id)
                })
            }

            return updatedChar
        }
        return char
    })

    // Create battle log message
    const attackName = result.isSpecial ? result.specialAttackName :
        (result.attackType === 'physical' ? 'Ataque Físico' : 'Ataque Psíquico')
    const criticalText = result.isCritical ? ' ¡GOLPE CRÍTICO!' : ''
    let logMessage = `${enemy.name} usa ${attackName} en ${targetPlayer.name} - ${actualDamage} de daño${criticalText}`

    // Add status effect message if applied
    if (result.statusApplied && result.appliedStatuses) {
        const statusMessage = createStatusEffectMessage(targetPlayer.name, result.appliedStatuses)
        logMessage += ` - ${statusMessage}`
    }

    // Check if battle ends with this attack
    const battleResult = checkBattleEnd(updatedPlayers, combatState.enemies)

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

// Execute player attack logic with status effects
export const executePlayerAttack = (combatState, attackType, targetEnemy, isSpecial = false, specialAttackType = null) => {
    const currentPlayer = combatState.playerCharacters[combatState.currentPlayerTurnIndex]

    // Skip defeated players
    if (currentPlayer.currentHp <= 0) {
        return { shouldSkipTurn: true }
    }

    // Perform attack against specific enemy
    const result = performAttack(currentPlayer, targetEnemy, attackType, isSpecial, specialAttackType)

    // Ensure minimum 1 damage
    const actualDamage = Math.max(1, result.damage)

    // Create battle log message
    const attackName = result.isSpecial ? result.specialAttackName :
        (attackType === 'physical' ? 'Ataque Físico' : 'Ataque Psíquico')
    const criticalText = result.isCritical ? ' ¡GOLPE CRÍTICO!' : ''
    let logMessage = `${currentPlayer.name} usa ${attackName} en ${targetEnemy.name} - ${actualDamage} de daño${criticalText}`

    // Add status effect message if applied
    if (result.statusApplied && result.appliedStatuses) {
        const statusMessage = createStatusEffectMessage(targetEnemy.name, result.appliedStatuses)
        logMessage += ` - ${statusMessage}`
    }

    // Add trauma damage if triggered
    if (result.traumaDamage) {
        logMessage += ` + ${result.traumaDamage} de daño por Trauma`
    }

    // Calculate enemy HP after attack
    const totalDamage = result.totalDamage || actualDamage
    const updatedEnemyHp = Math.max(0, targetEnemy.currentHp - totalDamage)

    // Check if this specific enemy is defeated
    const enemyDefeated = updatedEnemyHp <= 0

    return {
        shouldEndBattle: enemyDefeated,
        shouldSkipTurn: false,
        updatedEnemyHp: updatedEnemyHp,
        logMessage,
        enemyDefeated,
        statusApplied: result.statusApplied,
        appliedStatuses: result.appliedStatuses || [],
        traumaDamage: result.traumaDamage,
        totalDamage: totalDamage
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

// ========== ATTACKS MANAGEMENT ==========

// Get special attack configuration
export const getSpecialAttackConfig = (attackId) => {
    return getAttack(attackId)
}

// Get all special attacks
export const getAllSpecialAttacks = () => {
    return getSpecialAttacks()
}

// Get all basic attacks
export const getAllBasicAttacks = () => {
    return getBasicAttacks()
}

// Get attack by ID
export const getAttackById = (attackId) => {
    return getAttack(attackId)
}

// ========== RE-EXPORTS FROM STATUS EFFECTS ==========
// Export functions from statusEffects for external use
export {
    STATUS_EFFECTS,
    createStatusEffectMessage,
    getStatusEffectDisplayInfo,
    getStatusEffectText,
    hasStatusEffects,
    canCharacterActNormally
}