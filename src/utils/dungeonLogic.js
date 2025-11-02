// ========== IMPORTS ========== //
import { getDungeonById, getNextDungeonId } from './dungeonMaps'

// ========== POSITION MANAGEMENT ========== //

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
    // Allow stairs (value 2) and boss cells (value 3) as valid movement
    if (map[newY]?.[newX] === 0 || map[newY]?.[newX] === 2 || map[newY]?.[newX] === 3) {
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

// ========== COMBAT ENCOUNTER LOGIC ========== //

// Check if combat should be triggered (probability-based)
export const shouldTriggerCombat = (encounterRate = 0.2) => {
    return Math.random() < encounterRate
}

// ========== ACTIVE CHARACTERS PROCESSING ========== //

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

// ========== MAP RENDERING UTILITIES ========== //

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
    // Stairs
    if (cell === 2) {
        return '⇧' // Stairs to next level
    }
    // Boss cell
    if (cell === 3) {
        return '👑' // Boss encounter
    }
    // Floor
    return '·' // Floor
}

// ========== DUNGEON STATE UTILITIES ========== //

// Get initial dungeon state
export const getInitialDungeonState = (startPosition = { x: 1, y: 1 }) => {
    return {
        playerPos: startPosition,
        coinsCollected: 0,
        pendingCoins: 0,
        combatTriggered: false
    }
}

// Reset dungeon state to initial values
export const resetDungeonState = (startPosition = { x: 1, y: 1 }) => {
    return getInitialDungeonState(startPosition)
}

// ========== KEYBOARD INPUT HANDLING ========== //

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

// ========== PLAYER MOVEMENT LOGIC ========== //

// Execute player movement with combat check
export const executePlayerMovement = (currentPos, direction, map, dungeonId, encounterRate = 0.2) => {
    // Calculate new position
    const newPosition = calculateNewPosition(currentPos, direction, map)
    // If position is invalid, return no change
    if (!newPosition) {
        return {
            moved: false,
            newPosition: currentPos,
            combatTriggered: false,
            levelUp: false,
            bossTriggered: false
        }
    }
    // Get dungeon data to check if it's a boss level
    const dungeon = getDungeonById(dungeonId)
    const isBossLevel = isBossDungeon(dungeon)
    // Check if player stepped on boss cell (cell type 3) in boss level
    const isOnBossCell = map[newPosition.y]?.[newPosition.x] === 3
    const bossTriggered = isBossLevel && isOnBossCell
    // Check if player stepped on stairs
    const isOnStairs = map[newPosition.y]?.[newPosition.x] === 2
    // Check for combat encounter (only if not on stairs and not on boss cell)
    const combatTriggered = !isOnStairs && !bossTriggered && shouldTriggerCombat(encounterRate)

    return {
        moved: true,
        newPosition,
        combatTriggered,
        bossTriggered,
        levelUp: isOnStairs, // Signal level up if on stairs
        dungeonId // Pass dungeon ID so we can generate appropriate formation
    }
}

// ========== COIN MANAGEMENT ========== //

// Process pending coins to collected coins
export const processPendingCoins = (pendingCoins) => {
    return {
        coinsToAdd: pendingCoins,
        newPendingCoins: 0
    }
}

// ========== HP MANAGEMENT FOR CHARACTERS ========== //

// Reset all character HP to max
export const resetAllCharactersHP = (activeCharacters, maxHp) => {
    const allCharacters = [...activeCharacters.front, ...activeCharacters.back]
        .filter(char => char !== null)

    return allCharacters.map(char => ({
        characterId: char.id,
        newHp: maxHp
    }))
}

// ========== ENEMY PARTY GENERATION ========== //

// Generate enemy party from formation configuration
export const generateEnemyPartyFromFormation = (formation, enemiesData) => {
    console.log(`🔍 GENERACIÓN DE ENEMIGOS - Iniciando generación de grupo enemigo desde formación`)
    console.log(`🔍 DATOS DE FORMACIÓN - Formación recibida:`, formation)
    console.log(`🔍 FUENTE DE DATOS ENEMIGOS - Total enemigos disponibles: ${enemiesData?.length || 0}`)

    if (!formation || !formation.enemies || !enemiesData) {
        console.warn(`⚠️ GENERACIÓN FALLIDA - Datos de formación o enemigos faltantes`)
        return []
    }
    console.log(`🔍 ENEMIGOS EN FORMACIÓN - Configuración de enemigos en formación:`, formation.enemies)

    // Map formation config to actual enemy instances
    const enemyParty = formation.enemies.map((config, index) => {
        console.log(`🔍 PROCESANDO CONFIG ENEMIGO [${index}] - Buscando enemigo ID: ${config.enemyId}, Posición: ${config.position}, Slot: ${config.slot}`)

        // Find enemy data by ID
        const enemyData = enemiesData.find(e => e.id === config.enemyId)
        if (!enemyData) {
            console.warn(`⚠️ ENEMIGO NO ENCONTRADO - Enemigo con ID ${config.enemyId} no encontrado en enemies.json`)
            return null
        }
        console.log(`✅ DATOS ENCONTRADOS - ${enemyData.name} encontrado:`, {
            id: enemyData.id,
            maxHp: enemyData.maxHp,
            physicalAttack: enemyData.physicalAttack,
            psychicAttack: enemyData.psychicAttack,
            physicalDefense: enemyData.physicalDefense,
            psychicDefense: enemyData.psychicDefense
        })

        // Create truly unique ID combining enemyId, position, slot, and timestamp
        const uniqueId = `enemy_${config.enemyId}_${config.position}_${config.slot}_${index}_${Date.now()}`
        console.log(`🆔 INSTANCIA ENEMIGO CREADA - ID único: ${uniqueId}`)

        // Create enemy instance with combat properties
        return {
            id: uniqueId, // Truly unique ID for this instance
            enemyTypeId: config.enemyId, // Store original enemy type ID for reference
            ...enemyData, // Spread all enemy data (name, image, stats, etc.)
            currentHp: enemyData.maxHp, // Initialize current HP
            position: config.position, // front or back
            slot: config.slot, // 0, 1, or 2
            isAlive: true
        }
    }).filter(enemy => enemy !== null) // Remove any nulls from missing enemies

    console.log(`✅ GRUPO ENEMIGO COMPLETO - Grupo generado con ${enemyParty.length} enemigos:`,
        enemyParty.map(e => `${e.name} (ID: ${e.id}, HP: ${e.currentHp}/${e.maxHp})`))
    return enemyParty
}

// Generate random enemy party for a specific dungeon
export const generateRandomEnemyParty = (dungeonId, enemiesData, getRandomFormationForDungeon) => {
    console.log(`🎲 GENERACIÓN ALEATORIA ENEMIGOS - Iniciando para mazmorra: ${dungeonId}`)
    console.log(`📊 DATOS ENEMIGOS DISPONIBLES - Total tipos de enemigos: ${enemiesData?.length || 0}`)

    if (enemiesData && enemiesData.length > 0) {
        console.log(`📋 TIPOS ENEMIGOS DISPONIBLES - Lista de enemigos disponibles:`,
            enemiesData.map(e => `${e.name} (ID: ${e.id}, HP: ${e.maxHp})`))
    }

    // Get random formation for this dungeon
    const formation = getRandomFormationForDungeon(dungeonId)
    console.log(`🎯 FORMACIÓN SELECCIONADA - Formación aleatoria para mazmorra ${dungeonId}:`, formation)

    if (!formation) {
        console.warn(`⚠️ FORMACIÓN NO ENCONTRADA - Sin formaciones disponibles para mazmorra ${dungeonId}`)

        // Fallback to single enemy with unique ID
        const fallbackEnemy = enemiesData?.[0]
        if (fallbackEnemy) {
            console.log(`🔄 ENEMIGO DE RESERVA CREADO - Usando enemigo por defecto: ${fallbackEnemy.name}`)
            const fallbackParty = [{
                ...fallbackEnemy,
                id: `enemy_fallback_${Date.now()}`, // Unique fallback ID
                enemyTypeId: fallbackEnemy.id,
                currentHp: fallbackEnemy.maxHp,
                position: 'front',
                slot: 1,
                isAlive: true
            }]
            console.log(`✅ GRUPO DE RESERVA - Grupo de respaldo creado:`, fallbackParty)
            return fallbackParty
        } else {
            console.error(`❌ ERROR CRÍTICO - No hay enemigos disponibles para crear grupo de respaldo`)
            return []
        }
    }

    // Generate party from formation
    console.log(`🏗️ GENERANDO GRUPO DESDE FORMACIÓN - Usando formación con ${formation.enemies?.length || 0} enemigos`)
    const enemyParty = generateEnemyPartyFromFormation(formation, enemiesData)

    console.log(`✅ GRUPO ENEMIGO FINAL - Grupo enemigo completo para mazmorra ${dungeonId}:`,
        enemyParty.map(e => ({
            name: e.name,
            id: e.id,
            typeId: e.enemyTypeId,
            hp: `${e.currentHp}/${e.maxHp}`,
            position: e.position,
            slot: e.slot,
            stats: {
                physAtk: e.physicalAttack,
                psyAtk: e.psychicAttack,
                physDef: e.physicalDefense,
                psyDef: e.psychicDefense
            }
        })))
    return enemyParty
}

// ========== BOSS DUNGEON FUNCTIONS ========== //

// Check if current dungeon is a boss level
export const isBossDungeon = (dungeon) => {
    return dungeon && dungeon.isBossLevel === true
}

// Get boss encounter for specific dungeon (placeholder with normal enemies)
export const getBossEncounter = (dungeonId, enemiesData, getRandomFormationForDungeon) => {
    console.log(`👑 ENCUENTRO DE JEFE - Generando encuentro de jefe para mazmorra: ${dungeonId}`)

    // Use normal formation system but with special boss flag
    const bossFormation = getRandomFormationForDungeon(dungeonId)
    if (!bossFormation) {
        console.warn(`⚠️ FORMACIÓN JEFE NO ENCONTRADA - Usando formación normal como respaldo`)
        return generateRandomEnemyParty(dungeonId, enemiesData, getRandomFormationForDungeon)
    }
    console.log(`👑 FORMACIÓN JEFE SELECCIONADA - Formación de jefe:`, bossFormation)

    const bossParty = generateEnemyPartyFromFormation(bossFormation, enemiesData)

    // Mark all enemies as part of boss encounter
    const bossPartyWithFlag = bossParty.map(enemy => ({
        ...enemy,
        isBossEncounter: true,
        bossDungeonId: dungeonId
    }))
    console.log(`👑 GRUPO JEFE CREADO - Grupo de jefe con ${bossPartyWithFlag.length} enemigos`)
    return bossPartyWithFlag
}

// ========== VALIDATION UTILITIES ========== //

// Check if movement is allowed (not in combat)
export const isMovementAllowed = (inCombat) => {
    return !inCombat
}

// Validate active characters configuration
export const hasActiveCharacters = (activeCharacters) => {
    const count = getActiveCharactersCount(activeCharacters)
    return count > 0
}

// ========== STAIRS MANAGEMENT ========== //

// Check if position has stairs
export const isStairsPosition = (dungeonId, position) => {
    const dungeon = getDungeonById(dungeonId)
    if (!dungeon) return false
    // Search for stairs (value 2) in the map
    const map = dungeon.map
    return map[position.y]?.[position.x] === 2
}

// ========== DUNGEON STATE MANAGEMENT ========== //

// Initialize complete dungeon state
export const initializeDungeonState = () => {
    const currentDungeon = getDefaultDungeon();
    return {
        currentDungeon,
        ...getInitialDungeonState(currentDungeon.startPos),
        isOnStairs: false,
        isOnBossCell: false,
        bossDefeated: false
    };
};

// Reset complete dungeon state
export const resetDungeonComplete = () => {
    const firstDungeon = getDefaultDungeon();
    return {
        currentDungeon: firstDungeon,
        ...getInitialDungeonState(firstDungeon.startPos),
        isOnStairs: false,
        isOnBossCell: false,
        bossDefeated: false
    };
};

// Advance to next dungeon
export const advanceToNextDungeon = (currentDungeonId) => {
    const nextDungeonId = getNextDungeonId(currentDungeonId);
    if (!nextDungeonId) return null;

    const nextDungeon = getDungeonById(nextDungeonId);
    return {
        currentDungeon: nextDungeon,
        playerPos: nextDungeon.startPos,
        isOnStairs: false,
        isOnBossCell: false,
        bossDefeated: false
    };
};

// Get stairs modal content
export const getStairsModalContent = (currentDungeonId) => {
    const nextDungeonId = getNextDungeonId(currentDungeonId);
    const canAdvance = !!nextDungeonId;

    if (!canAdvance) {
        return {
            message: '¡Has llegado a la cima de la torre! Esta es la mazmorra final.',
            canAdvance: false
        };
    }

    const nextDungeon = getDungeonById(nextDungeonId);
    return {
        message: `¡Has encontrado las escaleras al ${nextDungeon.name}!`,
        canAdvance: true,
        nextDungeon
    };
};

// ========== INTERACTION HANDLERS ========== //

// Handle boss encounter interaction
export const handleBossInteractionLogic = (currentDungeonId, enemies, getRandomFormationForDungeon, onStartCombat) => {
    console.log(`👑 INICIANDO ENCUENTRO JEFE - Comenzando combate contra jefe`);

    const bossParty = generateRandomEnemyParty(
        currentDungeonId,
        enemies,
        getRandomFormationForDungeon
    );

    onStartCombat(bossParty);
    return true;
};

// Handle stairs interaction
export const handleStairsInteractionLogic = (currentDungeonId, bossDefeated, setCurrentDungeon, setPlayerPos, setDungeonState) => {
    const dungeon = getDungeonById(currentDungeonId)

    // Check if this is a boss level and boss is not defeated
    if (dungeon.isBossLevel && !bossDefeated) {
        return {
            showModal: true,
            message: '¡Debes derrotar al jefe de esta mazmorra antes de usar las escaleras!'
        };
    }

    const nextDungeonId = getNextDungeonId(currentDungeonId);
    if (!nextDungeonId) {
        return {
            showModal: true,
            message: '¡Has llegado a la cima de la torre! Esta es la mazmorra final.'
        };
    }

    const nextDungeon = getDungeonById(nextDungeonId);
    setCurrentDungeon(nextDungeon);
    setPlayerPos(nextDungeon.startPos);

    const newState = getInitialDungeonState(nextDungeon.startPos);
    setDungeonState(newState);

    console.log(`🏰 Cambiado a mazmorra: ${nextDungeon.name}`);
    return { showModal: false };
};

// Handle dungeon keyboard input
export const handleDungeonKeyPress = (e, {
    inCombat,
    manualCombatReset,
    isOnStairs,
    handleStairsInteraction,
    isOnBossCell,
    handleBossInteraction,
    bossDefeated,
    movePlayer
}) => {
    const gameKeys = ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'r', 'R', 'Enter', ' '];
    if (gameKeys.includes(e.key)) {
        e.preventDefault();
    }

    if (isResetKey(e.key)) {
        manualCombatReset();
        return;
    }

    if ((e.key === 'Enter' || e.key === ' ') && isOnStairs && !inCombat) {
        handleStairsInteraction();
        return;
    }

    if ((e.key === 'Enter' || e.key === ' ') && isOnBossCell && !inCombat && !bossDefeated) {
        handleBossInteraction();
        return;
    }

    if (!isMovementAllowed(inCombat)) {
        return;
    }

    const direction = getDirectionFromKey(e.key);
    if (direction) {
        movePlayer(direction);
    }
}

// ========== BOSS DEFEAT MANAGEMENT ==========

// Handle boss defeat
export const handleBossDefeat = (dungeonId, setDefeatedBosses, setBossDefeated) => {
    console.log(`🎉 REGISTRANDO VICTORIA SOBRE JEFE - Mazmorra ${dungeonId}`);
    setDefeatedBosses(prev => {
        const updated = [...new Set([...prev, dungeonId])];
        console.log(`📊 LISTA ACTUALIZADA DE JEFES DERROTADOS:`, updated);
        return updated;
    });
    setBossDefeated(true);
};

// Check if boss is defeated for current dungeon
export const isBossDefeated = (dungeonId, defeatedBosses) => {
    return defeatedBosses.includes(dungeonId);
}

// ========== HELPER FUNCTIONS ========== //

// Get default dungeon
export const getDefaultDungeon = () => {
    // This function should be imported from dungeonMaps
    // For now, return a placeholder that will be overridden by import
    return null;
};