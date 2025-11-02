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

  // ========== RENDER ACTIVE CHARACTERS ==========
  const renderActiveCharacters = () => {
    const activeCount = getActiveCharactersCount(activeCharacters)
    const allActiveChars = getAllActiveCharacters(activeCharacters)

    // If no active characters, show empty state
    if (!hasActiveCharacters(activeCharacters)) {
      return (
        <div className="dungeon-active-characters">
          <h4>Almas Elegidas (0/6)</h4>
          <div className="no-active-characters">
            <p>No hay almas elegidas activas</p>
            <small>Ve a tu biblioteca para elegir almas para la aventura</small>
          </div>
        </div>
      )
    }

    return (
      <div className="dungeon-active-characters">
        <h4>Almas Elegidas ({activeCount}/3)</h4>
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
    <div className="dungeon-container">

      {/* ========== STAIRS MODAL ========== */}
      {renderStairsModal()}

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

      {/* Dungeon difficulty badge */}
      <div style={{
        textAlign: 'center',
        padding: '5px',
        backgroundColor: '#333',
        borderRadius: '5px',
        margin: '10px 0'
      }}>
        <small>Dificultad: <strong>{currentDungeon.difficulty}</strong></small>
      </div>

      {/* ========== COMBAT STATUS INDICATOR ========== */}
      {inCombat && (
        <div className="combat-status" style={{
          backgroundColor: '#ff4444',
          color: 'white',
          padding: '10px',
          borderRadius: '5px',
          margin: '10px 0',
          textAlign: 'center'
        }}>
          ⚔️ EN COMBATE - Movimiento deshabilitado
          <br />
          <small>Presiona 'R' para reset manual si hay errores</small>
        </div>
      )}

      {/* ========== STAIRS INDICATOR ========== */}
      {isOnStairs && !inCombat && (
        <div className="stairs-status" style={{
          backgroundColor: '#4CAF50',
          color: 'white',
          padding: '15px',
          borderRadius: '5px',
          margin: '10px 0',
          textAlign: 'center',
          fontSize: '1.1em',
          fontWeight: 'bold',
          animation: 'pulse 2s infinite'
        }}>
          🏰 ¡Escaleras encontradas!
          <br />
          <small style={{ fontSize: '0.9em' }}>Presiona ENTER o el botón 🏰 para subir de nivel</small>
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

      {/* ========== ACTIVE CHARACTERS DISPLAY ========== */}
      {renderActiveCharacters()}

      {/* ========== GAME INSTRUCTIONS ========== */}
      <div className="dungeon-instructions">
        <p>⚔️ {currentDungeon.description}</p>
        <p>🎯 Usa las flechas del teclado o los botones táctiles</p>
        <p>👹 Tasa de encuentros: {(encounterRate * 100).toFixed(0)}%</p>
        <p>🏰 Busca las escaleras ⇧ y presiona ENTER o el botón para subir</p>
        <p>💰 Gana monedas al derrotar enemigos</p>
        <p>¡Cuidado! Pierdes monedas si eres derrotado</p>
        {inCombat && (
          <p style={{ color: '#ff4444', fontWeight: 'bold' }}>
            ⚠️ Combate en curso - Movimiento bloqueado
          </p>
        )}
        {isOnStairs && !inCombat && (
          <p style={{ color: '#4CAF50', fontWeight: 'bold' }}>
            🏰 ¡Estás en las escaleras! Presiona ENTER o el botón 🏰 para avanzar
          </p>
        )}
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
          <div className="floating-controls-row" style={{ marginTop: '10px' }}>
            <button
              className="floating-button stairs-button"
              onClick={handleStairsInteraction}
              style={{
                backgroundColor: '#4CAF50',
                fontSize: '1.5em',
                padding: '15px 25px',
                animation: 'pulse 2s infinite'
              }}
            >
              🏰 SUBIR
            </button>
          </div>
        )}
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
          <div className="touch-row" style={{ marginTop: '10px' }}>
            <button
              className="touch-button stairs-button"
              onClick={handleStairsInteraction}
              style={{
                backgroundColor: '#4CAF50',
                fontSize: '1.2em',
                padding: '15px 30px',
                gridColumn: '1 / -1',
                animation: 'pulse 2s infinite'
              }}
            >
              🏰 SUBIR ESCALERAS
            </button>
          </div>
        )}
      </div>

      {/* ========== DUNGEON STATISTICS ========== */}
      <div className="dungeon-stats">
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
          <span className="stat-value" style={{ color: inCombat ? '#ff4444' : '#4CAF50' }}>
            {inCombat ? '⚔️ En Combate' : '🌍 Explorando'}
          </span>
        </div>
        <div className="stat-item">
          <span className="stat-label">Mazmorra:</span>
          <span className="stat-value">{currentDungeon.name}</span>
        </div>
      </div>
    </div>
  )
}

export default Dungeon