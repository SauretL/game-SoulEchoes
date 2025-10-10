import React, { useState, useEffect } from 'react'
import './Dungeon.css'

const Dungeon = ({
  onBack,
  onCoinEarned,
  playerCoins,
  dungeonCharacter,
  onCharacterClick,
  onStartCombat,
  enemies
}) => {
  // ========== STATE MANAGEMENT ==========
  const [playerPos, setPlayerPos] = useState({ x: 1, y: 1 })
  const [coinsCollected, setCoinsCollected] = useState(0)
  const [pendingCoins, setPendingCoins] = useState(0)

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
      // Usar setTimeout para deferir la actualización del estado padre
      const timer = setTimeout(() => {
        onCoinEarned(pendingCoins)
        setCoinsCollected(prev => prev + pendingCoins)
        setPendingCoins(0)
      }, 0)

      return () => clearTimeout(timer)
    }
  }, [pendingCoins, onCoinEarned])

  // ========== PLAYER MOVEMENT LOGIC ==========
  const movePlayer = (direction) => {
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
          const randomEnemy = enemies[Math.floor(Math.random() * enemies.length)]
          onStartCombat(randomEnemy)
        }

        return { x: newX, y: newY }
      }
      return prev
    })
  }

  // ========== KEYBOARD CONTROLS ==========
  useEffect(() => {
    const handleKeyPress = (e) => {
      switch (e.key) {
        case 'ArrowUp': movePlayer('up'); break
        case 'ArrowDown': movePlayer('down'); break
        case 'ArrowLeft': movePlayer('left'); break
        case 'ArrowRight': movePlayer('right'); break
        case 'w': case 'W': movePlayer('up'); break
        case 's': case 'S': movePlayer('down'); break
        case 'a': case 'A': movePlayer('left'); break
        case 'd': case 'D': movePlayer('right'); break
        default: return
      }
    }

    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [movePlayer])

  // ========== DUNGEON RESET FUNCTION ==========
  const resetDungeon = () => {
    setPlayerPos({ x: 1, y: 1 })
    setCoinsCollected(0)
    setPendingCoins(0)
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

      {/* ========== NAVIGATION BUTTONS ========== */}
      <div className="dungeon-navigation">
        <button onClick={onBack} className="nav-button back-button">
          ← Volver al Gacha
        </button>
        <button onClick={resetDungeon} className="nav-button refresh-button">
          🔄 Reiniciar
        </button>
      </div>

      {/* ========== GAME INSTRUCTIONS ========== */}
      <div className="dungeon-instructions">
        <p>⚔️ Explora la mazmorra y encuentra tesoros</p>
        <p>🎯 Usa las flechas del teclado o los botones táctiles</p>
        <p>💰 Gana monedas mientras exploras</p>
        <p>👹 Enfréntate a enemigos aleatorios</p>
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
          >
            ↑
          </button>
        </div>
        <div className="touch-row">
          <button
            className="touch-button left-button"
            onClick={() => movePlayer('left')}
          >
            ←
          </button>
          <button
            className="touch-button down-button"
            onClick={() => movePlayer('down')}
          >
            ↓
          </button>
          <button
            className="touch-button right-button"
            onClick={() => movePlayer('right')}
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
      </div>

      {/* ========== CHARACTER CARD SIDEBAR ========== */}
      {dungeonCharacter && (
        <div
          className="dungeon-character-card"
          onClick={() => onCharacterClick(dungeonCharacter)}
          style={{ cursor: 'pointer' }}
        >
          <div className={`dungeon-character-header rarity-${dungeonCharacter.rarityTier}`}>
            <h4>{dungeonCharacter.name}</h4>
            <span className="dungeon-duplicates">x{dungeonCharacter.duplicates}</span>
          </div>
          <div className="dungeon-character-image">
            <img src={dungeonCharacter.images?.[0]} alt={dungeonCharacter.name} />
          </div>
          <div className="dungeon-character-info">
            <p>
              <b>Rareza:</b>
              <span className={`rarity-${dungeonCharacter.rarityTier}-text`}>
                {dungeonCharacter.rarity}
              </span>
            </p>
            <p><b>Clase:</b> {dungeonCharacter.class}</p>
            <p><b>Fragmento:</b> {dungeonCharacter.fragment}</p>
          </div>
          <div className="dungeon-character-indicator">
            {dungeonCharacter.rarityTier === 3 ? '★3★' :
              dungeonCharacter.rarityTier === 2 ? '✦2✦' : '•1•'}
          </div>
        </div>
      )}
    </div>
  )
}

export default Dungeon