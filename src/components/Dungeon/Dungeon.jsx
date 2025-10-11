import React, { useState, useEffect, useCallback } from 'react'
import './Dungeon.css'

const Dungeon = ({
  onBack,
  onCoinEarned,
  playerCoins,
  activeCharacters,
  onCharacterClick,
  onStartCombat,
  enemies,
  inCombat,
  onForceEndCombat,
  playerCharactersHp,
  playerMaxHp
}) => {
  // ========== STATE MANAGEMENT ==========
  const [playerPos, setPlayerPos] = useState({ x: 1, y: 1 })
  const [coinsCollected, setCoinsCollected] = useState(0)
  const [pendingCoins, setPendingCoins] = useState(0)
  const [combatTriggered, setCombatTriggered] = useState(false)

  // ========== DUNGEON MAP CONFIGURATION ==========
  const map = [
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    [1, 0, 0, 1, 0, 0, 1, 1, 1, 1, 0, 0, 1],
    [1, 0, 1, 1, 0, 0, 1, 1, 1, 1, 0, 0, 1],
    [1, 0, 1, 1, 0, 1, 1, 1, 1, 1, 1, 0, 1],
    [1, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 1],
    [1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 1, 1, 1, 1, 0, 1, 1, 1, 1, 0, 1],
    [1, 0, 1, 0, 0, 0, 0, 1, 1, 1, 1, 0, 1],
    [1, 0, 1, 0, 1, 1, 1, 1, 1, 0, 0, 0, 1],
    [1, 0, 1, 0, 0, 0, 1, 1, 1, 0, 0, 0, 1],
    [1, 0, 1, 1, 1, 0, 1, 1, 1, 0, 0, 0, 1],
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]
  ]

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
      const randomEnemy = enemies[Math.floor(Math.random() * enemies.length)]
      onStartCombat(randomEnemy)
      setCombatTriggered(false)
    }
  }, [combatTriggered, enemies, onStartCombat])

  // ========== PLAYER MOVEMENT LOGIC ==========
  const movePlayer = useCallback((direction) => {
    if (inCombat) {
      console.log("Movimiento bloqueado - en combate")
      return
    }

    setPlayerPos(prev => {
      let newX = prev.x
      let newY = prev.y

      // Calculate new position based on direction
      switch (direction) {
        case 'up': newY--; break
        case 'down': newY++; break
        case 'left': newX--; break
        case 'right': newX++; break
        default: return prev
      }

      // Check if new position is valid (not a wall)
      if (map[newY]?.[newX] === 0) {

        // Chance to find coins while moving (30% probability)
        if (Math.random() < 0.3) {
          const coinsFound = Math.floor(Math.random() * 5) + 1 // 1-5 coins
          setPendingCoins(coinsFound)
        }

        // Chance to encounter enemy (20% probability)
        if (Math.random() < 0.2 && enemies && enemies.length > 0) {
          // Trigger combat in useEffect to avoid setState during render
          setCombatTriggered(true)
        }

        return { x: newX, y: newY }
      }
      return prev
    })
  }, [inCombat, enemies])

  // ========== MANUAL COMBAT RESET ==========
  const manualCombatReset = useCallback(() => {
    console.log("Reset manual de combate (requested from Dungeon UI)")
    if (typeof onForceEndCombat === 'function') {
      onForceEndCombat()
    }
  }, [onForceEndCombat])

  // ========== KEYBOARD CONTROLS ==========
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (inCombat) {
        console.log("Teclado bloqueado - en combate")
        return
      }

      switch (e.key) {
        case 'ArrowUp': movePlayer('up'); break
        case 'ArrowDown': movePlayer('down'); break
        case 'ArrowLeft': movePlayer('left'); break
        case 'ArrowRight': movePlayer('right'); break
        case 'w': case 'W': movePlayer('up'); break
        case 's': case 'S': movePlayer('down'); break
        case 'a': case 'A': movePlayer('left'); break
        case 'd': case 'D': movePlayer('right'); break
        case 'r': case 'R': manualCombatReset(); break
        default: return
      }
    }

    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [movePlayer, inCombat, manualCombatReset])

  // ========== RENDER ACTIVE CHARACTERS ==========
  const renderActiveCharacters = () => {
    const allActiveChars = [...activeCharacters.front, ...activeCharacters.back].filter(char => char !== null)

    return (
      <div className="dungeon-active-characters">
        <h4>Equipo Activo</h4>
        <div className="active-characters-grid">
          {allActiveChars.map(character => (
            <div
              key={character.id}
              className="dungeon-character-card"
              onClick={() => onCharacterClick(character)}
              style={{ cursor: 'pointer' }}
            >
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
                    HP: {playerCharactersHp[character.id] || playerMaxHp}/{playerMaxHp}
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
    setPlayerPos({ x: 1, y: 1 })
    setCoinsCollected(0)
    setPendingCoins(0)
    setCombatTriggered(false)
  }

  // ========== MAP RENDERING LOGIC ==========
  const renderCell = (cell, x, y) => {
    if (x === playerPos.x && y === playerPos.y) {
      return '☻' // Player character
    }
    if (cell === 1) {
      return '█' // Wall
    }
    return '·' // Floor
  }

  // ========== RENDER COMPONENT ==========
  return (
    <div className="dungeon-container">

      {/* ========== DUNGEON HEADER ========== */}
      <div className="dungeon-header">
        <h2>Dungeon</h2>
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
          ← Volver al Gacha
        </button>
        <button onClick={resetDungeon} className="nav-button refresh-button">
          🔄 Reiniciar Dungeon
        </button>
      </div>

      {/* ========== ACTIVE CHARACTERS DISPLAY ========== */}
      {renderActiveCharacters()}

      {/* ========== GAME INSTRUCTIONS ========== */}
      <div className="dungeon-instructions">
        <p>⚔️ Explora la mazmorra y encuentra tesoros</p>
        <p>🎯 Usa las flechas del teclado o los botones táctiles</p>
        <p>💰 Gana monedas mientras exploras</p>
        <p>👹 Enfréntate a enemigos aleatorios</p>
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
                  {renderCell(cell, x, y)}
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