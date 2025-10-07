function gachaPull(characters, pulls) {
    const results = []

    // Group chars by rarity
    const commonChars = characters.filter(char => char.rarityTier === 1)
    const rareChars = characters.filter(char => char.rarityTier === 2)
    const epicChars = characters.filter(char => char.rarityTier === 3)

    for (let i = 0; i < pulls; i++) {
        const randomNum = Math.random() * 100

        let selectedCharacter

        if (randomNum < 85) {
            // 85% - Common
            const randomIndex = Math.floor(Math.random() * commonChars.length)
            selectedCharacter = commonChars[randomIndex]
        } else if (randomNum < 98) {
            // 13% - Rare (85 + 13 = 98)
            const randomIndex = Math.floor(Math.random() * rareChars.length)
            selectedCharacter = rareChars[randomIndex]
        } else {
            // 2% - Epic (98 + 2 = 100)
            const randomIndex = Math.floor(Math.random() * epicChars.length)
            selectedCharacter = epicChars[randomIndex]
        }

        results.push(selectedCharacter)
    }

    return results
}

export default gachaPull