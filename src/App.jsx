import './App.css'
import { useState } from 'react'
import GachaCards from './components/GachaCards/GachaCards.jsx'
import PlayerLibrary from './components/PlayerLibrary/PlayerLibrary.jsx'
import gachaPull from './utils/gachaPull.js'
import CharacterDetail from './components/CharacterDetail/CharacterDetail.jsx'
import PlayerStats from './components/PlayerStats/PlayerStats.jsx'
import allCharacters from './data/characters.json'
import Dungeon from './components/Dungeon/Dungeon.jsx'
import enemies from './data/enemies.json'
import Combat from './components/Combat/Combat.jsx'

function App() {
  // ========== STATE MANAGEMENT ==========
  const [currentView, setCurrentView] = useState("start")
  const [characterArray, setCharacterArray] = useState([])
  const [pullCount, setPullCount] = useState(0)
  const [showCombat, setShowCombat] = useState(false)
  const [currentEnemy, setCurrentEnemy] = useState(null)
  const [playerCharacters, setPlayerCharacters] = useState(() => {
    // Valeria (id 16) is default character
    const valeria = allCharacters.find(char => char.id === 16)
    return valeria ? [{
      id: valeria.id,
      name: valeria.name,
      epitaph: valeria.epitaph,
      rarity: valeria.rarity,
      rarityTier: valeria.rarityTier,
      class: valeria.class,
      fragment: valeria.fragment,
      images: valeria.images,
      duplicates: 1,
      gender: valeria.gender,
      age: valeria.age,
      birthday: valeria.birthday,
      likes: valeria.likes,
      dislikes: valeria.dislikes,
      favoriteFood: valeria.favoriteFood,
      hobbies: valeria.hobbies,
      stories: valeria.stories,
      skillsNames: valeria.skillsNames,
      skillsDescriptions: valeria.skillsDescriptions,
      quotes: valeria.quotes,
      equipmentNames: valeria.equipmentNames,
      equipmentDescriptions: valeria.equipmentDescriptions,
      opinions: valeria.opinions,
      fragments: valeria.fragments,
      birthdayQuoteSelf: valeria.birthdayQuoteSelf,
      birthdayQuotePlayer: valeria.birthdayQuotePlayer
    }] : []
  })
  const [sortBy, setSortBy] = useState("id")
  const [selectedCharacter, setSelectedCharacter] = useState(null)
  const [playerCoins, setPlayerCoins] = useState(0)
  const [dungeonCharacter, setDungeonCharacter] = useState(() => {
    // Valeria as dungeon default character
    const valeria = allCharacters.find(char => char.id === 16)
    return valeria ? {
      id: valeria.id,
      name: valeria.name,
      epitaph: valeria.epitaph,
      rarity: valeria.rarity,
      rarityTier: valeria.rarityTier,
      class: valeria.class,
      fragment: valeria.fragment,
      images: valeria.images,
      duplicates: 1,
      gender: valeria.gender,
      age: valeria.age,
      birthday: valeria.birthday,
      likes: valeria.likes,
      dislikes: valeria.dislikes,
      favoriteFood: valeria.favoriteFood,
      hobbies: valeria.hobbies,
      stories: valeria.stories,
      skillsNames: valeria.skillsNames,
      skillsDescriptions: valeria.skillsDescriptions,
      quotes: valeria.quotes,
      equipmentNames: valeria.equipmentNames,
      equipmentDescriptions: valeria.equipmentDescriptions,
      opinions: valeria.opinions,
      fragments: valeria.fragments,
      birthdayQuoteSelf: valeria.birthdayQuoteSelf,
      birthdayQuotePlayer: valeria.birthdayQuotePlayer
    } : null
  })

  // ========== CHARACTER COLLECTION MANAGEMENT ==========
  const addToPlayerCollection = (newCharacters) => {
    setPlayerCharacters(prevCollection => {
      const updatedCollection = [...prevCollection]

      newCharacters.forEach(newChar => {
        const existingCharIndex = updatedCollection.findIndex(
          char => char.id === newChar.id
        )

        if (existingCharIndex !== -1) {
          // Update duplicate count for existing character
          updatedCollection[existingCharIndex] = {
            ...updatedCollection[existingCharIndex],
            duplicates: updatedCollection[existingCharIndex].duplicates + 1
          }
        } else {
          // Add new character to collection
          updatedCollection.push({
            id: newChar.id,
            name: newChar.name,
            epitaph: newChar.epitaph,
            rarity: newChar.rarity,
            rarityTier: newChar.rarityTier,
            class: newChar.class,
            fragment: newChar.fragment,
            images: newChar.images,
            duplicates: 1,
            gender: newChar.gender,
            age: newChar.age,
            birthday: newChar.birthday,
            likes: newChar.likes,
            dislikes: newChar.dislikes,
            favoriteFood: newChar.favoriteFood,
            hobbies: newChar.hobbies,
            stories: newChar.stories,
            skillsNames: newChar.skillsNames,
            skillsDescriptions: newChar.skillsDescriptions,
            quotes: newChar.quotes,
            equipmentNames: newChar.equipmentNames,
            equipmentDescriptions: newChar.equipmentDescriptions,
            opinions: newChar.opinions,
            fragments: newChar.fragments,
            birthdayQuoteSelf: newChar.birthdayQuoteSelf,
            birthdayQuotePlayer: newChar.birthdayQuotePlayer
          })
        }
      })

      return updatedCollection
    })

    // Set first new character as dungeon character if none is selected
    setDungeonCharacter(prev => {
      if (!prev && newCharacters.length > 0) {
        return {
          ...newCharacters[0],
          duplicates: 1
        }
      }
      return prev
    })
  }

  // ========== DUNGEON CHARACTER MANAGEMENT ==========
  const setDungeonCharacterFromLibrary = (character) => {
    setDungeonCharacter(character)
  }

  // ========== CURRENCY MANAGEMENT ==========
  const addCoinsFromDungeon = (coins) => {
    setPlayerCoins(prevCoins => prevCoins + coins)
  }

  // ========== GACHA SYSTEM ==========
  const gachaButton = () => {
    const pullCost = 50

    if (playerCoins < pullCost) {
      alert("No tienes suficientes monedas para hacer un pull!")
      return
    }

    if (allCharacters.length > 0) {
      // Deduct coins and perform gacha pull
      setPlayerCoins(prevCoins => prevCoins - pullCost)
      const rawResults = gachaPull(allCharacters, 5)
      const newPull = pullCount + 1
      setPullCount(newPull)

      // Annotate results with unique identifiers
      const annotated = rawResults.map((char, i) => {
        return {
          name: char.name,
          epitaph: char.epitaph,
          rarity: char.rarity,
          rarityTier: char.rarityTier,
          class: char.class,
          fragment: char.fragment,
          images: char.images,
          equipmentNames: char.equipmentNames,
          skillsNames: char.skillsNames,
          quotes: char.quotes,
          _drawUid: "pull-" + newPull + "-" + i + "-" + Math.random().toString(36).slice(2, 6)
        }
      })

      setCharacterArray(annotated)
      addToPlayerCollection(rawResults)
    }
  }

  // ========== COMBAT MANAGEMENT ==========
  const startCombat = (enemy) => {
    setCurrentEnemy(enemy)
    setShowCombat(true)
  }

  const endCombat = (result) => {
    setShowCombat(false)
    setCurrentEnemy(null)

    // Additional logic based on combat result can be added here
    // For example: show victory/defeat messages, update player stats, etc.
    console.log(`Combat ended with result: ${result}`)
  }

  const resetDungeon = () => {
    // Reset dungeon-related states when player loses combat
    setShowCombat(false)
    setCurrentEnemy(null)
    // Note: dungeonCharacter remains the same
  }

  // ========== VIEW NAVIGATION ==========
  const changeView = (view) => {
    setCurrentView(view)
  }

  // ========== CHARACTER SORTING ==========
  const getSortedCollection = () => {
    const sorted = [...playerCharacters]

    switch (sortBy) {
      case "name":
        return sorted.sort((a, b) => a.name.localeCompare(b.name))
      case "rarity":
        return sorted.sort((a, b) => b.rarityTier - a.rarityTier || a.name.localeCompare(b.name))
      case "fragment":
        return sorted.sort((a, b) => a.fragment.localeCompare(b.fragment) || a.name.localeCompare(b.name))
      case "class":
        return sorted.sort((a, b) => a.class.localeCompare(b.class) || a.name.localeCompare(b.name))
      case "duplicates":
        return sorted.sort((a, b) => b.duplicates - a.duplicates || a.name.localeCompare(b.name))
      case "id":
      default:
        return sorted.sort((a, b) => a.id - b.id)
    }
  }

  // ========== CHARACTER DETAIL MANAGEMENT ==========
  const handleCharacterClick = (character) => {
    setSelectedCharacter(character)
  }

  const closeCharacterDetail = () => {
    setSelectedCharacter(null)
  }

  // ========== RENDER COMPONENT ==========
  return (
    <div className="app-container">

      {/* ========== START VIEW ========== */}
      {currentView === "start" && (
        <div className="start-view">
          <h1>Soul Echoes</h1>
          <p>A lo largo de distintos mundos y tiempos han surgido héroes y villanos que llevaron a cabo grandes hazañas que dejaron su huella en la historia. Las almas de estos personajes hacen eco en los distintos fragmentos de la realidad. Hoy, esos fragmentos se han unido y estos ecos han tomado vida nuevamente. Escucha sus voces: descubre las historias que guardan estas almas mientras te ayudan a continuar con tu objetivo de reunir todos sus relatos.</p>
          <button onClick={() => changeView("gacha")}>Comienza el juego</button>
        </div>
      )}

      {/* ========== GACHA VIEW ========== */}
      {currentView === "gacha" && (
        <div className="gacha-view">
          <h1>Soul Echoes</h1>
          <p>¡Empieza el gacha!</p>
          <button onClick={gachaButton}>¡Prueba tu suerte! (100 monedas)</button>
          <button
            onClick={() => changeView("dungeon")}
            style={{ marginLeft: '10px', backgroundColor: '#8B4513' }}
          >
            Explorar Dungeon
          </button>
          <button
            onClick={() => changeView("library")}
            style={{ marginLeft: '10px' }}
          >
            Ver Mi Colección ({playerCharacters.length})
          </button>
          <GachaCards
            arrayInicial={characterArray}
            onCharacterClick={handleCharacterClick}
          />
        </div>
      )}

      {/* ========== LIBRARY VIEW ========== */}
      {currentView === "library" && (
        <PlayerLibrary
          playerCharacters={getSortedCollection()}
          sortBy={sortBy}
          setSortBy={setSortBy}
          playerCoins={playerCoins}
          onBack={() => changeView("gacha")}
          onCharacterClick={handleCharacterClick}
          onShowStats={() => changeView("stats")}
          onExploreDungeon={() => changeView("dungeon")}
          setDungeonCharacter={setDungeonCharacterFromLibrary}
          dungeonCharacter={dungeonCharacter}
        />
      )}

      {/* ========== STATS VIEW ========== */}
      {currentView === "stats" && (
        <PlayerStats
          playerCharacters={playerCharacters}
          allCharacters={allCharacters}
          playerCoins={playerCoins}
          onBack={() => changeView("library")}
        />
      )}

      {/* ========== DUNGEON VIEW ========== */}
      {currentView === "dungeon" && (
        <Dungeon
          onBack={() => changeView("gacha")}
          onCoinEarned={addCoinsFromDungeon}
          playerCoins={playerCoins}
          dungeonCharacter={dungeonCharacter}
          onCharacterClick={handleCharacterClick}
          onStartCombat={startCombat}
          enemies={enemies}
        />
      )}

      {/* ========== CHARACTER DETAIL MODAL ========== */}
      {selectedCharacter && (
        <CharacterDetail
          character={selectedCharacter}
          onClose={closeCharacterDetail}
        />
      )}

      {/* ========== COMBAT OVERLAY ========== */}
      {showCombat && currentEnemy && (
        <Combat
          playerCharacter={dungeonCharacter}
          enemy={currentEnemy}
          onCombatEnd={endCombat}
          onCoinUpdate={addCoinsFromDungeon}
          onResetDungeon={resetDungeon}
        />
      )}
    </div>
  )
}

export default App

