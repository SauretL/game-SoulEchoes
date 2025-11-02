import React, { useState, useEffect, useCallback } from 'react'
import './Dungeon.css'
import {
  getInitialDungeonState,
  resetDungeonState,
  executePlayerMovement,
  getCellDisplay,
  getAllActiveCharacters,
  getActiveCharactersCount,
  hasActiveCharacters,
  isMovementAllowed,
  getDirectionFromKey,
  isResetKey,
  resetAllCharactersHP,
  generateRandomEnemyParty
} from '../../utils/dungeonLogic'
import {
  getDefaultDungeon,
  getRandomFormationForDungeon,
  getDungeonById,
  getNextDungeonId
} from '../../utils/dungeonMaps'

const Dungeon = ({
  onBack,
  onCoinEarned,
  playerCoins,
  activeCharacters,
  onCharacterClick,
  onStartCombat,
  enemies,
  inCombat,
  onResetDungeon,
  playerCharactersHp,
  playerMaxHp
}) => {
  // ========== DUNGEON CONFIGURATION ==========
  const [currentDungeon, setCurrentDungeon] = useState(getDefaultDungeon())
  const map = currentDungeon.map
  const startPosition = currentDungeon.startPos
  const encounterRate = currentDungeon.encounterRate

  // ========== STATE MANAGEMENT ==========
  const [playerPos, setPlayerPos] = useState(startPosition)
  const [coinsCollected, setCoinsCollected] = useState(0)
  const [pendingCoins, setPendingCoins] = useState(0)
  const [combatTriggered, setCombatTriggered] = useState(false)
  const [showStairsModal, setShowStairsModal] = useState(false)
  const [stairsMessage, setStairsMessage] = useState('')
  const [isOnStairs, setIsOnStairs] = useState(false)

  // ========== MOBILE MODALS ==========
  const [showCharactersModal, setShowCharactersModal] = useState(false)
  const [showInstructionsModal, setShowInstructionsModal] = useState(false)

  // ========== COIN PROCESSING EFFECT ==========
  useEffect(() => {
    if (pendingCoins > 0) {
      const timer = setTimeout(() => {
        onCoinEarned(pendingCoins)
        setCoinsCollected(prev => prev + pendingCoins)
        setPendingCoins(0)
      }, 0)

      return () => clearTimeout(timer)
    }
  }, [pendingCoins, onCoinEarned])

  // ========== COMBAT TRIGGER EFFECT ==========
  useEffect(() => {
    if (combatTriggered && enemies && enemies.length > 0) {
      setCombatTriggered(false)
    }
  }, [combatTriggered, enemies])

  // ========== PLAYER MOVEMENT LOGIC ==========
  const movePlayer = useCallback((direction) => {
    // Check if movement is allowed
    if (!isMovementAllowed(inCombat)) {
      return
    }

    // Execute movement with dungeon ID parameter
    const movementResult = executePlayerMovement(
      playerPos,
      direction,
      map,
      currentDungeon.id,
      encounterRate
    )

    // If movement was successful, update position
    if (movementResult.moved) {
      setPlayerPos(movementResult.newPosition)

      // Check if player stepped on stairs
      if (movementResult.levelUp) {
        setIsOnStairs(true)
        return
      } else {
        setIsOnStairs(false)
      }

      // Si combat fue triggered, generar enemigos y empezar combate
      if (movementResult.combatTriggered) {
        // Generate random enemy party based on current dungeon
        const enemyParty = generateRandomEnemyParty(
          currentDungeon.id,
          enemies,
          getRandomFormationForDungeon
        )
        // Start combat with the generated party
        onStartCombat(enemyParty)
      }
    }
  }, [inCombat, enemies, playerPos, map, onStartCombat, encounterRate, currentDungeon.id])

  // ========== STAIRS INTERACTION LOGIC ==========
  const handleStairsInteraction = useCallback(() => {
    const nextDungeonId = getNextDungeonId(currentDungeon.id)

    if (!nextDungeonId) {
      setStairsMessage('¡Has llegado a la cima de la torre! Esta es la mazmorra final.')
      setShowStairsModal(true)
      return
    }

    // Player can always use stairs - no level restrictions
    const nextDungeon = getDungeonById(nextDungeonId)
    setCurrentDungeon(nextDungeon)
    setPlayerPos(nextDungeon.startPos)
    setIsOnStairs(false)

    // Reset dungeon state for new level
    const newState = getInitialDungeonState(nextDungeon.startPos)
    setCoinsCollected(newState.coinsCollected)
    setPendingCoins(newState.pendingCoins)
    setCombatTriggered(newState.combatTriggered)

    console.log(`🏰 Cambiado a mazmorra: ${nextDungeon.name}`)
  }, [currentDungeon.id])

  // ========== STAIRS CONFIRMATION ==========
  const handleStairsConfirm = () => {
    setShowStairsModal(false)
  }

  // ========== MANUAL COMBAT RESET ==========
  const manualCombatReset = useCallback(() => {
    if (typeof onResetDungeon === 'function') {
      onResetDungeon()
    }
  }, [onResetDungeon])

  // ========== KEYBOARD CONTROLS ==========
  useEffect(() => {
    const handleKeyPress = (e) => {
      // Prevenir comportamiento por defecto para las teclas de flecha y otras teclas de juego
      const gameKeys = ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'r', 'R', 'Enter', ' '];
      if (gameKeys.includes(e.key)) {
        e.preventDefault(); // Esto evita que el scroll se mueva
      }

      // Check for reset key
      if (isResetKey(e.key)) {
        manualCombatReset()
        return
      }

      // Check for Enter key when on stairs
      if ((e.key === 'Enter' || e.key === ' ') && isOnStairs && !inCombat) {
        handleStairsInteraction()
        return
      }

      // Check if movement is allowed
      if (!isMovementAllowed(inCombat)) {
        return
      }

      // Get direction from key
      const direction = getDirectionFromKey(e.key)
      if (direction) {
        movePlayer(direction)
      }
    }

    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [movePlayer, inCombat, manualCombatReset, isOnStairs, handleStairsInteraction])

  // ========== PREVENT SCROLL EFFECT ==========
  useEffect(() => {
    // Add class to body when dungeon is mounted
    document.body.classList.add('dungeon-active');

    // Focus the container to capture keyboard events
    const container = document.querySelector('.dungeon-container');
    if (container) {
      container.focus({ preventScroll: true });
    }

    return () => {
      // Remove class when component unmounts
      document.body.classList.remove('dungeon-active');
    };
  }, []);

  // ========== RENDER ACTIVE CHARACTERS ==========
  const renderActiveCharacters = () => {
    const activeCount = getActiveCharactersCount(activeCharacters)
    const allActiveChars = getAllActiveCharacters(activeCharacters)

    // If no active characters, show empty state
    if (!hasActiveCharacters(activeCharacters)) {
      return (
        <div className="dungeon-active-characters">
          <h4>Almas Elegidas (0/3)</h4>
          <div className="no-active-characters">
            <p>No hay almas elegidas activas</p>
            <small>Ve a tu biblioteca para elegir almas para la aventura</small>
          </div>
        </div>
      )
    }

    return (
      <div className="dungeon-active-characters">
        <h4>Almas Elegidas ({activeCount}/6)</h4>
        <div className="active-characters-grid">
          {allActiveChars.map((character, index) => (
            <div
              key={`${character.id}-${index}`}
              className="dungeon-character-card"
              onClick={() => onCharacterClick(character)}
              style={{ cursor: 'pointer' }}
            >
              <div className="position-badge">
                {character.position}
              </div>

              <div className={`dungeon-character-header rarity-${character.rarityTier}`}>
                <h4>{character.name}</h4>
                <span className="dungeon-duplicates">x{character.duplicates}</span>
              </div>

              <div className="dungeon-character-image">
                <img src={character.images?.[0]} alt={character.name} />
              </div>

              <div className="dungeon-character-hp">
                <div className="hp-bar">
                  <div
                    className="hp-fill"
                    style={{
                      width: `${Math.max(0, (playerCharactersHp[character.id] || playerMaxHp) / playerMaxHp * 100)}%`
                    }}
                  ></div>
                  <span className="hp-text">
                    PV: {playerCharactersHp[character.id] || playerMaxHp}/{playerMaxHp}
                  </span>
                </div>
              </div>

              <div className="dungeon-character-info">
                <p>
                  <b>Rareza:</b>
                  <span className={`rarity-${character.rarityTier}-text`}>
                    {character.rarity}
                  </span>
                </p>
                <p><b>Clase:</b> {character.class}</p>
              </div>

              <div className="dungeon-character-indicator">
                {character.rarityTier === 3 ? '★3★' :
                  character.rarityTier === 2 ? '✦2✦' : '•1•'}
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  // ========== RENDER CHARACTERS MODAL ==========
  const renderCharactersModal = () => {
    if (!showCharactersModal) return null

    return (
      <div className="mobile-modal-overlay">
        <div className="mobile-modal">
          <div className="mobile-modal-header">
            <h3>🎭 Almas Elegidas</h3>
            <button
              className="close-modal-btn"
              onClick={() => setShowCharactersModal(false)}
            >
              ✕
            </button>
          </div>
          <div className="mobile-modal-content">
            {renderActiveCharacters()}
          </div>
        </div>
      </div>
    )
  }

  // ========== RENDER INSTRUCTIONS MODAL ==========
  const renderInstructionsModal = () => {
    if (!showInstructionsModal) return null

    return (
      <div className="mobile-modal-overlay">
        <div className="mobile-modal">
          <div className="mobile-modal-header">
            <h3>🎯 Instrucciones</h3>
            <button
              className="close-modal-btn"
              onClick={() => setShowInstructionsModal(false)}
            >
              ✕
            </button>
          </div>
          <div className="mobile-modal-content">
            <div className="dungeon-instructions-sidebar">
              <p><strong>Movimiento:</strong> Flechas del teclado o botones táctiles</p>
              <p><strong>Encuentros:</strong> {(encounterRate * 100).toFixed(0)}% por paso</p>
              <p><strong>Escaleras:</strong> Busca ⇧ y presiona ENTER</p>
              <p><strong>Monedas:</strong> Ganas al derrotar enemigos</p>
              <p><strong>Pérdidas:</strong> Pierdes si eres derrotado</p>

              {inCombat && (
                <p className="combat-warning">
                  ⚠️ <strong>Combate en curso</strong> - Movimiento bloqueado
                </p>
              )}
              {isOnStairs && !inCombat && (
                <p className="stairs-warning">
                  🏰 <strong>¡En escaleras!</strong> Presiona ENTER
                </p>
              )}
            </div>

            <div className="dungeon-stats-sidebar">
              <h4>📊 Estadísticas</h4>
              <div className="stat-item">
                <span className="stat-label">Posición:</span>
                <span className="stat-value">({playerPos.x}, {playerPos.y})</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Monedas ganadas:</span>
                <span className="stat-value">+{coinsCollected}</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Estado:</span>
                <span className={`stat-value ${inCombat ? 'combat' : 'exploring'}`}>
                  {inCombat ? '⚔️ En Combate' : '🌍 Explorando'}
                </span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Mazmorra:</span>
                <span className="stat-value">{currentDungeon.name}</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Dificultad:</span>
                <span className="stat-value">{currentDungeon.difficulty}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // ========== RENDER STAIRS MODAL ==========
  const renderStairsModal = () => {
    if (!showStairsModal) return null

    const nextDungeonId = getNextDungeonId(currentDungeon.id)
    const canAdvance = !!nextDungeonId

    return (
      <div className="stairs-modal-overlay">
        <div className="stairs-modal">
          <h3>¡Escaleras Encontradas! 🏰</h3>
          <p>{stairsMessage}</p>

          {nextDungeonId && (
            <div className="next-dungeon-info">
              <h4>Próxima Mazmorra:</h4>
              <p><strong>Nombre:</strong> {getDungeonById(nextDungeonId).name}</p>
              <p><strong>Dificultad:</strong> {getDungeonById(nextDungeonId).difficulty}</p>
            </div>
          )}

          <div className="modal-actions">
            {canAdvance ? (
              <>
                <button
                  className="confirm-button"
                  onClick={handleStairsConfirm}
                >
                  🏰 Avanzar al Siguiente Nivel
                </button>
                <button
                  className="cancel-button"
                  onClick={() => setShowStairsModal(false)}
                >
                  ↩️ Seguir Explorando
                </button>
              </>
            ) : (
              <button
                className="confirm-button"
                onClick={() => setShowStairsModal(false)}
              >
                Entendido
              </button>
            )}
          </div>
        </div>
      </div>
    )
  }

  // ========== DUNGEON RESET FUNCTION ==========
  const resetDungeon = () => {
    console.log(`🔄 DUNGEON RESET - Reiniciando mazmorra completa`)

    // Reset to first dungeon
    const firstDungeon = getDefaultDungeon()
    setCurrentDungeon(firstDungeon)

    const newState = resetDungeonState(firstDungeon.startPos)
    setPlayerPos(newState.playerPos)
    setCoinsCollected(newState.coinsCollected)
    setPendingCoins(newState.pendingCoins)
    setCombatTriggered(newState.combatTriggered)
    setIsOnStairs(false)

    console.log(`🔄 PLAYER POSITION RESET - Nueva posición: (${newState.playerPos.x}, ${newState.playerPos.y})`)

    // Reset all character HP using logic function
    if (activeCharacters) {
      console.log(`🔄 CHARACTER HP RESET - Reiniciando HP de ${getActiveCharactersCount(activeCharacters)} personajes`)
      const hpResets = resetAllCharactersHP(activeCharacters, playerMaxHp)

      hpResets.forEach(({ characterId, newHp }) => {
        if (typeof onCharacterHpChange === 'function') {
          onCharacterHpChange(characterId, newHp)
        }
      })
    }
  }

  // ========== RENDER COMPONENT ==========
  return (
    <div
      className="dungeon-container"
      tabIndex="0"
      onKeyDown={(e) => e.preventDefault()}
    >
      {/* ========== MODALS ========== */}
      {renderStairsModal()}
      {renderCharactersModal()}
      {renderInstructionsModal()}

      {/* ========== DUNGEON HEADER ========== */}
      <div className="dungeon-header">
        <h2>{currentDungeon.name}</h2>
        <div className="dungeon-info">
          <div className="coins-display">
            <span className="coins-label">Monedas:</span>
            <span className="coins-count">{playerCoins}</span>
          </div>
          <div className="dungeon-coins-collected">
            <span>Recolectadas: +{coinsCollected}</span>
          </div>
        </div>
      </div>

      {/* ========== MAIN CONTENT GRID ========== */}
      <div className="dungeon-main-grid">

        {/* ========== LEFT SIDEBAR - ACTIVE CHARACTERS ========== */}
        <div className="dungeon-sidebar left-sidebar">
          {renderActiveCharacters()}
        </div>

        {/* ========== CENTER CONTENT - MAP AND CONTROLS ========== */}
        <div className="dungeon-center-content">

          {/* Dungeon difficulty badge */}
          <div className="dungeon-difficulty-badge">
            <small>Dificultad: <strong>{currentDungeon.difficulty}</strong></small>
          </div>

          {/* ========== COMBAT STATUS INDICATOR ========== */}
          {inCombat && (
            <div className="combat-status">
              ⚔️ EN COMBATE - Movimiento deshabilitado
              <br />
              <small>Presiona 'R' para reset manual si hay errores</small>
            </div>
          )}

          {/* ========== STAIRS INDICATOR ========== */}
          {isOnStairs && !inCombat && (
            <div className="stairs-status">
              🏰 ¡Escaleras encontradas!
              <br />
              <small>Presiona ENTER o el botón 🏰 para subir de nivel</small>
            </div>
          )}

          {/* ========== NAVIGATION BUTTONS ========== */}
          <div className="dungeon-navigation">
            <button onClick={onBack} className="nav-button back-button">
              ← Volver a Invocaciones
            </button>
            <button onClick={resetDungeon} className="nav-button refresh-button">
              🔄 Reiniciar Mazmorra
            </button>
          </div>

          {/* ========== DUNGEON MAP DISPLAY ========== */}
          <div className="dungeon-map-container">
            <div className="dungeon-map">
              {map.map((row, y) => (
                <div key={y} className="map-row">
                  {row.map((cell, x) => (
                    <div
                      key={x}
                      className={`map-cell ${cell === 1 ? 'wall' : 'floor'} 
                                                ${cell === 2 ? 'stairs' : ''}
                                                ${x === playerPos.x && y === playerPos.y ? 'player' : ''}`}
                    >
                      {getCellDisplay(cell, x, y, playerPos)}
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>

          {/* ========== MAP LEGEND ========== */}
          <div className="dungeon-legend">
            <div className="legend-item">
              <span className="legend-symbol">☻</span>
              <span className="legend-text">Jugador</span>
            </div>
            <div className="legend-item">
              <span className="legend-symbol">█</span>
              <span className="legend-text">Pared</span>
            </div>
            <div className="legend-item">
              <span className="legend-symbol">·</span>
              <span className="legend-text">Suelo</span>
            </div>
            <div className="legend-item">
              <span className="legend-symbol">⇧</span>
              <span className="legend-text">Escaleras</span>
            </div>
          </div>

          {/* ========== TOUCH CONTROLS ========== */}
          <div className="touch-controls">
            <div className="touch-row">
              <button
                className="touch-button up-button"
                onClick={() => movePlayer('up')}
                disabled={inCombat}
              >
                ↑
              </button>
            </div>
            <div className="touch-row">
              <button
                className="touch-button left-button"
                onClick={() => movePlayer('left')}
                disabled={inCombat}
              >
                ←
              </button>
              <button
                className="touch-button down-button"
                onClick={() => movePlayer('down')}
                disabled={inCombat}
              >
                ↓
              </button>
              <button
                className="touch-button right-button"
                onClick={() => movePlayer('right')}
                disabled={inCombat}
              >
                →
              </button>
            </div>
            {isOnStairs && !inCombat && (
              <div className="touch-row stairs-row">
                <button
                  className="touch-button stairs-button"
                  onClick={handleStairsInteraction}
                >
                  🏰 SUBIR ESCALERAS
                </button>
              </div>
            )}
          </div>
        </div>

        {/* ========== RIGHT SIDEBAR - INFO AND STATS ========== */}
        <div className="dungeon-sidebar right-sidebar">

          {/* ========== DUNGEON INSTRUCTIONS ========== */}
          <div className="dungeon-instructions-sidebar">
            <h4>🎯 Instrucciones</h4>
            <p><strong>Movimiento:</strong> Flechas del teclado o botones táctiles</p>
            <p><strong>Encuentros:</strong> {(encounterRate * 100).toFixed(0)}% por paso</p>
            <p><strong>Escaleras:</strong> Busca ⇧ y presiona ENTER</p>
            <p><strong>Monedas:</strong> Ganas al derrotar enemigos</p>
            <p><strong>Pérdidas:</strong> Pierdes si eres derrotado</p>

            {inCombat && (
              <p className="combat-warning">
                ⚠️ <strong>Combate en curso</strong> - Movimiento bloqueado
              </p>
            )}
            {isOnStairs && !inCombat && (
              <p className="stairs-warning">
                🏰 <strong>¡En escaleras!</strong> Presiona ENTER
              </p>
            )}
          </div>

          {/* ========== DUNGEON STATISTICS ========== */}
          <div className="dungeon-stats-sidebar">
            <h4>📊 Estadísticas</h4>
            <div className="stat-item">
              <span className="stat-label">Posición:</span>
              <span className="stat-value">({playerPos.x}, {playerPos.y})</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Monedas ganadas:</span>
              <span className="stat-value">+{coinsCollected}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Estado:</span>
              <span className={`stat-value ${inCombat ? 'combat' : 'exploring'}`}>
                {inCombat ? '⚔️ En Combate' : '🌍 Explorando'}
              </span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Mazmorra:</span>
              <span className="stat-value">{currentDungeon.name}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Dificultad:</span>
              <span className="stat-value">{currentDungeon.difficulty}</span>
            </div>
          </div>

          {/* ========== QUICK ACTIONS ========== */}
          <div className="quick-actions">
            <h4>⚡ Acciones Rápidas</h4>
            <button
              className="quick-action-btn"
              onClick={resetDungeon}
              title="Reiniciar mazmorra actual"
            >
              🔄 Reiniciar
            </button>
            <button
              className="quick-action-btn"
              onClick={onBack}
              title="Volver a invocaciones"
            >
              🏠 Salir
            </button>
            {isOnStairs && !inCombat && (
              <button
                className="quick-action-btn stairs-btn"
                onClick={handleStairsInteraction}
                title="Subir al siguiente nivel"
              >
                🏰 Subir Nivel
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ===== FLOATING MOBILE CONTROLS ===== */}
      <div className="floating-controls">
        <div className="floating-controls-row">
          <button
            className="floating-button"
            onClick={() => movePlayer('up')}
            disabled={inCombat}
          >
            ↑
          </button>
        </div>
        <div className="floating-controls-row">
          <button
            className="floating-button"
            onClick={() => movePlayer('left')}
            disabled={inCombat}
          >
            ←
          </button>
          <button
            className="floating-button"
            onClick={() => movePlayer('down')}
            disabled={inCombat}
          >
            ↓
          </button>
          <button
            className="floating-button"
            onClick={() => movePlayer('right')}
            disabled={inCombat}
          >
            →
          </button>
        </div>
        {isOnStairs && !inCombat && (
          <div className="floating-controls-row">
            <button
              className="floating-button stairs-button"
              onClick={handleStairsInteraction}
            >
              🏰 SUBIR
            </button>
          </div>
        )}
      </div>

      {/* ===== MOBILE INFO BUTTONS ===== */}
      <div className="mobile-info-buttons">
        <button
          className="mobile-info-btn characters-btn"
          onClick={() => setShowCharactersModal(true)}
        >
          🎭 Almas
        </button>
        <button
          className="mobile-info-btn instructions-btn"
          onClick={() => setShowInstructionsModal(true)}
        >
          🎯 Instrucciones
        </button>
      </div>
    </div>
  )
}

export default Dungeon