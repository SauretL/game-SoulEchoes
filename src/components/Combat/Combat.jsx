import React, { useState, useEffect } from 'react'
import './Combat.css'
import {
    performAttack,
    enemyAI,
    checkBattleEnd,
    getBattleReward,
    getBattlePenalty,
    getAlivePlayersCount as getAlivePlayersCountLogic,
    findNextAlivePlayer,
    getHpPercentage,
    calculatePositionSwap,
    executePositionSwap,
    initializeCombatState,
    addToBattleLog,
    getLastBattleLogs
} from '../../utils/combatLogic'
import CharacterDetail from '../CharacterDetail/CharacterDetail'

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
    const [combatState, setCombatState] = useState(() =>
        initializeCombatState(activeCharacters, enemy, playerCharactersHp, playerMaxHp)
    )

    // ========== POSITION MANAGEMENT STATE ==========
    const [combatPositions, setCombatPositions] = useState({
        front: [null, null, null],
        back: [null, null, null]
    })

    // ========== CHARACTER DETAIL STATE ==========
    const [selectedCharacter, setSelectedCharacter] = useState(null)

    // ========== INITIALIZE COMBAT POSITIONS ==========
    useEffect(() => {
        // Set initial positions from active characters
        setCombatPositions(activeCharacters)
    }, [activeCharacters])

    // ========== BATTLE LOG MANAGEMENT ==========
    const handleAddToBattleLog = (message) => {
        setCombatState(prev => ({
            ...prev,
            battleLog: addToBattleLog(prev.battleLog, message)
        }))
    }

    // ========== ENEMY TURN AUTOMATION ==========
    useEffect(() => {
        // When turn changes to enemy and battle is ongoing, execute enemy turn
        if (combatState.currentTurn === 'enemy' && combatState.battleStatus === 'ongoing') {
            // Delay for better UX
            const timer = setTimeout(() => {
                enemyTurn()
            }, 1000)

            return () => clearTimeout(timer)
        }
    }, [combatState.currentTurn, combatState.battleStatus])

    // ========== GET CURRENT PLAYER TURN ==========
    const getCurrentPlayerTurn = () => {
        return combatState.playerCharacters[combatState.currentPlayerTurnIndex]
    }

    // ========== GET ALIVE PLAYERS COUNT ==========
    const getAlivePlayersCount = () => {
        return getAlivePlayersCountLogic(combatState.playerCharacters)
    }

    // ========== POSITION SWAPPING ACTION ==========
    const handlePositionSwap = () => {
        if (combatState.currentTurn !== 'player' || combatState.battleStatus !== 'ongoing') return

        const currentPlayer = getCurrentPlayerTurn()
        if (!currentPlayer || currentPlayer.currentHp <= 0) return

        // Calculate position swap using combatLogic
        const swapData = calculatePositionSwap(combatPositions, currentPlayer)
        if (!swapData) {
            handleAddToBattleLog(`No hay espacio disponible en la fila ${swapData?.targetPosition === 'front' ? 'delantera' : 'trasera'}`)
            return
        }

        // Execute the position swap
        const newPositions = executePositionSwap(combatPositions, swapData, currentPlayer)
        setCombatPositions(newPositions)

        const positionText = swapData.targetPosition === 'front' ? 'delantera' : 'trasera'
        handleAddToBattleLog(`${currentPlayer.name} se mueve a la fila ${positionText}`)

        // End player turn after position swap
        endPlayerTurn()
    }

    // ========== CHARACTER CLICK HANDLER ==========
    const handleCharacterClick = (character) => {
        if (combatState.battleStatus === 'ongoing') {
            setSelectedCharacter(character)
        }
    }

    // ========== CLOSE CHARACTER DETAIL ==========
    const closeCharacterDetail = () => {
        setSelectedCharacter(null)
    }

    // ========== PLAYER ATTACK ACTIONS ==========
    const playerAttack = (attackType) => {
        // Validate if player can attack
        if (combatState.currentTurn !== 'player' || combatState.battleStatus !== 'ongoing') return

        const currentPlayer = getCurrentPlayerTurn()

        // Skip defeated players
        if (currentPlayer.currentHp <= 0) {
            endPlayerTurn()
            return
        }

        // Use current player stats and current enemy stats
        const result = performAttack(currentPlayer, combatState.enemy, attackType)

        // Ensure minimum 1 damage
        const actualDamage = Math.max(1, result.damage)

        // Create battle log message
        const attackName = attackType === 'physical' ? 'Ataque Físico' : 'Ataque Psíquico'
        const criticalText = result.isCritical ? ' ¡CRÍTICO!' : ''
        handleAddToBattleLog(`${currentPlayer.name} usa ${attackName} - ${actualDamage} daño${criticalText}`)

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
            // Update enemy HP and end player turn
            setCombatState(prev => ({
                ...prev,
                enemy: { ...prev.enemy, currentHp: updatedEnemyHp }
            }))
            endPlayerTurn()
        }
    }

    // ========== END PLAYER TURN ==========
    const endPlayerTurn = () => {
        console.log("Finalizando turno del jugador actual")

        const nextPlayerIndex = findNextAlivePlayer(combatState.playerCharacters, combatState.currentPlayerTurnIndex)

        if (nextPlayerIndex !== -1) {
            console.log("Siguiente jugador encontrado:", combatState.playerCharacters[nextPlayerIndex].name)
            // Continue with the next alive character
            setCombatState(prev => ({
                ...prev,
                currentPlayerTurnIndex: nextPlayerIndex
            }))
        } else {
            console.log("No hay más jugadores vivos, turno del enemigo")
            // If there are no more alive characters, switch to enemy turn
            setCombatState(prev => ({
                ...prev,
                currentTurn: 'enemy',
                currentPlayerTurnIndex: 0 // Reset for next round
            }))
        }
    }

    // ========== ENEMY AI TURN ==========
    const enemyTurn = () => {
        console.log("Turno enemigo comenzado")

        // Validate if enemy can attack
        if (combatState.battleStatus !== 'ongoing') return
        console.log("La batalla continúa")

        // Use imported function to get random alive player
        const alivePlayers = combatState.playerCharacters.filter(char => char.currentHp > 0)
        if (alivePlayers.length === 0) {
            endBattle('defeat')
            return
        }
        console.log("Jugador está vivo")

        const randomPlayerIndex = Math.floor(Math.random() * alivePlayers.length)
        const targetPlayer = alivePlayers[randomPlayerIndex]

        // Enemy attacks selected player
        const result = enemyAI(combatState.enemy, targetPlayer)

        // Ensure minimum 1 damage
        const actualDamage = Math.max(1, result.damage)

        // Create battle log message
        const attackName = result.attackType === 'physical' ? 'Ataque Físico' : 'Ataque Psíquico'
        const criticalText = result.isCritical ? ' ¡CRÍTICO!' : ''
        handleAddToBattleLog(`${enemy.name} usa ${attackName} contra ${targetPlayer.name} - ${actualDamage} daño${criticalText}`)

        // Calculate player HP after attack
        const updatedPlayerHp = Math.max(0, targetPlayer.currentHp - actualDamage)

        // Update HP in parent component AND in local combat state
        if (typeof onCharacterHpChange === 'function') {
            onCharacterHpChange(targetPlayer.id, updatedPlayerHp)
        }

        // Update local combat state with the HP change
        setCombatState(prev => {
            const updatedPlayers = prev.playerCharacters.map(char =>
                char.id === targetPlayer.id
                    ? { ...char, currentHp: updatedPlayerHp }
                    : char
            )

            // Check if battle ends with this attack
            const battleResult = checkBattleEnd(updatedPlayers, {
                ...prev.enemy,
                currentHp: prev.enemy.currentHp
            })

            if (battleResult === 'player_lost') {
                endBattle('defeat')
                return prev // Return previous state since battle is ending
            }

            console.log("Turno enemigo terminado")

            // Continue with updated players and switch back to player turn
            return {
                ...prev,
                playerCharacters: updatedPlayers,
                currentTurn: 'player',
                currentPlayerTurnIndex: findNextAlivePlayer(updatedPlayers, -1) // Find first alive player
            }
        })
    }

    // ========== BATTLE CONCLUSION ==========
    const endBattle = (result) => {
        // Reset positions to original active characters setup
        setCombatPositions(activeCharacters)

        // ONLY reset HP for surviving characters if DEFEAT (not victory)
        if (result === 'defeat') {
            combatState.playerCharacters.forEach(char => {
                if (typeof onResetCharacterHp === 'function') {
                    onResetCharacterHp(char.id)
                }
            })
        }

        // Update battle status
        setCombatState(prev => ({ ...prev, battleStatus: result }))

        // Handle rewards or penalties
        if (result === 'victory') {
            const coinsWon = getBattleReward()
            handleAddToBattleLog(`¡Victoria! Ganaste ${coinsWon} monedas`)
            onCoinUpdate(coinsWon)
        } else {
            const coinsLost = getBattlePenalty()
            handleAddToBattleLog(`¡Derrota! Perdiste ${coinsLost} monedas`)
            onCoinUpdate(-coinsLost)
            onResetDungeon()
        }

        // Delay before closing combat
        setTimeout(() => {
            onCombatEnd(result)
        }, 3000)
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

                {/* ========== BATTLE FIELD WITH POSITION COLUMNS ========== */}
                <div className="battle-field">

                    {/* ========== PLAYER SIDE WITH POSITION COLUMNS ========== */}
                    <div className="player-side">
                        {/* Back Row Column */}
                        <div className="position-column back-row-column">
                            <div className="position-label">Fila Trasera</div>
                            {combatPositions.back.map((char, index) => (
                                char ? (
                                    <div
                                        key={`back-${char.id}-${index}`}
                                        className={`combatant player-combatant ${getCurrentPlayerTurn()?.id === char.id ? 'active-turn' : ''} ${combatState.playerCharacters.find(p => p.id === char.id)?.currentHp <= 0 ? 'defeated' : ''}`}
                                        onClick={() => handleCharacterClick(char)}
                                    >
                                        <div className="combatant-info">
                                            <h3>{char.name}</h3>
                                            <div className="hp-bar">
                                                <div
                                                    className="hp-fill"
                                                    style={{ width: `${getHpPercentage(combatState.playerCharacters.find(p => p.id === char.id)?.currentHp || 0, playerMaxHp)}%` }}
                                                ></div>
                                                <span className="hp-text">
                                                    PV: {combatState.playerCharacters.find(p => p.id === char.id)?.currentHp || 0}/{playerMaxHp}
                                                </span>
                                            </div>
                                            <div className="position-badge back-badge">Trasero</div>
                                        </div>
                                        <div className="combatant-image">
                                            <img src={char.images?.[0]} alt={char.name} />
                                            {combatState.playerCharacters.find(p => p.id === char.id)?.currentHp <= 0 && <div className="defeated-overlay">💀</div>}
                                        </div>
                                    </div>
                                ) : (
                                    <div key={`back-empty-${index}`} className="combatant empty-slot">
                                        <div className="empty-slot-content">Vacío</div>
                                    </div>
                                )
                            ))}
                        </div>

                        {/* Front Row Column */}
                        <div className="position-column front-row-column">
                            <div className="position-label">Fila Delantera</div>
                            {combatPositions.front.map((char, index) => (
                                char ? (
                                    <div
                                        key={`front-${char.id}-${index}`}
                                        className={`combatant player-combatant ${getCurrentPlayerTurn()?.id === char.id ? 'active-turn' : ''} ${combatState.playerCharacters.find(p => p.id === char.id)?.currentHp <= 0 ? 'defeated' : ''}`}
                                        onClick={() => handleCharacterClick(char)}
                                    >
                                        <div className="combatant-info">
                                            <h3>{char.name}</h3>
                                            <div className="hp-bar">
                                                <div
                                                    className="hp-fill"
                                                    style={{ width: `${getHpPercentage(combatState.playerCharacters.find(p => p.id === char.id)?.currentHp || 0, playerMaxHp)}%` }}
                                                ></div>
                                                <span className="hp-text">
                                                    PV: {combatState.playerCharacters.find(p => p.id === char.id)?.currentHp || 0}/{playerMaxHp}
                                                </span>
                                            </div>
                                            <div className="position-badge front-badge">Delantero</div>
                                        </div>
                                        <div className="combatant-image">
                                            <img src={char.images?.[0]} alt={char.name} />
                                            {combatState.playerCharacters.find(p => p.id === char.id)?.currentHp <= 0 && <div className="defeated-overlay">💀</div>}
                                        </div>
                                    </div>
                                ) : (
                                    <div key={`front-empty-${index}`} className="combatant empty-slot">
                                        <div className="empty-slot-content">Vacío</div>
                                    </div>
                                )
                            ))}
                        </div>
                    </div>

                    {/* ========== VS SEPARATOR ========== */}
                    <div className="vs-separator">VS</div>

                    {/* ========== ENEMY SIDE ========== */}
                    <div className="enemy-side">
                        <div className="combatant enemy-combatant">
                            <div className="combatant-info">
                                <h3>{enemy.name}</h3>
                                <div className="hp-bar">
                                    <div
                                        className="hp-fill"
                                        style={{ width: `${getHpPercentage(combatState.enemy.currentHp, enemy.maxHp)}%` }}
                                    ></div>
                                    <span className="hp-text">
                                        PV: {combatState.enemy.currentHp}/{enemy.maxHp}
                                    </span>
                                </div>
                                <div className="stats">
                                    <span>Ataque Fís: {enemy.physicalAttack}</span>
                                    <span>Ataque Psí: {enemy.psychicAttack}</span>
                                    <span>Defensa Fís: {enemy.physicalDefense}</span>
                                    <span>Defensa Psí: {enemy.psychicDefense}</span>
                                </div>
                            </div>
                            <div className="combatant-image">
                                <img src={enemy.image} alt={enemy.name} />
                            </div>
                        </div>
                    </div>
                </div>

                {/* ========== ACTION BUTTONS ========== */}
                {combatState.currentTurn === 'player' && combatState.battleStatus === 'ongoing' && getCurrentPlayerTurn()?.currentHp > 0 && (
                    <div className="action-buttons">
                        <div className="current-turn-indicator">
                            Turno: {getCurrentPlayerTurn()?.name}
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
                            onClick={handlePositionSwap}
                        >
                            🔄 Cambiar Posición
                        </button>
                    </div>
                )}

                {/* ========== BATTLE LOG ========== */}
                <div className="battle-log">
                    <h4>Registro de Combate:</h4>
                    <div className="log-messages">
                        {getLastBattleLogs(combatState.battleLog).map((log, index) => (
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
                                ? `Derrotaste a ${enemy.name}`
                                : `Fuiste derrotado por ${enemy.name}`
                            }
                        </p>
                    </div>
                )}
            </div>

            {/* ========== CHARACTER DETAIL MODAL ========== */}
            {selectedCharacter && (
                <CharacterDetail
                    character={selectedCharacter}
                    onClose={closeCharacterDetail}
                />
            )}
        </div>
    )
}

export default Combat