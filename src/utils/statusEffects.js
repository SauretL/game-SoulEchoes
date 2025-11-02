// ========== STATUS EFFECTS SYSTEM ==========

// Status effect types
export const STATUS_EFFECTS = {
    BLEEDING: 'bleeding',
    CONFUSION: 'confusion',
    TRAUMA: 'trauma',
    WEAKENED: 'weakened'
}

// Status effect configuration
export const STATUS_CONFIG = {
    [STATUS_EFFECTS.BLEEDING]: {
        name: 'Sangrado',
        maxStacks: 5,
        duration: 3, // turns
        isStackable: true,
        description: '🩸 Sangrado\n• Inflige daño físico cada turno\n• Daño por stack: 3 - DEF FÍS\n• Se acumula hasta 5 stacks\n• Duración: 3 turnos'
    },
    [STATUS_EFFECTS.CONFUSION]: {
        name: 'Confusión',
        maxStacks: 1,
        duration: 1, // next turn only
        isStackable: false,
        description: '🌀 Confusión\n• El objetivo ataca a un aliado aleatorio\n• Usa ataque básico del tipo correspondiente\n• Solo afecta el siguiente turno\n• No se puede acumular'
    },
    [STATUS_EFFECTS.TRAUMA]: {
        name: 'Trauma',
        maxStacks: 3,
        duration: null, // persists until triggered
        isStackable: true,
        description: '🧠 Trauma\n• Inflige daño psíquico al recibir daño\n• Daño por stack: 4 - DEF PSÍ\n• Se acumula hasta 3 stacks\n• Se consume al activarse'
    },
    [STATUS_EFFECTS.WEAKENED]: {
        name: 'Debilitado',
        maxStacks: 1,
        duration: 1, // 1 round
        isStackable: false,
        description: '💢 Debilitado\n• Reduce DEF FÍS y DEF PSÍ en 3 puntos\n• Afecta a todo tipo de daño recibido\n• Duración: 1 turno\n• No se puede acumular'
    }
}

// ========== STATUS EFFECT APPLICATION ==========

// Apply status effect to target
export const applyStatusEffect = (target, statusType, stacks = 1, source = null) => {
    if (!target.statusEffects) {
        target.statusEffects = {}
    }

    const config = STATUS_CONFIG[statusType]

    if (!config) {
        console.warn(`Unknown status effect: ${statusType}`)
        return false
    }

    // Initialize status if not present
    if (!target.statusEffects[statusType]) {
        target.statusEffects[statusType] = {
            stacks: 0,
            duration: config.duration,
            source: source
        }
    }

    const currentStatus = target.statusEffects[statusType]

    // Handle stackable vs non-stackable effects
    if (config.isStackable) {
        currentStatus.stacks = Math.min(currentStatus.stacks + stacks, config.maxStacks)
    } else {
        currentStatus.stacks = Math.min(stacks, config.maxStacks)
    }

    // Reset duration when reapplied
    if (config.duration !== null) {
        currentStatus.duration = config.duration
    }

    return true
}

// Get status effect description
export const getStatusEffectDescription = (statusType) => {
    const config = STATUS_CONFIG[statusType]
    return config ? config.description : 'Estado desconocido'
}

// ========== STATUS EFFECT PROCESSING ==========

// Process start of turn status effects (bleeding)
export const processStartOfTurnStatusEffects = (character) => {
    const effects = []

    if (!character.statusEffects) return effects

    // Process bleeding damage
    if (character.statusEffects[STATUS_EFFECTS.BLEEDING]) {
        const bleeding = character.statusEffects[STATUS_EFFECTS.BLEEDING]
        const damage = calculateBleedingDamage(bleeding.stacks, character.physicalDefense)

        effects.push({
            type: STATUS_EFFECTS.BLEEDING,
            damage: damage,
            stacks: bleeding.stacks
        })

        // Reduce duration and remove if expired
        bleeding.duration--
        if (bleeding.duration <= 0) {
            delete character.statusEffects[STATUS_EFFECTS.BLEEDING]
        }
    }

    // Process confusion (will be handled in turn logic)
    if (character.statusEffects[STATUS_EFFECTS.CONFUSION]) {
        effects.push({
            type: STATUS_EFFECTS.CONFUSION,
            stacks: character.statusEffects[STATUS_EFFECTS.CONFUSION].stacks
        })
    }

    return effects
}

// Process damage-triggered status effects (trauma)
export const processDamageTriggeredStatusEffects = (character, damageType) => {
    const effects = []

    if (!character.statusEffects) return effects

    // Process trauma when receiving damage
    if (character.statusEffects[STATUS_EFFECTS.TRAUMA] && damageType) {
        const trauma = character.statusEffects[STATUS_EFFECTS.TRAUMA]
        const damage = calculateTraumaDamage(trauma.stacks, character.psychicDefense)

        effects.push({
            type: STATUS_EFFECTS.TRAUMA,
            damage: damage,
            stacks: trauma.stacks
        })

        // Consume all trauma stacks after triggering
        delete character.statusEffects[STATUS_EFFECTS.TRAUMA]
    }

    return effects
}

// Process end of turn status effects (weakened)
export const processEndOfTurnStatusEffects = (character) => {
    if (!character.statusEffects) return

    // Process weakened duration
    if (character.statusEffects[STATUS_EFFECTS.WEAKENED]) {
        const weakened = character.statusEffects[STATUS_EFFECTS.WEAKENED]
        weakened.duration--

        if (weakened.duration <= 0) {
            delete character.statusEffects[STATUS_EFFECTS.WEAKENED]
        }
    }

    // Process confusion duration
    if (character.statusEffects[STATUS_EFFECTS.CONFUSION]) {
        const confusion = character.statusEffects[STATUS_EFFECTS.CONFUSION]
        confusion.duration--

        if (confusion.duration <= 0) {
            delete character.statusEffects[STATUS_EFFECTS.CONFUSION]
        }
    }
}

// ========== STATUS EFFECT DAMAGE CALCULATION ==========

// Calculate bleeding damage (physical damage reduced by physical defense)
const calculateBleedingDamage = (stacks, physicalDefense) => {
    const baseDamagePerStack = 3
    const totalBaseDamage = baseDamagePerStack * stacks
    const finalDamage = Math.max(1, totalBaseDamage - physicalDefense)
    return finalDamage
}

// Calculate trauma damage (psychic damage reduced by psychic defense)
const calculateTraumaDamage = (stacks, psychicDefense) => {
    const baseDamagePerStack = 4
    const totalBaseDamage = baseDamagePerStack * stacks
    const finalDamage = Math.max(1, totalBaseDamage - psychicDefense)
    return finalDamage
}

// ========== STAT MODIFIERS FROM STATUS EFFECTS ==========

// Get stat modifiers from status effects
export const getStatusEffectStatModifiers = (character) => {
    const modifiers = {
        physicalDefenseMod: 0,
        psychicDefenseMod: 0
    }

    if (!character.statusEffects) return modifiers

    // Weakened reduces both defenses
    if (character.statusEffects[STATUS_EFFECTS.WEAKENED]) {
        const weakened = character.statusEffects[STATUS_EFFECTS.WEAKENED]
        const reductionPerStack = 3
        modifiers.physicalDefenseMod -= reductionPerStack * weakened.stacks
        modifiers.psychicDefenseMod -= reductionPerStack * weakened.stacks
    }

    return modifiers
}

// Apply stat modifiers to character stats
export const applyStatusEffectStats = (character) => {
    const modifiers = getStatusEffectStatModifiers(character)

    return {
        physicalDefense: Math.max(0, character.physicalDefense + modifiers.physicalDefenseMod),
        psychicDefense: Math.max(0, character.psychicDefense + modifiers.psychicDefenseMod)
    }
}

// ========== STATUS EFFECT VALIDATION ==========

// Check if character can act normally (not confused)
export const canCharacterActNormally = (character) => {
    return !character.statusEffects || !character.statusEffects[STATUS_EFFECTS.CONFUSION]
}

// Get confused attack target (random ally)
export const getConfusionAttackTarget = (character, allies) => {
    const validTargets = allies.filter(ally =>
        ally.id !== character.id && ally.currentHp > 0
    )

    if (validTargets.length === 0) return null

    const randomIndex = Math.floor(Math.random() * validTargets.length)
    return validTargets[randomIndex]
}

// ========== STATUS EFFECT UI HELPERS ==========

// Get status effect display information
export const getStatusEffectDisplayInfo = (statusEffects) => {
    if (!statusEffects) return []

    return Object.entries(statusEffects).map(([type, data]) => {
        const config = STATUS_CONFIG[type]
        return {
            type: type,
            name: config.name,
            stacks: data.stacks,
            duration: data.duration,
            isStackable: config.isStackable
        }
    })
}

// Check if character has any status effects
export const hasStatusEffects = (character) => {
    return character.statusEffects && Object.keys(character.statusEffects).length > 0
}

// Get status effect text for battle log
export const getStatusEffectText = (statusType) => {
    const statusTexts = {
        [STATUS_EFFECTS.BLEEDING]: 'Sangrado',
        [STATUS_EFFECTS.CONFUSION]: 'Confusión',
        [STATUS_EFFECTS.TRAUMA]: 'Trauma',
        [STATUS_EFFECTS.WEAKENED]: 'Debilitado'
    }
    return statusTexts[statusType] || statusType
}

// Create status effect application message for multiple statuses
export const createStatusEffectMessage = (targetName, appliedStatuses) => {
    if (appliedStatuses.length === 0) return ''

    const statusTexts = appliedStatuses.map(status => {
        const statusName = getStatusEffectText(status.type)
        return `${statusName} ${status.stacks > 1 ? `(${status.stacks} stacks)` : ''}`
    })

    return `⚡ ${targetName} sufre ${statusTexts.join(', ')}`
}