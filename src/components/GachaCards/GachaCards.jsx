import './GachaCards.css'

function GachaCards({ arrayInicial = [], onCharacterClick }) {
    // ========== RENDER FUNCTION ==========
    return (
        <div className="cards-container">
            {arrayInicial.map((character, index) => {
                // ========== CHARACTER DATA PROCESSING ==========
                const rarity = character.rarityTier || character.rarity || 1
                const key = character._drawUid || character.id || `${character.name}-${index}`

                // ========== INDIVIDUAL CARD RENDER ==========
                return (
                    <div
                        key={key}
                        className={`character-card rarity-${rarity}`}
                        onClick={() => onCharacterClick(character)}
                        style={{ cursor: 'pointer' }}>

                        {/* CHARACTER BASIC INFO */}
                        <h3 className="character-name">{character.name}</h3>
                        <p className="character-epitaph">{character.epitaph}</p>
                        <p><b>Rareza</b>: {character.rarity || rarity}</p>
                        <p><b>Clase</b>: {character.class}</p>
                        <p><b>Fragmento</b>: {character.fragment}</p>

                        {/* CHARACTER IMAGE */}
                        <img
                            src={character.images?.[0]}
                            alt={character.name}
                            className="character-image"
                        />

                        {/* CHARACTER GAMEPLAY INFO */}
                        <p><b>Equipo</b>: {character.equipmentNames?.[0]}</p>
                        <p><b>Habilidades</b>: {character.skillsNames?.[0]}</p>
                        <p className='character-quote'>{character.quotes?.[0]}</p>
                    </div>
                )
            })}
        </div>
    )
}

export default GachaCards