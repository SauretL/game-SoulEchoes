import './GachaCards.css'

function GachaCards({ arrayInicial }) {
    return (
        <div className="cards-container">
            {arrayInicial.map((character, index) => (
                <div key={character.id || index} className="character-card">
                    <h3 className="character-name">{character.name}</h3>
                    <p className="character-epitaph">{character.epitaph}</p>
                    <p><b>Rareza</b>: {character.rarity}</p>
                    <p><b>Clase</b>: {character.class}</p>
                    <p><b>Fragmento</b>: {character.fragment}</p>
                    <img
                        src={character.images[0]}
                        alt={character.name}
                        className="character-image"

                    />
                    <p><b>Equipo</b>: {character.equipmentNames[0]}</p>
                    <p><b>Habilidades</b>: {character.skillsNames[0]}</p>
                    <p className='character-quote'>{character.quotes[0]}</p>
                </div>
            ))}
        </div>
    )
}

export default GachaCards