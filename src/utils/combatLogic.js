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
    const baseCoins = Math.floor(Math.random() * 5) + 1 // 1-5 coins
    const bonus = 2 // +2 bonus coins
    return baseCoins + bonus
}

// Calculate coins lost for losing battle
export const getBattlePenalty = () => {
    return 25 // Lose 25 coins when losing
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

// ========== COMBAT UTILITIES ==========

// Check if a character can perform actions
export const canCharacterAct = (character) => {
    return character.currentHp > 0
}

// Calculate total party HP percentage
export const getPartyHpPercentage = (playerCharacters, maxHp) => {
    const totalCurrentHp = playerCharacters.reduce((sum, player) => sum + player.currentHp, 0)
    const totalMaxHp = playerCharacters.length * maxHp
    return (totalCurrentHp / totalMaxHp) * 100
}

// Get character position in formation
export const getCharacterPosition = (character, activeCharacters) => {
    const frontIndex = activeCharacters.front.findIndex(char => char?.id === character.id)
    if (frontIndex !== -1) return { position: 'front', slot: frontIndex }

    const backIndex = activeCharacters.back.findIndex(char => char?.id === character.id)
    if (backIndex !== -1) return { position: 'back', slot: backIndex }

    return null
}

// ========== ENEMY TARGETING LOGIC ==========

// Get random alive player target
export const getRandomAlivePlayer = (playerCharacters) => {
    const alivePlayers = playerCharacters.filter(player => player.currentHp > 0)
    if (alivePlayers.length === 0) return null

    const randomIndex = Math.floor(Math.random() * alivePlayers.length)
    return alivePlayers[randomIndex]
}

// Get weakest player (lowest HP)
export const getWeakestPlayer = (playerCharacters) => {
    const alivePlayers = playerCharacters.filter(player => player.currentHp > 0)
    if (alivePlayers.length === 0) return null

    return alivePlayers.reduce((weakest, player) => {
        if (!weakest) return player
        return player.currentHp < weakest.currentHp ? player : weakest
    }, null)
}

// Get front row players
export const getFrontRowPlayers = (playerCharacters, activeCharacters) => {
    return playerCharacters.filter(player =>
        activeCharacters.front.some(char => char?.id === player.id)
    )
}

// ========== BATTLE STATISTICS ==========

// Calculate battle statistics
export const getBattleStats = (playerCharacters, enemy) => {
    const alivePlayers = playerCharacters.filter(player => player.currentHp > 0)
    const totalDamageTaken = playerCharacters.reduce((sum, player) =>
        sum + (player.maxHp - player.currentHp), 0
    )
    const enemyDamageTaken = enemy.maxHp - enemy.currentHp

    return {
        alivePlayers: alivePlayers.length,
        totalPlayers: playerCharacters.length,
        totalDamageTaken,
        enemyDamageTaken,
        isBattleWon: enemy.currentHp <= 0,
        isBattleLost: alivePlayers.length === 0
    }
}