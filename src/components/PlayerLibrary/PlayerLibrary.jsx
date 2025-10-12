import './PlayerLibrary.css'
import { useState } from 'react'

function PlayerLibrary({
    playerCharacters,
    sortBy,
    setSortBy,
    onBack,
    onCharacterClick,
    onShowStats,
    playerCoins,
    onExploreDungeon,
    setActiveCharacter,
    setActiveCharacters,
    activeCharacters
}) {
    // ========== STATE MANAGEMENT ==========
    const [showActiveSelection, setShowActiveSelection] = useState(false)
    const [selectedCharacterForActive, setSelectedCharacterForActive] = useState(null)

    // ========== ACTIVE CHARACTERS UTILITIES ==========

    /* Counts total active characters*/
    const getActiveCharactersCount = () => {
        return activeCharacters.front.filter(char => char).length +
            activeCharacters.back.filter(char => char).length
    }

    /*Checks if a character is currently active*/
    const isCharacterActive = (character) => {
        return activeCharacters.front.some(char => char?.id === character.id) ||
            activeCharacters.back.some(char => char?.id === character.id)
    }

    /*Gets the current position of an active character*/
    const getCharacterPosition = (character) => {
        const frontIndex = activeCharacters.front.findIndex(char => char?.id === character.id)
        if (frontIndex !== -1) return `Delantera ${frontIndex + 1}`

        const backIndex = activeCharacters.back.findIndex(char => char?.id === character.id)
        if (backIndex !== -1) return `Trasera ${backIndex + 1}`

        return null
    }

    // ========== ACTIVE CHARACTER MANAGEMENT ==========

    /*Handles character selection for activation*/
    const handleCharacterSelectForActive = (character, e) => {
        e.stopPropagation()

        // Check if character is already active
        if (isCharacterActive(character)) {
            alert(`${character.name} ya está en la posición: ${getCharacterPosition(character)}`)
            return
        }

        // Check max active characters
        const activeCount = getActiveCharactersCount()
        if (activeCount >= 3) {
            alert("Solo puedes tener hasta 3 Almas Elegidas. Retira una antes de continuar.")
            return
        }

        setSelectedCharacterForActive(character)
        setShowActiveSelection(true)
    }

    /* Handles slot selection for active character*/
    const handleActiveSlotSelect = (position, slot) => {
        if (selectedCharacterForActive) {
            setActiveCharacter(selectedCharacterForActive, position, slot)
            setShowActiveSelection(false)
            setSelectedCharacterForActive(null)
            alert(`${selectedCharacterForActive.name} asignado a la posición ${position === 'front' ? 'delantera' : 'trasera'} ${slot + 1}`)
        }
    }

    /* Removes a character from active team*/
    const removeActiveCharacter = (character, e) => {
        e.stopPropagation()

        // Prevent removing the last active character
        const activeCount = getActiveCharactersCount()
        if (activeCount <= 1) {
            alert("¡No puedes retirar tu última Alma Elegida!")
            return
        }

        // Remove character using setActiveCharacters
        setActiveCharacters(prev => {
            const newActive = {
                front: [...prev.front],
                back: [...prev.back]
            }

            // Remove character from front row
            newActive.front = newActive.front.map(posChar =>
                posChar?.id === character.id ? null : posChar
            )

            // Remove character from back row
            newActive.back = newActive.back.map(posChar =>
                posChar?.id === character.id ? null : posChar
            )

            return newActive
        })

        alert(`${character.name} retirado del equipo activo`)
    }

    // ========== RENDER FUNCTIONS ==========

    /**
     * Renders empty state when no characters
     */
    const renderEmptyState = () => (
        <div className="empty-library">
            <p>No tienes ninguna alma en tu colección aún.</p>
            <p>¡Realiza algunas invocaciones para comenzar!</p>
        </div>
    )

    /**
     * Renders individual character card
     */
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
                {isCharacterActive(character) && (
                    <p><b>Posición:</b> {getCharacterPosition(character)}</p>
                )}
            </div>

            {/* CARD FOOTER SECTION */}
            <div className="card-footer">
                <div className={`rarity-indicator rarity-${character.rarityTier}`}>
                    {character.rarityTier === 3 ? '★3★' :
                        character.rarityTier === 2 ? '✦2✦' : '•1•'}
                </div>
                <div className="active-buttons">
                    {isCharacterActive(character) ? (
                        <>
                            <span className="active-position">{getCharacterPosition(character)}</span>
                            <button
                                className="remove-active-button"
                                onClick={(e) => removeActiveCharacter(character, e)}>
                                ❌ Retirar
                            </button>
                        </>
                    ) : (
                        <button
                            className={`active-select-button ${getActiveCharactersCount() >= 3 ? 'disabled' : ''}`}
                            onClick={(e) => handleCharacterSelectForActive(character, e)}
                            disabled={getActiveCharactersCount() >= 3}>
                            {getActiveCharactersCount() >= 3 ? '❌ Lleno' : '⚔️ Elegir'}
                        </button>
                    )}
                </div>
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
                    <p>Almas coleccionadas: {playerCharacters.length}</p>
                    <p>Monedas: {playerCoins}</p>
                    <p>Almas Elegidas: {getActiveCharactersCount()}/3</p>
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
                        Explorar Mazmorra
                    </button>
                    <button onClick={onBack} className="back-button">
                        Volver a Invocaciones
                    </button>
                </div>
            </div>

            {/* ========== ACTIVE SLOT SELECTION MODAL ========== */}
            {showActiveSelection && selectedCharacterForActive && (
                <div className="active-slot-modal-overlay">
                    <div className="active-slot-modal">
                        <h3>Seleccionar Posición para {selectedCharacterForActive.name}</h3>
                        <p>Elige una posición de combate (máximo 3 Almas Elegidas)</p>

                        <div className="active-slots-grid">
                            {/* Front Row */}
                            <div className="battle-row front-row">
                                <h4>🎯 Fila Delantera</h4>
                                <div className="slots-container">
                                    {[0, 1, 2].map(slot => (
                                        <button
                                            key={`front-${slot}`}
                                            className={`active-slot ${activeCharacters.front[slot] ? 'occupied' : 'empty'}`}
                                            onClick={() => handleActiveSlotSelect('front', slot)}
                                        >
                                            {activeCharacters.front[slot]
                                                ? `Ocupado: ${activeCharacters.front[slot].name}`
                                                : `Posición ${slot + 1} - Delantera`}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Back Row */}
                            <div className="battle-row back-row">
                                <h4>🛡️ Fila Trasera</h4>
                                <div className="slots-container">
                                    {[0, 1, 2].map(slot => (
                                        <button
                                            key={`back-${slot}`}
                                            className={`active-slot ${activeCharacters.back[slot] ? 'occupied' : 'empty'}`}
                                            onClick={() => handleActiveSlotSelect('back', slot)}
                                        >
                                            {activeCharacters.back[slot]
                                                ? `Ocupado: ${activeCharacters.back[slot].name}`
                                                : `Posición ${slot + 1} - Trasera`}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="modal-actions">
                            <button
                                onClick={() => setShowActiveSelection(false)}
                                className="cancel-button"
                            >
                                Cancelar
                            </button>
                        </div>
                    </div>
                </div>
            )}

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