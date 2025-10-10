import './PlayerLibrary.css'

function PlayerLibrary({
    playerCharacters,
    sortBy,
    setSortBy,
    onBack,
    onCharacterClick,
    onShowStats,
    playerCoins,
    onExploreDungeon,
    setDungeonCharacter,
    dungeonCharacter
}) {
    // ========== RENDER FUNCTIONS ==========
    const renderEmptyState = () => (
        <div className="empty-library">
            <p>No tienes personajes en tu colección aún.</p>
            <p>¡Haz algunos pulls en el gacha para empezar!</p>
        </div>
    )

    const renderCharacterCard = (character) => (
        <div
            key={character.id}
            className={`library-card rarity-${character.rarityTier}`}
            onClick={() => onCharacterClick(character)}
            style={{ cursor: 'pointer' }}>

            {/* CARD HEADER SECTION */}
            <div className="card-header">
                <h3 className="character-name">{character.name}</h3>
                <span className="duplicate-count">x{character.duplicates}</span>
            </div>

            {/* CHARACTER IMAGE SECTION */}
            <div className="character-image-container">
                <img
                    src={character.images?.[0]}
                    alt={character.name}
                    className="character-image"
                />
            </div>

            {/* CHARACTER INFO SECTION */}
            <div className="card-info">
                <p><b>ID:</b> {character.id}</p>
                <p><b>Rareza:</b>
                    <span className={`rarity-${character.rarityTier}-text`}>
                        {character.rarity}
                    </span>
                </p>
                <p><b>Clase:</b> {character.class}</p>
                <p><b>Fragmento:</b> {character.fragment}</p>
            </div>

            {/* CARD FOOTER SECTION */}
            <div className="card-footer">
                <div className={`rarity-indicator rarity-${character.rarityTier}`}>
                    {character.rarityTier === 3 ? '★3★' :
                        character.rarityTier === 2 ? '✦2✦' : '•1•'}
                </div>
                <button
                    className="dungeon-select-button"
                    onClick={(e) => {
                        e.stopPropagation()
                        setDungeonCharacter(character)
                        alert(`${character.name} seleccionado para el Dungeon!`)
                    }}>
                    {dungeonCharacter?.id === character.id ? '✅ En Uso' : '🗡️ Usar en Dungeon'}
                </button>
            </div>
        </div>
    )

    // ========== MAIN COMPONENT RENDER ==========
    return (
        <div className="library-container">

            {/* ========== LIBRARY HEADER SECTION ========== */}
            <div className="library-header">
                <h1>Mi Biblioteca de Almas</h1>

                {/* LIBRARY INFORMATION */}
                <div className="library-info">
                    <p>Personajes coleccionados: {playerCharacters.length}</p>
                    <p>Monedas: {playerCoins}</p>
                </div>

                {/* SORTING CONTROLS */}
                <div className="sort-controls">
                    <label>Ordenar por: </label>
                    <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                        className="sort-select"
                    >
                        <option value="id">ID</option>
                        <option value="name">Nombre</option>
                        <option value="rarity">Rareza</option>
                        <option value="fragment">Fragmento</option>
                        <option value="class">Clase</option>
                        <option value="duplicates">Duplicados</option>
                    </select>
                </div>

                {/* ACTION BUTTONS */}
                <div className="action-buttons">
                    <button onClick={onShowStats} className="stats-button">
                        Ver Estadísticas
                    </button>
                    <button onClick={onExploreDungeon} className='dungeon-button'>
                        Explorar Dungeon
                    </button>
                    <button onClick={onBack} className="back-button">
                        Volver al Gacha
                    </button>
                </div>
            </div>

            {/* ========== CHARACTER GRID SECTION ========== */}
            <div className="library-grid">
                {playerCharacters.length === 0
                    ? renderEmptyState()
                    : playerCharacters.map(renderCharacterCard)
                }
            </div>
        </div>
    )
}

export default PlayerLibrary