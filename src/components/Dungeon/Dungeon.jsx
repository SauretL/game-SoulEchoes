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
import { getDefaultDungeon, getRandomFormationForDungeon } from '../../utils/dungeonMaps'

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
  const currentDungeon = getDefaultDungeon()
  const map = currentDungeon.map
  const startPosition = currentDungeon.startPos
  const encounterRate = currentDungeon.encounterRate

  console.log(`🔍 DUNGEON COMPONENT - Inicializando mazmorra: ${currentDungeon.name}`)
  console.log(`🔍 DUNGEON CONFIG - ID: ${currentDungeon.id}, Dificultad: ${currentDungeon.difficulty}, Tasa encuentros: ${encounterRate}`)
  console.log(`🔍 ENEMIES PROP RECEIVED - Enemigos disponibles: ${enemies?.length || 0} tipos`)

  if (enemies && enemies.length > 0) {
    console.log(`🔍 AVAILABLE ENEMY TYPES - Lista de enemigos cargados:`)
    enemies.forEach((enemy, index) => {
      console.log(`🔍 ENEMY TYPE [${index}] - ID: ${enemy.id}, Name: ${enemy.name}, HP: ${enemy.maxHp}, Stats: FIS_ATQ=${enemy.physicalAttack}, PSI_ATQ=${enemy.psychicAttack}`)
    })
  }

  // ========== STATE MANAGEMENT ==========
  // Use dungeon's start position
  const initialState = getInitialDungeonState(startPosition)

  const [playerPos, setPlayerPos] = useState(initialState.playerPos)
  const [coinsCollected, setCoinsCollected] = useState(initialState.coinsCollected)
  const [pendingCoins, setPendingCoins] = useState(initialState.pendingCoins)
  const [combatTriggered, setCombatTriggered] = useState(initialState.combatTriggered)

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
      console.log(`🔍 COMBAT TRIGGERED EFFECT - Combate activado, procesando...`)
      setCombatTriggered(false)
    }
  }, [combatTriggered, enemies])

  // ========== PLAYER MOVEMENT LOGIC ==========
  const movePlayer = useCallback((direction) => {
    console.log(`🔍 PLAYER MOVEMENT - Intento de movimiento: ${direction}`)

    // Check if movement is allowed
    if (!isMovementAllowed(inCombat)) {
      console.log("🔍 MOVEMENT BLOCKED - Movimiento bloqueado - en combate")
      return
    }

    console.log(`🔍 MOVEMENT ALLOWED - Movimiento permitido, ejecutando...`)

    // Execute movement (no longer needs enemies parameter)
    const movementResult = executePlayerMovement(
      playerPos,
      direction,
      map,
      encounterRate
    )

    // If movement was successful, update position
    if (movementResult.moved) {
      console.log(`🔍 MOVEMENT SUCCESS - Jugador se movió a (${movementResult.newPosition.x}, ${movementResult.newPosition.y})`)
      setPlayerPos(movementResult.newPosition)

      // If combat was triggered, generate enemy party and start combat
      if (movementResult.combatTriggered) {
        console.log(`🔍 COMBAT ENCOUNTER - ¡Encuentro de combate activado!`)
        console.log(`🔍 GENERATING ENEMY PARTY - Generando grupo enemigo para dungeon: ${currentDungeon.id}`)

        // Generate random enemy party based on current dungeon
        const enemyParty = generateRandomEnemyParty(
          currentDungeon.id,
          enemies,
          getRandomFormationForDungeon
        )

        console.log(`🔍 ENEMY PARTY GENERATED - Grupo enemigo creado con ${enemyParty.length} enemigos:`)
        enemyParty.forEach((enemy, index) => {
          console.log(`🔍 PARTY ENEMY [${index}] - ${enemy.name} (ID: ${enemy.id}), Posición: ${enemy.position}, Slot: ${enemy.slot}, HP: ${enemy.currentHp}/${enemy.maxHp}`)
        })

        // Start combat with the generated party
        console.log(`🔍 STARTING COMBAT - Iniciando combate con grupo enemigo`)
        onStartCombat(enemyParty)
      } else {
        console.log(`🔍 NO COMBAT - Movimiento sin encuentro de combate`)
      }
    } else {
      console.log(`🔍 MOVEMENT FAILED - Movimiento bloqueado por pared o límite`)
    }
  }, [inCombat, enemies, playerPos, map, onStartCombat, encounterRate, currentDungeon.id])

  // ========== MANUAL COMBAT RESET ==========
  const manualCombatReset = useCallback(() => {
    console.log(`🔍 MANUAL COMBAT RESET - Reset manual activado`)
    if (typeof onResetDungeon === 'function') {
      onResetDungeon()
    }
  }, [onResetDungeon])

  // ========== KEYBOARD CONTROLS ==========
  useEffect(() => {
    const handleKeyPress = (e) => {
      // Check for reset key
      if (isResetKey(e.key)) {
        console.log(`🔍 KEYBOARD RESET - Tecla R presionada para reset`)
        manualCombatReset()
        return
      }

      // Check if movement is allowed
      if (!isMovementAllowed(inCombat)) {
        console.log("🔍 KEYBOARD BLOCKED - Teclado bloqueado - en combate")
        return
      }

      // Get direction from key
      const direction = getDirectionFromKey(e.key)
      if (direction) {
        console.log(`🔍 KEYBOARD MOVEMENT - Tecla detectada: ${e.key} -> Dirección: ${direction}`)
        movePlayer(direction)
      }
    }

    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [movePlayer, inCombat, manualCombatReset])

  // ========== RENDER ACTIVE CHARACTERS ==========
  const renderActiveCharacters = () => {
    const activeCount = getActiveCharactersCount(activeCharacters)
    const allActiveChars = getAllActiveCharacters(activeCharacters)

    console.log(`🔍 RENDER ACTIVE CHARACTERS - ${activeCount} personajes activos`)

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

  // ========== DUNGEON RESET FUNCTION ==========
  const resetDungeon = () => {
    console.log(`🔍 DUNGEON RESET - Reiniciando mazmorra completa`)

    // MODIFIED: Use dungeon's start position for reset
    const newState = resetDungeonState(startPosition)
    setPlayerPos(newState.playerPos)
    setCoinsCollected(newState.coinsCollected)
    setPendingCoins(newState.pendingCoins)
    setCombatTriggered(newState.combatTriggered)

    console.log(`🔍 PLAYER POSITION RESET - Nueva posición: (${newState.playerPos.x}, ${newState.playerPos.y})`)

    // Reset all character HP using logic function
    if (activeCharacters) {
      console.log(`🔍 CHARACTER HP RESET - Reiniciando HP de ${getActiveCharactersCount(activeCharacters)} personajes`)
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

      {/* ========== DUNGEON HEADER ========== */}
      <div className="dungeon-header">
        {/* Show dungeon name */}
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
        <p>💰 Gana monedas al derrotar enemigos</p>
        <p>¡Cuidado! Pierdes monedas si eres derrotado</p>
        {inCombat && (
          <p style={{ color: '#ff4444', fontWeight: 'bold' }}>
            ⚠️ Combate en curso - Movimiento bloqueado
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
      </div>
    </div>
  )
}

export default Dungeon