// ========== ATTACKS CONFIGURATION ==========

export const ATTACKS = {
    // === BASIC ATTACKS ===
    BASIC_PHYSICAL: {
        id: 'BASIC_PHYSICAL',
        name: 'Ataque Físico',
        type: 'physical',
        damage: 0, // Uses character's base stats
        attackType: 'basic',
        description: (character) => {
            const stat = character.physicalAttack;
            return `⚔️ Ataque Físico Básico\nDaño: ${stat} (ATAQ FÍS)`;
        }
    },

    BASIC_PSYCHIC: {
        id: 'BASIC_PSYCHIC',
        name: 'Ataque Psíquico',
        type: 'psychic',
        damage: 0, // Uses character's base stats
        attackType: 'basic',
        description: (character) => {
            const stat = character.psychicAttack;
            return `🔮 Ataque Psíquico Básico\nDaño: ${stat} (ATAQ PSÍ)`;
        }
    },

    // === SPECIAL ATTACKS ===
    BLEEDING_STRIKE: {
        id: 'BLEEDING_STRIKE',
        name: 'Garra Sangrante',
        type: 'physical',
        damage: 8,
        attackType: 'special',
        statusEffects: [
            {
                type: 'bleeding',
                name: 'Sangrado',
                description: '🩸 Sangrado\n• Inflige daño físico cada turno\n• Daño por stack: 3 - DEF FÍS\n• Se acumula hasta 5 stacks\n• Duración: 3 turnos',
                chance: 0.3,
                stacks: 1
            }
        ],
        description: (character) => {
            const baseDamage = 8;
            const stat = character.physicalAttack;
            const totalDamage = baseDamage + stat;
            return `💥 Garra Sangrante\nDaño: ${baseDamage} + ${stat} (ATAQ FÍS) = ${totalDamage}\n🎯 30% de aplicar Sangrado`;
        }
    },

    WEAKENING_BLOW: {
        id: 'WEAKENING_BLOW',
        name: 'Golpe Debilitador',
        type: 'physical',
        damage: 7,
        attackType: 'special',
        statusEffects: [
            {
                type: 'weakened',
                name: 'Debilitado',
                description: '💢 Debilitado\n• Reduce DEF FÍS y DEF PSÍ en 3 puntos\n• Afecta a todo tipo de daño recibido\n• Duración: 1 turno\n• No se puede acumular',
                chance: 0.25,
                stacks: 1
            }
        ],
        description: (character) => {
            const baseDamage = 7;
            const stat = character.physicalAttack;
            const totalDamage = baseDamage + stat;
            return `💥 Golpe Debilitador\nDaño: ${baseDamage} + ${stat} (ATAQ FÍS) = ${totalDamage}\n🎯 25% de aplicar Debilitado`;
        }
    },

    TRAUMATIC_BLAST: {
        id: 'TRAUMATIC_BLAST',
        name: 'Explosión Traumática',
        type: 'psychic',
        damage: 9,
        attackType: 'special',
        statusEffects: [
            {
                type: 'trauma',
                name: 'Trauma',
                description: '🧠 Trauma\n• Inflige daño psíquico al recibir daño\n• Daño por stack: 4 - DEF PSÍ\n• Se acumula hasta 3 stacks\n• Se consume al activarse',
                chance: 0.35,
                stacks: 1
            }
        ],
        description: (character) => {
            const baseDamage = 9;
            const stat = character.psychicAttack;
            const totalDamage = baseDamage + stat;
            return `💥 Explosión Traumática\nDaño: ${baseDamage} + ${stat} (ATAQ PSÍ) = ${totalDamage}\n🎯 35% de aplicar Trauma`;
        }
    },

    CONFUSION_RAY: {
        id: 'CONFUSION_RAY',
        name: 'Rayo Confuso',
        type: 'psychic',
        damage: 6,
        attackType: 'special',
        statusEffects: [
            {
                type: 'confusion',
                name: 'Confusión',
                description: '🌀 Confusión\n• El objetivo ataca a un aliado aleatorio\n• Usa ataque básico del tipo correspondiente\n• Solo afecta el siguiente turno\n• No se puede acumular',
                chance: 0.4,
                stacks: 1
            }
        ],
        description: (character) => {
            const baseDamage = 6;
            const stat = character.psychicAttack;
            const totalDamage = baseDamage + stat;
            return `💥 Rayo Confuso\nDaño: ${baseDamage} + ${stat} (ATAQ PSÍ) = ${totalDamage}\n🎯 40% de aplicar Confusión`;
        }
    }
}

// ========== UTILITY FUNCTIONS ==========

// Get attack by ID
export const getAttack = (attackId) => {
    return ATTACKS[attackId] || ATTACKS.BASIC_PHYSICAL
}

// Get all special attacks
export const getSpecialAttacks = () => {
    return Object.values(ATTACKS).filter(attack => attack.attackType === 'special')
}

// Get basic attacks
export const getBasicAttacks = () => {
    return Object.values(ATTACKS).filter(attack => attack.attackType === 'basic')
}

// Check if attack can apply status effects
export const hasStatusEffects = (attack) => {
    return attack.statusEffects && attack.statusEffects.length > 0
}

// Get attack description as string
export const getAttackDescription = (attackId, character) => {
    const attack = getAttack(attackId);
    if (attack.description && typeof attack.description === 'function') {
        return attack.description(character);
    }
    return `${attack.name}\nInformación no disponible`;
}

// Get attack description for tooltip (formatted)
export const getAttackDescriptionForTooltip = (attack, character) => {
    if (attack.description && typeof attack.description === 'function') {
        return attack.description(character);
    }
    return attack.name;
}