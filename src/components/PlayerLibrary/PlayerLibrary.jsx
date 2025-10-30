import './PlayerLibrary.css'
import { useState } from 'react'
import {
    getActiveCharactersCount,
    isCharacterActive,
    getCharacterPosition,
    canAddToActiveTeam,
    canRemoveFromActiveTeam,
    addCharacterToSlot,
    removeCharacterFromTeam,
    getSlotStatus,
    getPositionText
} from '../../utils/activeCharactersLogic'

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

    // ========== ACTIVE CHARACTER MANAGEMENT ==========

    /*Handles character selection for activation*/
    const handleCharacterSelectForActive = (character, e) => {
        e.stopPropagation()

        // Validate if character can be added using logic function
        const validation = canAddToActiveTeam(activeCharacters, character, 6)

        if (!validation.valid) {
            alert(validation.message)
            return
        }

        setSelectedCharacterForActive(character)
        setShowActiveSelection(true)
    }

    /* Handles slot selection for active character*/
    const handleActiveSlotSelect = (position, slot) => {
        if (!selectedCharacterForActive) return

        // Use logic function to add character
        const newActiveCharacters = addCharacterToSlot(
            activeCharacters,
            selectedCharacterForActive,
            position,
            slot
        )

        setActiveCharacters(newActiveCharacters)

        // Show success message
        const positionText = getPositionText(position, slot)
        alert(`${selectedCharacterForActive.name} asignado a la posición ${positionText}`)

        // Close modal
        setShowActiveSelection(false)
        setSelectedCharacterForActive(null)
    }

    /* Removes a character from active team*/
    const removeActiveCharacter = (character, e) => {
        e.stopPropagation()

        // Validate if character can be removed using logic function
        const validation = canRemoveFromActiveTeam(activeCharacters, character, 1)

        if (!validation.valid) {
            alert(validation.message)
            return
        }

        // Use logic function to remove character
        const newActiveCharacters = removeCharacterFromTeam(activeCharacters, character)
        setActiveCharacters(newActiveCharacters)

        alert(`${character.name} retirado del equipo activo`)
    }

    // ========== RENDER FUNCTIONS ==========

    /* Renders empty state when no characters*/
    const renderEmptyState = () => (
        <div className="empty-library">
            <p>No tienes ninguna alma en tu colección aún.</p>
            <p>¡Realiza algunas invocaciones para comenzar!</p>
        </div>
    )

    /* Renders individual character card */
    const renderCharacterCard = (character) => {
        const isActive = isCharacterActive(activeCharacters, character)
        const position = isActive ? getCharacterPosition(activeCharacters, character) : null
        const activeCount = getActiveCharactersCount(activeCharacters)

        return (
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
                    {isActive && (
                        <p><b>Posición:</b> {position}</p>
                    )}
                </div>

                {/* CARD FOOTER SECTION */}
                <div className="card-footer">
                    <div className={`rarity-indicator rarity-${character.rarityTier}`}>
                        {character.rarityTier === 3 ? '★3★' :
                            character.rarityTier === 2 ? '✦2✦' : '•1•'}
                    </div>
                    <div className="active-buttons">
                        {isActive ? (
                            <>
                                <span className="active-position">{position}</span>
                                <button
                                    className="remove-active-button"
                                    onClick={(e) => removeActiveCharacter(character, e)}>
                                    ✖ Retirar
                                </button>
                            </>
                        ) : (
                            <button
                                className={`active-select-button ${activeCount >= 6 ? 'disabled' : ''}`}
                                onClick={(e) => handleCharacterSelectForActive(character, e)}
                                disabled={activeCount >= 6}>
                                {activeCount >= 6 ? '✖ Lleno' : '⚔️ Elegir'}
                            </button>
                        )}
                    </div>
                </div>
            </div>
        )
    }

    /* Renders slot button for position selection modal */
    const renderSlotButton = (position, slot) => {
        const slotInfo = getSlotStatus(activeCharacters, position, slot)

        return (
            <button
                key={`${position}-${slot}`}
                className={`active-slot ${slotInfo.occupied ? 'occupied' : 'empty'}`}
                onClick={() => handleActiveSlotSelect(position, slot)}
            >
                {slotInfo.displayText}
            </button>
        )
    }

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
                    <p>Almas Elegidas: {getActiveCharactersCount(activeCharacters)}/6</p>
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
                        <p>Elige una posición de combate (máximo 6 Almas Elegidas)</p>

                        <div className="active-slots-grid">
                            {/* Front Row */}
                            <div className="battle-row front-row">
                                <h4>🎯 Fila Delantera</h4>
                                <div className="slots-container">
                                    {[0, 1, 2].map(slot => renderSlotButton('front', slot))}
                                </div>
                            </div>

                            {/* Back Row */}
                            <div className="battle-row back-row">
                                <h4>🛡️ Fila Trasera</h4>
                                <div className="slots-container">
                                    {[0, 1, 2].map(slot => renderSlotButton('back', slot))}
                                </div>
                            </div>
                        </div>

                        <div className="modal-actions">
                            <button
                                onClick={() => {
                                    setShowActiveSelection(false)
                                    setSelectedCharacterForActive(null)
                                }}
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