/* Counts total active characters*/
export const getActiveCharactersCount = (activeCharacters) => {
    const frontCount = activeCharacters.front.filter(char => char !== null).length
    const backCount = activeCharacters.back.filter(char => char !== null).length
    return frontCount + backCount
}

/*Checks if a character is active*/
export const isCharacterActive = (activeCharacters, character) => {
    return activeCharacters.front.some(char => char?.id === character.id) ||
        activeCharacters.back.some(char => char?.id === character.id)
}

/*Gets the first active character*/
export const getFirstActiveCharacter = (activeCharacters) => {
    for (let char of activeCharacters.front) {
        if (char) return char
    }
    for (let char of activeCharacters.back) {
        if (char) return char
    }
    return null
}