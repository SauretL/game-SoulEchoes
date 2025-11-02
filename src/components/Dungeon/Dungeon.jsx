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
  generateRandomEnemyParty,
  isBossDungeon,
  getBossEncounter,
  handleBossDefeat as handleBossDefeatLogic,
  isBossDefeated
} from '../../utils/dungeonLogic'
import {
  getDefaultDungeon,
  getRandomFormationForDungeon,
  getDungeonById,
  getNextDungeonId,
  getAvailableDungeons
} from '../../utils/dungeonMaps'

// ========== DUNGEON STATE MANAGEMENT ==========
const initializeDungeonState = () => {
  const currentDungeon = getDefaultDungeon();
  return {
    currentDungeon,
    ...getInitialDungeonState(currentDungeon.startPos),
    isOnStairs: false,
    isOnBossCell: false,
    bossDefeated: false,
    defeatedBosses: []
  };
};

const resetDungeonComplete = () => {
  const firstDungeon = getDefaultDungeon();
  return {
    currentDungeon: firstDungeon,
    ...getInitialDungeonState(firstDungeon.startPos),
    isOnStairs: false,
    isOnBossCell: false,
    bossDefeated: false,
    defeatedBosses: []
  };
};

const advanceToNextDungeon = (currentDungeonId, defeatedBosses = []) => {
  const nextDungeonId = getNextDungeonId(currentDungeonId);
  if (!nextDungeonId) return null;

  const nextDungeon = getDungeonById(nextDungeonId);
  return {
    currentDungeon: nextDungeon,
    playerPos: nextDungeon.startPos,
    isOnStairs: false,
    isOnBossCell: false,
    bossDefeated: false,
    defeatedBosses
  };
};

const getStairsModalContent = (currentDungeonId, bossDefeated) => {
  const nextDungeonId = getNextDungeonId(currentDungeonId);
  const canAdvance = !!nextDungeonId && bossDefeated;

  if (!canAdvance && !bossDefeated) {
    return {
      message: '¡Debes derrotar al jefe de esta mazmorra antes de usar las escaleras!',
      canAdvance: false
    };
  }

  if (!canAdvance) {
    return {
      message: '¡Has llegado a la cima de la torre! Esta es la mazmorra final.',
      canAdvance: false
    };
  }

  const nextDungeon = getDungeonById(nextDungeonId);
  return {
    message: `¡Has encontrado las escaleras al ${nextDungeon.name}!`,
    canAdvance: true,
    nextDungeon
  };
};

// ========== INTERACTION HANDLERS ==========
const handleBossInteractionLogic = (currentDungeonId, enemies, getRandomFormationForDungeon, onStartCombat) => {
  console.log(`👑 INICIANDO ENCUENTRO JEFE - Comenzando combate contra jefe`);

  const bossParty = generateRandomEnemyParty(
    currentDungeonId,
    enemies,
    getRandomFormationForDungeon
  );

  onStartCombat(bossParty);
  return true;
};

const handleStairsInteractionLogic = (currentDungeonId, bossDefeated, setCurrentDungeon, setPlayerPos, setDungeonState) => {
  const dungeon = getDungeonById(currentDungeonId);

  if (dungeon.isBossLevel && !bossDefeated) {
    return {
      showModal: true,
      message: '¡Debes derrotar al jefe de esta mazmorra antes de usar las escaleras!'
    };
  }

  const nextDungeonId = getNextDungeonId(currentDungeonId);
  if (!nextDungeonId) {
    return {
      showModal: true,
      message: '¡Has llegado a la cima de la torre! Esta es la mazmorra final.'
    };
  }

  const nextDungeon = getDungeonById(nextDungeonId);
  setCurrentDungeon(nextDungeon);
  setPlayerPos(nextDungeon.startPos);

  const newState = getInitialDungeonState(nextDungeon.startPos);
  setDungeonState(newState);

  console.log(`🏰 Cambiado a mazmorra: ${nextDungeon.name}`);
  return { showModal: false };
};

const handleDungeonKeyPress = (e, {
  inCombat,
  manualCombatReset,
  isOnStairs,
  handleStairsInteraction,
  isOnBossCell,
  handleBossInteraction,
  bossDefeated,
  movePlayer
}) => {
  const gameKeys = ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'r', 'R', 'Enter', ' '];
  if (gameKeys.includes(e.key)) {
    e.preventDefault();
  }

  if (isResetKey(e.key)) {
    manualCombatReset();
    return;
  }

  if ((e.key === 'Enter' || e.key === ' ') && isOnStairs && !inCombat) {
    handleStairsInteraction();
    return;
  }

  if ((e.key === 'Enter' || e.key === ' ') && isOnBossCell && !inCombat && !bossDefeated) {
    handleBossInteraction();
    return;
  }

  if (!isMovementAllowed(inCombat)) {
    return;
  }

  const direction = getDirectionFromKey(e.key);
  if (direction) {
    movePlayer(direction);
  }
};

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
  playerMaxHp,
  onBossDefeat
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
  const [isOnBossCell, setIsOnBossCell] = useState(false)
  const [bossDefeated, setBossDefeated] = useState(false)
  const [defeatedBosses, setDefeatedBosses] = useState([])
  const [showDungeonSelect, setShowDungeonSelect] = useState(false)

  // ========== MOBILE MODALS ==========
  const [showCharactersModal, setShowCharactersModal] = useState(false)
  const [showInstructionsModal, setShowInstructionsModal] = useState(false)

  // ========== BOSS DUNGEON CHECK ==========
  const isBossLevel = isBossDungeon(currentDungeon)

  // ========== AVAILABLE DUNGEONS ==========
  const availableDungeons = getAvailableDungeons(defeatedBosses);

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

  // ========== RESET BOSS STATE ON DUNGEON CHANGE ==========
  useEffect(() => {
    setBossDefeated(false)
    setIsOnBossCell(false)
  }, [currentDungeon.id])

  // ========== BOSS DEFEAT EFFECT ==========
  useEffect(() => {
    if (bossDefeated && currentDungeon.isBossLevel) {
      console.log(`🎉 JEFE DERROTADO - Registrando victoria sobre jefe del piso ${currentDungeon.id}`);
      setDefeatedBosses(prev => {
        const updated = [...new Set([...prev, currentDungeon.id])];
        console.log(`📊 JEFES DERROTADOS ACTUALIZADOS:`, updated);
        return updated;
      });
      if (onBossDefeat) {
        onBossDefeat(currentDungeon.id);
      }
    }
  }, [bossDefeated, currentDungeon.id, currentDungeon.isBossLevel, onBossDefeat])

  // ========== PLAYER MOVEMENT LOGIC ==========
  const movePlayer = useCallback((direction) => {
    if (!isMovementAllowed(inCombat)) {
      return
    }

    const movementResult = executePlayerMovement(
      playerPos,
      direction,
      map,
      currentDungeon.id,
      encounterRate
    )

    if (movementResult.moved) {
      setPlayerPos(movementResult.newPosition)

      if (movementResult.levelUp) {
        setIsOnStairs(true)
        setIsOnBossCell(false)
        return
      } else {
        setIsOnStairs(false)
      }

      if (movementResult.bossTriggered && !bossDefeated && isBossLevel) {
        setIsOnBossCell(true)
        return
      } else {
        setIsOnBossCell(false)
      }

      if (movementResult.combatTriggered && !movementResult.bossTriggered) {
        const enemyParty = generateRandomEnemyParty(
          currentDungeon.id,
          enemies,
          getRandomFormationForDungeon
        )
        onStartCombat(enemyParty)
      }
    }
  }, [inCombat, enemies, playerPos, map, onStartCombat, encounterRate, currentDungeon.id, isBossLevel, bossDefeated])

  // ========== BOSS ENCOUNTER HANDLER ==========
  const handleBossInteraction = useCallback(() => {
    if (bossDefeated) {
      console.log(`⚠️ JEFE YA DERROTADO - El jefe ya fue vencido`)
      return
    }

    const success = handleBossInteractionLogic(
      currentDungeon.id,
      enemies,
      getRandomFormationForDungeon,
      onStartCombat
    )

    if (success) setIsOnBossCell(false)
  }, [bossDefeated, currentDungeon.id, enemies, onStartCombat])

  // ========== STAIRS INTERACTION LOGIC ==========
  const handleStairsInteraction = useCallback(() => {
    if (currentDungeon.isBossLevel && !bossDefeated) {
      setStairsMessage('¡Debes derrotar al jefe de esta mazmorra antes de usar las escaleras!');
      setShowStairsModal(true);
      return;
    }

    const nextDungeonId = getNextDungeonId(currentDungeon.id);
    if (!nextDungeonId) {
      setStairsMessage('¡Has llegado a la cima de la torre! Esta es la mazmorra final.');
      setShowStairsModal(true);
      return;
    }

    const nextDungeon = getDungeonById(nextDungeonId);
    setCurrentDungeon(nextDungeon);
    setPlayerPos(nextDungeon.startPos);
    setBossDefeated(false);
    setIsOnStairs(false);
    setIsOnBossCell(false);

    console.log(`🏰 Avanzando a mazmorra: ${nextDungeon.name}`);
  }, [currentDungeon.id, currentDungeon.isBossLevel, bossDefeated])

  // ========== DUNGEON SELECTION HANDLER ==========
  const handleDungeonSelect = (dungeonId) => {
    const selectedDungeon = getDungeonById(dungeonId);
    if (selectedDungeon && availableDungeons.some(d => d.id === dungeonId)) {
      setCurrentDungeon(selectedDungeon);
      setPlayerPos(selectedDungeon.startPos);
      setBossDefeated(false);
      setIsOnStairs(false);
      setIsOnBossCell(false);
      setShowDungeonSelect(false);
      console.log(`🏰 CAMBIO DIRECTO A MAZMORRA: ${selectedDungeon.name}`);
    }
  };

  // ========== MANUAL COMBAT RESET ==========
  const manualCombatReset = useCallback(() => {
    if (typeof onResetDungeon === 'function') {
      onResetDungeon()
    }
  }, [onResetDungeon])

  // ========== KEYBOARD CONTROLS ==========
  useEffect(() => {
    const handleKeyPress = (e) => {
      handleDungeonKeyPress(e, {
        inCombat,
        manualCombatReset,
        isOnStairs,
        handleStairsInteraction,
        isOnBossCell,
        handleBossInteraction,
        bossDefeated,
        movePlayer
      })
    }

    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [movePlayer, inCombat, manualCombatReset, isOnStairs, handleStairsInteraction, isOnBossCell, handleBossInteraction, bossDefeated])

  // ========== PREVENT SCROLL EFFECT ==========
  useEffect(() => {
    document.body.classList.add('dungeon-active');
    const container = document.querySelector('.dungeon-container');
    if (container) {
      container.focus({ preventScroll: true });
    }

    return () => {
      document.body.classList.remove('dungeon-active');
    };
  }, []);

  // ========== RENDER ACTIVE CHARACTERS ==========
  const renderActiveCharacters = () => {
    const activeCount = getActiveCharactersCount(activeCharacters)
    const allActiveChars = getAllActiveCharacters(activeCharacters)

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
        <h4>Almas Elegidas ({activeCount}/3)</h4>
        <div className="active-charaters-grid">
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
              <p><strong>Jefes:</strong> En el último piso de cada dificultad</p>
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
              {isOnBossCell && !inCombat && !bossDefeated && (
                <p className="boss-warning">
                  👑 <strong>¡En casillero de Jefe!</strong> Presiona ENTER
                </p>
              )}
              {isBossLevel && !bossDefeated && (
                <p className="boss-warning">
                  👑 <strong>¡Piso de Jefe!</strong> Encuentra y derrota al jefe
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
              {isBossLevel && (
                <div className="stat-item">
                  <span className="stat-label">Jefe:</span>
                  <span className={`stat-value ${bossDefeated ? 'defeated' : 'active'}`}>
                    {bossDefeated ? '✅ Derrotado' : '👑 Activo'}
                  </span>
                </div>
              )}
              <div className="stat-item">
                <span className="stat-label">Jefes Derrotados:</span>
                <span className="stat-value">{defeatedBosses.length}/3</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // ========== RENDER DUNGEON SELECTION MODAL ==========
  const renderDungeonSelectModal = () => {
    if (!showDungeonSelect) return null;

    return (
      <div className="stairs-modal-overlay">
        <div className="stairs-modal large-modal">
          <h3>🏰 Seleccionar Mazmorra</h3>
          <p>Elige a qué mazmorra viajar (solo mazmorras disponibles):</p>

          <div className="dungeon-select-grid">
            {availableDungeons.map(dungeon => (
              <button
                key={dungeon.id}
                className={`dungeon-select-btn ${currentDungeon.id === dungeon.id ? 'active' : ''}`}
                onClick={() => handleDungeonSelect(dungeon.id)}
              >
                <div className="dungeon-select-name">{dungeon.name}</div>
                <div className="dungeon-select-difficulty">{dungeon.difficulty}</div>
                {dungeon.isBossLevel && <div className="boss-indicator">👑 JEFE</div>}
                {defeatedBosses.includes(dungeon.id) && <div className="defeated-indicator">✅ VENCIDO</div>}
              </button>
            ))}
          </div>

          <div className="modal-actions">
            <button
              className="cancel-button"
              onClick={() => setShowDungeonSelect(false)}
            >
              ↩️ Cancelar
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ========== RENDER STAIRS MODAL ==========
  const renderStairsModal = () => {
    if (!showStairsModal) return null

    const canAdvance = !currentDungeon.isBossLevel || (currentDungeon.isBossLevel && bossDefeated);

    return (
      <div className="stairs-modal-overlay">
        <div className="stairs-modal">
          <h3>¡Escaleras Encontradas! 🏰</h3>
          <p>{stairsMessage}</p>

          <div className="modal-actions">
            <button
              className="confirm-button"
              onClick={() => setShowStairsModal(false)}
            >
              {canAdvance ? '🏰 Avanzar' : 'Entendido'}
            </button>
            {canAdvance && (
              <button
                className="cancel-button"
                onClick={() => setShowStairsModal(false)}
              >
                ↩️ Seguir Explorando
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

    const newState = resetDungeonComplete()
    setCurrentDungeon(newState.currentDungeon)
    setPlayerPos(newState.playerPos)
    setCoinsCollected(newState.coinsCollected)
    setPendingCoins(newState.pendingCoins)
    setCombatTriggered(newState.combatTriggered)
    setIsOnStairs(newState.isOnStairs)
    setIsOnBossCell(newState.isOnBossCell)
    setBossDefeated(newState.bossDefeated)
    // Note: defeatedBosses are preserved on reset

    console.log(`🔄 PLAYER POSITION RESET - Nueva posición: (${newState.playerPos.x}, ${newState.playerPos.y})`)

    if (activeCharacters) {
      console.log(`🔄 CHARACTER HP RESET - Reiniciando HP de ${getActiveCharactersCount(activeCharacters)} personajes`)
      const hpResets = resetAllCharactersHP(activeCharacters, playerMaxHp)
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
      {renderDungeonSelectModal()}
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
          <div className="defeated-bosses-display">
            <span>Jefes: {defeatedBosses.length}/3</span>
          </div>
        </div>
      </div>

      {/* ========== BOSS INDICATOR ========== */}
      {isBossLevel && (
        <div className="boss-level-indicator">
          👑 <strong>PISO DE JEFE</strong> 👑
          <br />
          <small>Encuentra y derrota al jefe para avanzar</small>
          {bossDefeated && (
            <div className="boss-defeated-message">
              ✅ <strong>¡Jefe Derrotado!</strong> Puedes usar las escaleras
            </div>
          )}
        </div>
      )}

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
            {isBossLevel && <span className="boss-badge">👑 JEFE</span>}
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
              <small>
                {currentDungeon.isBossLevel && !bossDefeated
                  ? 'Derrota al jefe primero para usar las escaleras'
                  : 'Presiona ENTER o el botón 🏰 para subir de nivel'
                }
              </small>
            </div>
          )}

          {/* ========== BOSS CELL INDICATOR ========== */}
          {isOnBossCell && !inCombat && !bossDefeated && (
            <div className="boss-status">
              👑 ¡Encuentro con el Jefe!
              <br />
              <small>Presiona ENTER o el botón 👑 para comenzar el combate</small>
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
            <button
              onClick={() => setShowDungeonSelect(true)}
              className="nav-button travel-button"
              title="Viajar a mazmorras disponibles"
            >
              🏰 Viajar a Otra Mazmorra
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
                                            ${cell === 3 ? 'boss' : ''}
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
            {isBossLevel && !bossDefeated && (
              <div className="legend-item">
                <span className="legend-symbol">👑</span>
                <span className="legend-text">Jefe</span>
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
            {isOnStairs && !inCombat && (!currentDungeon.isBossLevel || bossDefeated) && (
              <div className="touch-row stairs-row">
                <button
                  className="touch-button stairs-button"
                  onClick={handleStairsInteraction}
                >
                  🏰 SUBIR ESCALERAS
                </button>
              </div>
            )}
            {isOnBossCell && !inCombat && !bossDefeated && (
              <div className="touch-row boss-row">
                <button
                  className="touch-button boss-button"
                  onClick={handleBossInteraction}
                >
                  👑 ENFRENTAR JEFE
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
            <p><strong>Jefes:</strong> En el último piso de cada dificultad</p>
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
            {isOnBossCell && !inCombat && !bossDefeated && (
              <p className="boss-warning">
                👑 <strong>¡En casillero de Jefe!</strong> Presiona ENTER
              </p>
            )}
            {isBossLevel && !bossDefeated && (
              <p className="boss-warning">
                👑 <strong>¡Piso de Jefe!</strong> Encuentra y derrota al jefe
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
            {isBossLevel && (
              <div className="stat-item">
                <span className="stat-label">Jefe:</span>
                <span className={`stat-value ${bossDefeated ? 'defeated' : 'active'}`}>
                  {bossDefeated ? '✅ Derrotado' : '👑 Activo'}
                </span>
              </div>
            )}
            <div className="stat-item">
              <span className="stat-label">Jefes Derrotados:</span>
              <span className="stat-value">{defeatedBosses.length}/3</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Mazmorras Disponibles:</span>
              <span className="stat-value">{availableDungeons.length}/6</span>
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
            <button
              className="quick-action-btn"
              onClick={() => setShowDungeonSelect(true)}
              title="Viajar a mazmorras disponibles"
            >
              🏰 Viajar
            </button>
            {isOnStairs && !inCombat && (!currentDungeon.isBossLevel || bossDefeated) && (
              <button
                className="quick-action-btn stairs-btn"
                onClick={handleStairsInteraction}
                title="Subir al siguiente nivel"
              >
                🏰 Subir Nivel
              </button>
            )}
            {isOnBossCell && !inCombat && !bossDefeated && (
              <button
                className="quick-action-btn boss-btn"
                onClick={handleBossInteraction}
                title="Enfrentar al jefe"
              >
                👑 Enfrentar Jefe
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
        {isOnStairs && !inCombat && (!currentDungeon.isBossLevel || bossDefeated) && (
          <div className="floating-controls-row">
            <button
              className="floating-button stairs-button"
              onClick={handleStairsInteraction}
            >
              🏰 SUBIR
            </button>
          </div>
        )}
        {isOnBossCell && !inCombat && !bossDefeated && (
          <div className="floating-controls-row">
            <button
              className="floating-button boss-button"
              onClick={handleBossInteraction}
            >
              👑 JEFE
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
        <button
          className="mobile-info-btn travel-btn"
          onClick={() => setShowDungeonSelect(true)}
        >
          🏰 Viajar
        </button>
      </div>
    </div>
  )
}

export default Dungeon