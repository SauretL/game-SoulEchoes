export const calculateDamage = (attack, defense) => {
    const damage = Math.max(attack - defense, 1) // 1 Damage min
    return damage
}

export const performAttack = (attacker, defender, attackType) => {
    let damage = 0

    if (attackType === 'physical') {
        damage = calculateDamage(attacker.physicalAttack, defender.physicalDefense)
        defender.currentHp = Math.max(defender.currentHp - damage, 0)
    } else if (attackType === 'psychic') {
        damage = calculateDamage(attacker.psychicAttack, defender.psychicDefense)
        defender.currentHp = Math.max(defender.currentHp - damage, 0)
    }

    return {
        damage,
        attackType,
        isCritical: Math.random() < 0.1 // 10% crit chance
    }
}

export const enemyAI = (enemy, player) => {
    // Simple IA: randomly chooses between physical and psichic damage
    const attackTypes = ['physical', 'psychic']
    const randomAttack = attackTypes[Math.floor(Math.random() * attackTypes.length)]

    return performAttack(enemy, player, randomAttack)
}

export const checkBattleEnd = (player, enemy) => {
    if (player.currentHp <= 0) {
        return 'player_lost'
    } else if (enemy.currentHp <= 0) {
        return 'player_won'
    }
    return 'ongoing'
}

export const getBattleReward = () => {
    const baseCoins = Math.floor(Math.random() * 5) + 1 // 1-5 coins
    const bonus = 2 // +2 bonus coins
    return baseCoins + bonus
}

export const getBattlePenalty = () => {
    return 25 // Lose 25 coins when losing
}