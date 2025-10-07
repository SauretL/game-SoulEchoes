import './PlayerLibrary.css'

function PlayerLibrary({ playerCharacters, sortBy, setSortBy, onBack }) {
    return (
        <div className="library-container">
            <div className="library-header">
                <h1>Mi Biblioteca de Almas</h1>
                <p>Personajes coleccionados: {playerCharacters.length}</p>

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
                    </select>
                </div>

                <button onClick={onBack} className="back-button">
                    Volver al Gacha
                </button>
            </div>

            <div className="library-grid">
                {playerCharacters.length === 0 ? (
                    <div className="empty-library">
                        <p>No tienes personajes en tu colección aún.</p>
                        <p>¡Haz algunos pulls en el gacha para empezar!</p>
                    </div>
                ) : (
                    playerCharacters.map(character => (
                        <div key={character.id} className={`library-card rarity-${character.rarityTier}`}>
                            <div className="card-header">
                                <h3 className="character-name">{character.name}</h3>
                                <span className="duplicate-count">x{character.duplicates}</span>
                            </div>
                            <div className="character-image-container" >
                                <img
                                    src={character.images?.[0]}
                                    alt={character.name}
                                    className="character-image"
                                />
                            </div>
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

                            <div className="card-footer">
                                <div className={`rarity-indicator rarity-${character.rarityTier}`}>
                                    {character.rarityTier === 3 ? '★' : character.rarityTier === 2 ? '✦' : '•'}
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    )
}

export default PlayerLibrary