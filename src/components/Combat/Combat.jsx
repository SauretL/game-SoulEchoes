import React, { useState, useEffect } from 'react'
import './Combat.css'
import {
    performAttack, enemyAI, checkBattleEnd, getBattleReward, getBattlePenalty
} from '../../utils/combatLogic'

const Combat = ({
    activeCharacters,
    enemy,
    onCombatEnd,
    onCoinUpdate,
    onResetDungeon,
    playerCharactersHp,
    playerMaxHp,
    onCharacterHpChange,
    onResetCharacterHp
}) => {
    // ========== STATE MANAGEMENT ==========
    const [combatState, setCombatState] = useState({
        playerCharacters: activeCharacters.front.concat(activeCharacters.back).filter(char => char !== null).map(char => ({
            ...char,
            currentHp: playerCharactersHp[char.id] || playerMaxHp,
            maxHp: playerMaxHp,
            physicalAttack: 12,
            psychicAttack: 10,
            physicalDefense: 8,
            psychicDefense: 6
        })),
        enemy: {
            ...enemy,
            currentHp: enemy.maxHp || 80
        },
        currentTurn: 'player',
        currentPlayerTurnIndex: 0,
        battleLog: [],
        battleStatus: 'ongoing'
    })

    // ========== COMBAT POSITION STATE ==========
    const [combatPositions, setCombatPositions] = useState({
        front: [null, null, null],
        back: [null, null, null]
    })

    // ========== POSITION SELECTION STATE ==========
    const [selectedSlot, setSelectedSlot] = useState(null)

    // ========== INITIALIZE COMBAT POSITIONS ==========
    useEffect(() => {
        // Set initial positions from active characters
        setCombatPositions(activeCharacters)
    }, [activeCharacters])

    // ========== BATTLE LOG MANAGEMENT ==========
    const addToBattleLog = (message) => {
        setCombatState(prev => ({
            ...prev,
            battleLog: [...prev.battleLog, { message, timestamp: Date.now() }]
        }))
    }

    // ========== GET CURRENT PLAYER TURN ==========
    const getCurrentPlayerTurn = () => {
        return combatState.playerCharacters[combatState.currentPlayerTurnIndex]
    }

    // ========== GET ALIVE PLAYERS COUNT ==========
    const getAlivePlayersCount = () => {
        return combatState.playerCharacters.filter(char => char.currentHp > 0).length
    }

    // ========== POSITION SWAPPING IN COMBAT ==========
    const swapCombatPosition = (fromPosition, fromSlot, toPosition, toSlot) => {
        if (combatPositions[toPosition][toSlot]) return // Target slot occupied

        setCombatPositions(prev => {
            const newPositions = { ...prev }
            const movingCharacter = newPositions[fromPosition][fromSlot]

            newPositions[fromPosition][fromSlot] = null
            newPositions[toPosition][toSlot] = movingCharacter

            return newPositions
        })

        addToBattleLog(`${movingCharacter.name} se movió a ${toPosition === 'front' ? 'delantera' : 'trasera'} posición ${toSlot + 1}`)
    }

    // ========== SLOT CLICK HANDLER ==========
    const handleSlotClick = (position, slot) => {
        if (!combatPositions[position][slot]) return // Can't select empty slot

        if (!selectedSlot) {
            // First selection
            setSelectedSlot({ position, slot })
            addToBattleLog(`Seleccionado ${combatPositions[position][slot].name} - elige posición destino`)
        } else {
            // Second selection - perform swap if valid
            if (selectedSlot.position !== position || selectedSlot.slot !== slot) {
                swapCombatPosition(selectedSlot.position, selectedSlot.slot, position, slot)
            }
            setSelectedSlot(null)
        }
    }

    // ========== PLAYER ACTIONS ==========
    const playerAttack = (attackType) => {
        // Validate if player can attack
        if (combatState.currentTurn !== 'player' || combatState.battleStatus !== 'ongoing') return

        const currentPlayer = getCurrentPlayerTurn()

        // Skip defeated players
        if (currentPlayer.currentHp <= 0) {
            // Move to next player
            const nextPlayerIndex = (combatState.currentPlayerTurnIndex + 1) % combatState.playerCharacters.length
            let attempts = 0

            // Find next alive player
            while (combatState.playerCharacters[nextPlayerIndex].currentHp <= 0 && attempts < combatState.playerCharacters.length) {
                nextPlayerIndex = (nextPlayerIndex + 1) % combatState.playerCharacters.length
                attempts++
            }

            if (combatState.playerCharacters[nextPlayerIndex].currentHp > 0) {
                setCombatState(prev => ({
                    ...prev,
                    currentPlayerTurnIndex: nextPlayerIndex
                }))
            } else {
                // No alive players found
                setCombatState(prev => ({
                    ...prev,
                    currentTurn: 'enemy',
                    currentPlayerTurnIndex: 0
                }))
                setTimeout(enemyTurn, 1500)
            }
            return
        }

        // Use current player stats and current enemy stats
        const result = performAttack(currentPlayer, combatState.enemy, attackType)

        // Ensure minimum 1 damage
        const actualDamage = Math.max(1, result.damage)

        // Create battle log message
        const attackName = attackType === 'physical' ? 'Ataque Físico' : 'Ataque Psíquico'
        const criticalText = result.isCritical ? ' ¡CRÍTICO!' : ''
        addToBattleLog(`${currentPlayer.name} usa ${attackName} - ${actualDamage} de daño${criticalText}`)

        // Calculate enemy HP after attack
        const updatedEnemyHp = Math.max(0, combatState.enemy.currentHp - actualDamage)

        // Check if battle ends with this attack
        const battleResult = checkBattleEnd(combatState.playerCharacters, {
            ...combatState.enemy,
            currentHp: updatedEnemyHp
        })

        if (battleResult === 'player_won') {
            endBattle('victory')
        } else {
            // Move to next player turn or enemy turn
            const nextPlayerIndex = (combatState.currentPlayerTurnIndex + 1) % combatState.playerCharacters.length
            let attempts = 0

            // Find next alive player
            while (combatState.playerCharacters[nextPlayerIndex].currentHp <= 0 && attempts < combatState.playerCharacters.length) {
                nextPlayerIndex = (nextPlayerIndex + 1) % combatState.playerCharacters.length
                attempts++
            }

            if (combatState.playerCharacters[nextPlayerIndex].currentHp > 0 && nextPlayerIndex > combatState.currentPlayerTurnIndex) {
                setCombatState(prev => ({
                    ...prev,
                    enemy: { ...prev.enemy, currentHp: updatedEnemyHp },
                    currentPlayerTurnIndex: nextPlayerIndex
                }))
            } else {
                setCombatState(prev => ({
                    ...prev,
                    enemy: { ...prev.enemy, currentHp: updatedEnemyHp },
                    currentTurn: 'enemy',
                    currentPlayerTurnIndex: 0
                }))
                setTimeout(enemyTurn, 1500) // Delay for enemy turn
            }
        }
    }

    // ========== ENEMY AI TURN ==========
    const enemyTurn = () => {
        // Validate if enemy can attack
        if (combatState.battleStatus !== 'ongoing') return

        // Select random alive player character to attack
        const alivePlayers = combatState.playerCharacters.filter(char => char.currentHp > 0)
        if (alivePlayers.length === 0) {
            endBattle('defeat')
            return
        }

        const randomPlayerIndex = Math.floor(Math.random() * alivePlayers.length)
        const targetPlayer = alivePlayers[randomPlayerIndex]

        // Enemy attacks selected player
        const result = enemyAI(combatState.enemy, targetPlayer)

        // Ensure minimum 1 damage
        const actualDamage = Math.max(1, result.damage)

        // Create battle log message
        const attackName = result.attackType === 'physical' ? 'Ataque Físico' : 'Ataque Psíquico'
        const criticalText = result.isCritical ? ' ¡CRÍTICO!' : ''
        addToBattleLog(`${enemy.name} usa ${attackName} contra ${targetPlayer.name} - ${actualDamage} de daño${criticalText}`)

        // Calculate player HP after attack
        const updatedPlayerHp = Math.max(0, targetPlayer.currentHp - actualDamage)

        // Update HP in parent component
        if (typeof onCharacterHpChange === 'function') {
            onCharacterHpChange(targetPlayer.id, updatedPlayerHp)
        }

        // Update combat state
        const updatedPlayers = combatState.playerCharacters.map(char =>
            char.id === targetPlayer.id
                ? { ...char, currentHp: updatedPlayerHp }
                : char
        )

        // Check if battle ends with this attack
        const battleResult = checkBattleEnd(updatedPlayers, {
            ...combatState.enemy,
            currentHp: combatState.enemy.currentHp
        })

        if (battleResult === 'player_lost') {
            endBattle('defeat')
        } else {
            // Continue battle - player's turn
            setCombatState(prev => ({
                ...prev,
                playerCharacters: updatedPlayers,
                currentTurn: 'player',
                currentPlayerTurnIndex: 0
            }))
        }
    }

    // ========== BATTLE CONCLUSION ==========
    const endBattle = (result) => {
        // Reset positions to original active characters setup
        setCombatPositions(activeCharacters)
        setSelectedSlot(null)

        // Reset HP for surviving characters if victory
        if (result === 'victory') {
            combatState.playerCharacters.forEach(char => {
                if (char.currentHp > 0 && typeof onResetCharacterHp === 'function') {
                    onResetCharacterHp(char.id)
                }
            })
        }

        // Update battle status
        setCombatState(prev => ({ ...prev, battleStatus: result }))

        // Handle rewards or penalties
        if (result === 'victory') {
            const coinsWon = getBattleReward()
            addToBattleLog(`¡Victoria! Ganas ${coinsWon} monedas`)
            onCoinUpdate(coinsWon)
        } else {
            const coinsLost = getBattlePenalty()
            addToBattleLog(`¡Derrota! Pierdes ${coinsLost} monedas`)
            onCoinUpdate(-coinsLost)
            onResetDungeon()
        }

        // Delay before closing combat
        setTimeout(() => {
            onCombatEnd(result)
        }, 3000)
    }

    // ========== UTILITY FUNCTIONS ==========
    const getHpPercentage = (current, max) => {
        return Math.max((current / max) * 100, 0)
    }

    // ========== RENDER COMPONENT ==========
    return (
        <div className="combat-overlay">
            <div className="combat-container">

                {/* ========== COMBAT HEADER ========== */}
                <div className="combat-header">
                    <h2>⚔️ Combate por Turnos</h2>
                    <div className="turn-indicator">
                        Turno: {combatState.currentTurn === 'player' ? `JUGADOR - ${getCurrentPlayerTurn()?.name || 'Sin jugador'}` : 'ENEMIGO'}
                    </div>
                    <div className="alive-players-count">
                        Jugadores vivos: {getAlivePlayersCount()}/{combatState.playerCharacters.length}
                    </div>
                </div>

                {/* ========== COMBAT POSITIONS GRID ========== */}
                <div className="combat-positions">
                    <h4>Formación de Combate {selectedSlot && "- Selecciona posición destino"}</h4>
                    <div className="positions-grid">
                        {/* Back Row */}
                        <div className="battle-row back-row">
                            {[0, 1, 2].map(slot => (
                                <div
                                    key={`back-${slot}`}
                                    className={`combat-slot ${combatPositions.back[slot] ? 'occupied' : 'empty'} ${combatState.currentTurn === 'player' ? 'movable' : ''} ${selectedSlot?.position === 'back' && selectedSlot?.slot === slot ? 'selected' : ''}`}
                                    onClick={() => combatState.currentTurn === 'player' && handleSlotClick('back', slot)}
                                >
                                    {combatPositions.back[slot] ? (
                                        <div className="slot-content">
                                            <img src={combatPositions.back[slot].images[0]} alt={combatPositions.back[slot].name} />
                                            <span className="slot-name">{combatPositions.back[slot].name}</span>
                                            <div className="slot-hp">
                                                HP: {combatState.playerCharacters.find(p => p.id === combatPositions.back[slot].id)?.currentHp || 0}/{playerMaxHp}
                                            </div>
                                        </div>
                                    ) : 'Vacío'}
                                </div>
                            ))}
                        </div>

                        {/* Front Row */}
                        <div className="battle-row front-row">
                            {[0, 1, 2].map(slot => (
                                <div
                                    key={`front-${slot}`}
                                    className={`combat-slot ${combatPositions.front[slot] ? 'occupied' : 'empty'} ${combatState.currentTurn === 'player' ? 'movable' : ''} ${selectedSlot?.position === 'front' && selectedSlot?.slot === slot ? 'selected' : ''}`}
                                    onClick={() => combatState.currentTurn === 'player' && handleSlotClick('front', slot)}
                                >
                                    {combatPositions.front[slot] ? (
                                        <div className="slot-content">
                                            <img src={combatPositions.front[slot].images[0]} alt={combatPositions.front[slot].name} />
                                            <span className="slot-name">{combatPositions.front[slot].name}</span>
                                            <div className="slot-hp">
                                                HP: {combatState.playerCharacters.find(p => p.id === combatPositions.front[slot].id)?.currentHp || 0}/{playerMaxHp}
                                            </div>
                                        </div>
                                    ) : 'Vacío'}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* ========== BATTLE FIELD ========== */}
                <div className="battle-field">

                    {/* Player Combatants */}
                    <div className="player-combatants">
                        {combatState.playerCharacters.map((playerChar, index) => (
                            <div
                                key={playerChar.id}
                                className={`combatant player-combatant ${combatState.currentPlayerTurnIndex === index ? 'active-turn' : ''} ${playerChar.currentHp <= 0 ? 'defeated' : ''}`}
                            >
                                <div className="combatant-info">
                                    <h3>{playerChar.name}</h3>
                                    <div className="hp-bar">
                                        <div
                                            className="hp-fill"
                                            style={{ width: `${getHpPercentage(playerChar.currentHp, playerMaxHp)}%` }}
                                        ></div>
                                        <span className="hp-text">
                                            HP: {playerChar.currentHp}/{playerMaxHp}
                                        </span>
                                    </div>
                                    <div className="stats">
                                        <span>ATQ Fís: {playerChar.physicalAttack}</span>
                                        <span>ATQ Psíq: {playerChar.psychicAttack}</span>
                                        <span>DEF Fís: {playerChar.physicalDefense}</span>
                                        <span>DEF Psíq: {playerChar.psychicDefense}</span>
                                    </div>
                                </div>
                                <div className="combatant-image">
                                    <img src={playerChar.images?.[0]} alt={playerChar.name} />
                                    {playerChar.currentHp <= 0 && <div className="defeated-overlay">💀</div>}
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* VS Separator */}
                    <div className="vs-separator">VS</div>

                    {/* Enemy Combatant */}
                    <div className="combatant enemy-combatant">
                        <div className="combatant-info">
                            <h3>{enemy.name}</h3>
                            <div className="hp-bar">
                                <div
                                    className="hp-fill"
                                    style={{ width: `${getHpPercentage(combatState.enemy.currentHp, enemy.maxHp)}%` }}
                                ></div>
                                <span className="hp-text">
                                    HP: {combatState.enemy.currentHp}/{enemy.maxHp}
                                </span>
                            </div>
                            <div className="stats">
                                <span>ATQ Fís: {enemy.physicalAttack}</span>
                                <span>ATQ Psíq: {enemy.psychicAttack}</span>
                                <span>DEF Fís: {enemy.physicalDefense}</span>
                                <span>DEF Psíq: {enemy.psychicDefense}</span>
                            </div>
                        </div>
                        <div className="combatant-image">
                            <img src={enemy.image} alt={enemy.name} />
                        </div>
                    </div>
                </div>

                {/* ========== ACTION BUTTONS ========== */}
                {combatState.currentTurn === 'player' && combatState.battleStatus === 'ongoing' && getCurrentPlayerTurn()?.currentHp > 0 && (
                    <div className="action-buttons">
                        <div className="current-turn-indicator">
                            Turno de: {getCurrentPlayerTurn()?.name}
                        </div>
                        <button
                            className="attack-btn physical-attack"
                            onClick={() => playerAttack('physical')}
                        >
                            🗡️ Ataque Físico
                        </button>
                        <button
                            className="attack-btn psychic-attack"
                            onClick={() => playerAttack('psychic')}
                        >
                            🔮 Ataque Psíquico
                        </button>
                        <button
                            className="position-btn"
                            onClick={() => setSelectedSlot(null)}
                            disabled={!selectedSlot}
                        >
                            🔄 Cancelar Movimiento
                        </button>
                    </div>
                )}

                {/* ========== BATTLE LOG ========== */}
                <div className="battle-log">
                    <h4>Registro de Combate:</h4>
                    <div className="log-messages">
                        {combatState.battleLog.slice(-6).map((log, index) => (
                            <div key={index} className="log-message">
                                {log.message}
                            </div>
                        ))}
                    </div>
                </div>

                {/* ========== BATTLE RESULT ========== */}
                {combatState.battleStatus !== 'ongoing' && (
                    <div className={`battle-result ${combatState.battleStatus}`}>
                        <h2>
                            {combatState.battleStatus === 'victory' ? '¡VICTORIA!' : '¡DERROTA!'}
                        </h2>
                        <p>
                            {combatState.battleStatus === 'victory'
                                ? `Has vencido a ${enemy.name}`
                                : `Has sido derrotado por ${enemy.name}`
                            }
                        </p>
                    </div>
                )}
            </div>
        </div>
    )
}

export default Combat