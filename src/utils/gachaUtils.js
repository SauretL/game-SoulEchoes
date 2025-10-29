import { GACHA_PULL_COST, PULL_COUNT } from './gameConstants.js';

// ========== GACHA SYSTEM ==========
export const gachaButton = (
    playerCoins,
    setPlayerCoins,
    pullCount,
    setPullCount,
    allCharacters,
    setCharacterArray,
    addToPlayerCollection
) => {
    // Validate player has enough coins
    if (playerCoins < GACHA_PULL_COST) {
        alert("No tienes suficientes monedas para sacar más Almas")
        return false
    }

    // Deduct coins and perform gacha pull
    setPlayerCoins(prevCoins => prevCoins - GACHA_PULL_COST)
    const rawResults = gachaPull(allCharacters, PULL_COUNT)
    const newPull = pullCount + 1
    setPullCount(newPull)

    // Annotate results with unique identifiers for React keys
    const annotated = rawResults.map((char, i) => {
        return {
            ...char,
            _drawUid: "pull-" + newPull + "-" + i + "-" + Math.random().toString(36).slice(2, 6)
        }
    })

    setCharacterArray(annotated)
    addToPlayerCollection(rawResults)
    return true
};