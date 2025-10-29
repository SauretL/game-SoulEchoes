// ========== VIEW NAVIGATION ==========
export const changeView = (view, setCurrentView) => {
    setCurrentView(view);
};

// ========== CHARACTER DETAIL MANAGEMENT ==========
export const handleCharacterClick = (character, setSelectedCharacter) => {
    setSelectedCharacter(character);
};

export const closeCharacterDetail = (setSelectedCharacter) => {
    setSelectedCharacter(null);
};