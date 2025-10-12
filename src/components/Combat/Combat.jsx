import React, { useState, useEffect } from 'react'
import './Combat.css'
import { performAttack, enemyAI, checkBattleEnd, getBattleReward, getBattlePenalty } from '../../utils/combatLogic'
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

    // ========== SYNC HP FROM PARENT ==========
    useEffect(() => {
        setCombatState(prev => ({
            ...prev,
            playerCharacters: prev.playerCharacters.map(char => ({
                ...char,
                currentHp: playerCharactersHp[char.id] || char.currentHp
            }))
        }))
    }, [playerCharactersHp])

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

    // ========== POSITION SWAPPING ACTION ==========
    const handlePositionSwap = () => {
        if (combatState.currentTurn !== 'player' || combatState.battleStatus !== 'ongoing') return

        const currentPlayer = getCurrentPlayerTurn()
        if (!currentPlayer || currentPlayer.currentHp <= 0) return

        // Find current position of the player
        let currentPosition = null
        let currentSlot = null

        // Check front row
        for (let i = 0; i < combatPositions.front.length; i++) {
            if (combatPositions.front[i]?.id === currentPlayer.id) {
                currentPosition = 'front'
                currentSlot = i
                break
            }
        }

        // Check back row if not found in front
        if (!currentPosition) {
            for (let i = 0; i < combatPositions.back.length; i++) {
                if (combatPositions.back[i]?.id === currentPlayer.id) {
                    currentPosition = 'back'
                    currentSlot = i
                    break
                }
            }
        }

        if (!currentPosition) return

        // Determine target position
        const targetPosition = currentPosition === 'front' ? 'back' : 'front'

        // Find empty slot in target position
        const targetSlot = combatPositions[targetPosition].findIndex(slot => slot === null)
        if (targetSlot === -1) {
            addToBattleLog(`No space available in ${targetPosition === 'front' ? 'front' : 'back'} row`)
            return
        }

        // Perform the position swap
        setCombatPositions(prev => {
            const newPositions = { ...prev }

            // Remove from current position
            newPositions[currentPosition][currentSlot] = null

            // Add to target position
            newPositions[targetPosition][targetSlot] = currentPlayer

            return newPositions
        })

        const positionText = targetPosition === 'front' ? 'front' : 'back'
        addToBattleLog(`${currentPlayer.name} moved to ${positionText} row`)

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
        const attackName = attackType === 'physical' ? 'Physical Attack' : 'Psychic Attack'
        const criticalText = result.isCritical ? ' CRITICAL!' : ''
        addToBattleLog(`${currentPlayer.name} uses ${attackName} - ${actualDamage} damage${criticalText}`)

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
        // Find next alive player
        const nextPlayerIndex = findNextAlivePlayer(combatState.currentPlayerTurnIndex)

        if (nextPlayerIndex !== -1) {
            // Continue with next player
            setCombatState(prev => ({
                ...prev,
                currentPlayerTurnIndex: nextPlayerIndex
            }))
        } else {
            // No more alive players, enemy turn
            setCombatState(prev => ({
                ...prev,
                currentTurn: 'enemy',
                currentPlayerTurnIndex: 0
            }))
            setTimeout(() => {
                enemyTurn()
            }, 0)
        }
    }

    // ========== FIND NEXT ALIVE PLAYER ==========
    const findNextAlivePlayer = (currentIndex) => {
        const players = combatState.playerCharacters
        let nextIndex = (currentIndex + 1) % players.length
        let attempts = 0

        while (attempts < players.length) {
            if (players[nextIndex].currentHp > 0) {
                return nextIndex
            }
            nextIndex = (nextIndex + 1) % players.length
            attempts++
        }

        return -1 // No alive players found
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
        const attackName = result.attackType === 'physical' ? 'Physical Attack' : 'Psychic Attack'
        const criticalText = result.isCritical ? ' CRITICAL!' : ''
        addToBattleLog(`${enemy.name} uses ${attackName} against ${targetPlayer.name} - ${actualDamage} damage${criticalText}`)

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

            // Continue with updated players and switch back to player turn
            return {
                ...prev,
                playerCharacters: updatedPlayers,
                currentTurn: 'player',
                currentPlayerTurnIndex: findNextAlivePlayer(-1) // Find first alive player
            }
        })
    }

    // ========== BATTLE CONCLUSION ==========
    const endBattle = (result) => {
        // Reset positions to original active characters setup
        setCombatPositions(activeCharacters)

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
            addToBattleLog(`Victory! You win ${coinsWon} coins`)
            onCoinUpdate(coinsWon)
        } else {
            const coinsLost = getBattlePenalty()
            addToBattleLog(`Defeat! You lose ${coinsLost} coins`)
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
                    <h2>⚔️ Turn-Based Combat</h2>
                    <div className="turn-indicator">
                        Turn: {combatState.currentTurn === 'player' ? `PLAYER - ${getCurrentPlayerTurn()?.name || 'No player'}` : 'ENEMY'}
                    </div>
                    <div className="alive-players-count">
                        Alive players: {getAlivePlayersCount()}/{combatState.playerCharacters.length}
                    </div>
                </div>

                {/* ========== BATTLE FIELD WITH POSITION COLUMNS ========== */}
                <div className="battle-field">

                    {/* ========== PLAYER SIDE WITH POSITION COLUMNS ========== */}
                    <div className="player-side">
                        {/* Back Row Column */}
                        <div className="position-column back-row-column">
                            <div className="position-label">Back Row</div>
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
                                                    HP: {combatState.playerCharacters.find(p => p.id === char.id)?.currentHp || 0}/{playerMaxHp}
                                                </span>
                                            </div>
                                            <div className="position-badge back-badge">Back</div>
                                        </div>
                                        <div className="combatant-image">
                                            <img src={char.images?.[0]} alt={char.name} />
                                            {combatState.playerCharacters.find(p => p.id === char.id)?.currentHp <= 0 && <div className="defeated-overlay">💀</div>}
                                        </div>
                                    </div>
                                ) : (
                                    <div key={`back-empty-${index}`} className="combatant empty-slot">
                                        <div className="empty-slot-content">Empty</div>
                                    </div>
                                )
                            ))}
                        </div>

                        {/* Front Row Column */}
                        <div className="position-column front-row-column">
                            <div className="position-label">Front Row</div>
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
                                                    HP: {combatState.playerCharacters.find(p => p.id === char.id)?.currentHp || 0}/{playerMaxHp}
                                                </span>
                                            </div>
                                            <div className="position-badge front-badge">Front</div>
                                        </div>
                                        <div className="combatant-image">
                                            <img src={char.images?.[0]} alt={char.name} />
                                            {combatState.playerCharacters.find(p => p.id === char.id)?.currentHp <= 0 && <div className="defeated-overlay">💀</div>}
                                        </div>
                                    </div>
                                ) : (
                                    <div key={`front-empty-${index}`} className="combatant empty-slot">
                                        <div className="empty-slot-content">Empty</div>
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
                                        HP: {combatState.enemy.currentHp}/{enemy.maxHp}
                                    </span>
                                </div>
                                <div className="stats">
                                    <span>Phys ATK: {enemy.physicalAttack}</span>
                                    <span>Psy ATK: {enemy.psychicAttack}</span>
                                    <span>Phys DEF: {enemy.physicalDefense}</span>
                                    <span>Psy DEF: {enemy.psychicDefense}</span>
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
                            Turn: {getCurrentPlayerTurn()?.name}
                        </div>
                        <button
                            className="attack-btn physical-attack"
                            onClick={() => playerAttack('physical')}
                        >
                            🗡️ Physical Attack
                        </button>
                        <button
                            className="attack-btn psychic-attack"
                            onClick={() => playerAttack('psychic')}
                        >
                            🔮 Psychic Attack
                        </button>
                        <button
                            className="position-btn"
                            onClick={handlePositionSwap}
                        >
                            🔄 Change Position
                        </button>
                    </div>
                )}

                {/* ========== BATTLE LOG ========== */}
                <div className="battle-log">
                    <h4>Combat Log:</h4>
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
                            {combatState.battleStatus === 'victory' ? 'VICTORY!' : 'DEFEAT!'}
                        </h2>
                        <p>
                            {combatState.battleStatus === 'victory'
                                ? `You defeated ${enemy.name}`
                                : `You were defeated by ${enemy.name}`
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