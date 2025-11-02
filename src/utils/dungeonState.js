import { getDefaultDungeon, getDungeonById } from './dungeonMaps'
import { getInitialDungeonState, resetAllCharactersHP } from './dungeonLogic'

// ========== DUNGEON STATE MANAGEMENT ==========
export const initializeDungeonState = () => {
    const currentDungeon = getDefaultDungeon();
    return {
        currentDungeon,
        ...getInitialDungeonState(currentDungeon.startPos),
        isOnStairs: false,
        isOnBossCell: false,
        bossDefeated: false,
        //Track defeated bosses
        defeatedBosses: []
    };
}

export const resetDungeonComplete = () => {
    const firstDungeon = getDefaultDungeon()
    return {
        currentDungeon: firstDungeon,
        ...getInitialDungeonState(firstDungeon.startPos),
        isOnStairs: false,
        isOnBossCell: false,
        bossDefeated: false,
        defeatedBosses: [] // Reset defeated bosses on complete reset
    }
}

export const advanceToNextDungeon = (currentDungeonId, defeatedBosses = []) => {
    const nextDungeonId = getNextDungeonId(currentDungeonId);
    if (!nextDungeonId) return null;

    const nextDungeon = getDungeonById(nextDungeonId);
    return {
        currentDungeon: nextDungeon,
        playerPos: nextDungeon.startPos,
        isOnStairs: false,
        isOnBossCell: false,
        bossDefeated: false,
        defeatedBosses // Preserve defeated bosses
    }
}

// ========== BOSS PROGRESSION MANAGEMENT ==========
export const canAccessDungeon = (dungeonId, defeatedBosses) => {
    const dungeon = getDungeonById(dungeonId);
    if (!dungeon) return false;

    // Always allow first dungeon
    if (dungeonId === 1) return true;

    // Check if this is a boss level
    if (dungeon.isBossLevel) {
        // For boss levels, check if previous difficulty boss is defeated
        const previousBossDungeonId = getPreviousBossDungeonId(dungeonId);
        return defeatedBosses.includes(previousBossDungeonId);
    } else {
        // For non-boss levels, check if current difficulty's first dungeon is accessible
        const firstDungeonInDifficulty = getFirstDungeonInDifficulty(dungeon.difficulty);
        return firstDungeonInDifficulty ? canAccessDungeon(firstDungeonInDifficulty.id, defeatedBosses) : false;
    }
}

export const getPreviousBossDungeonId = (currentDungeonId) => {
    const dungeon = getDungeonById(currentDungeonId);
    if (!dungeon) return null;

    // Boss dungeon IDs: 2 (Easy), 4 (Medium), 6 (Hard)
    switch (currentDungeonId) {
        case 2: return null; // No previous boss for first difficulty
        case 4: return 2;    // Medium difficulty requires Easy boss
        case 6: return 4;    // Hard difficulty requires Medium boss
        default: return null;
    }
}

export const getFirstDungeonInDifficulty = (difficulty) => {
    const dungeons = getAllDungeons();
    return dungeons.find(d => d.difficulty === difficulty && !d.isBossLevel) || dungeons[0];
}

export const getAvailableDungeons = (defeatedBosses) => {
    const allDungeons = getAllDungeons();
    return allDungeons.filter(dungeon => canAccessDungeon(dungeon.id, defeatedBosses));
}

// ========== MODAL STATE MANAGEMENT ==========
export const getStairsModalContent = (currentDungeonId, bossDefeated) => {
    const nextDungeonId = getNextDungeonId(currentDungeonId);
    const canAdvance = !!nextDungeonId && bossDefeated;

    if (!canAdvance && !bossDefeated) {
        return {
            message: '¡Debes derrotar al jefe de esta mazmorra antes de usar las escaleras!',
            canAdvance: false
        };
    }

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
    }
}