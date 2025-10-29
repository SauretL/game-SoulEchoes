import { DEFAULT_CHARACTER_ID } from './gameConstants.js'

// ========== CHARACTER OBJECT CREATOR ==========
export const createCharacterObject = (characterData, duplicates = 1) => {
    if (!characterData) return null

    return {
        ...characterData,    // Copy all character data
        duplicates: duplicates  // Adds duplicate numbers
    }
}

// ========== CHARACTER COLLECTION MANAGEMENT ==========
export const addToPlayerCollection = (prevCollection, newCharacters) => {
    const updatedCollection = [...prevCollection]

    newCharacters.forEach(newChar => {
        const existingCharIndex = updatedCollection.findIndex(
            char => char.id === newChar.id
        );

        if (existingCharIndex !== -1) {
            // Update duplicate count for existing character
            updatedCollection[existingCharIndex] = {
                ...updatedCollection[existingCharIndex],
                duplicates: updatedCollection[existingCharIndex].duplicates + 1
            }
        } else {
            // Add new character to collection
            updatedCollection.push(createCharacterObject(newChar, 1))
        }
    });

    return updatedCollection
};

// ========== CHARACTER SORTING ==========
export const getSortedCollection = (playerCharacters, sortBy) => {
    const sorted = [...playerCharacters]

    switch (sortBy) {
        case "name":
            return sorted.sort((a, b) => a.name.localeCompare(b.name))
        case "rarity":
            return sorted.sort((a, b) => b.rarityTier - a.rarityTier || a.name.localeCompare(b.name))
        case "fragment":
            return sorted.sort((a, b) => a.fragment.localeCompare(b.fragment) || a.name.localeCompare(b.name))
        case "class":
            return sorted.sort((a, b) => a.class.localeCompare(b.class) || a.name.localeCompare(b.name))
        case "duplicates":
            return sorted.sort((a, b) => b.duplicates - a.duplicates || a.name.localeCompare(b.name))
        case "id":
        default:
            return sorted.sort((a, b) => a.id - b.id)
    }
}

// ========== DEFAULT CHARACTER SETUP ==========
export const getDefaultCharacter = (allCharacters) => {
    return allCharacters.find(char => char.id === DEFAULT_CHARACTER_ID)
};

// ========== INITIALIZE CHARACTER HP ==========
export const initializeCharacterHp = (playerCharacters, playerMaxHp) => {
    const initialHp = {}
    playerCharacters.forEach(char => {
        if (!initialHp[char.id]) {
            initialHp[char.id] = playerMaxHp
        }
    })
    return initialHp
};