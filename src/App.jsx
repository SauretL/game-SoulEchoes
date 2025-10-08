import './App.css'
import { useEffect, useState } from 'react'
import GachaCards from './components/GachaCards/GachaCards.jsx'
import PlayerLibrary from './components/PlayerLibrary/PlayerLibrary.jsx'
import gachaPull from './utils/gachaPull.js'
import loadArray from './utils/loadArray.js'
import CharacterDetail from './components/CharacterDetail/CharacterDetail.jsx'
import PlayerStats from './components/PlayerStats/PlayerStats.jsx'

function App() {

  //states
  const [currentView, setCurrentView] = useState("start")
  const [characterArray, setCharacterArray] = useState([])
  const [allCharacters, setAllCharacters] = useState([])
  const [pullCount, setPullCount] = useState(0)
  const [playerCharacters, setPlayerCharacters] = useState([])
  const [sortBy, setSortBy] = useState("id")
  const [selectedCharacter, setSelectedCharacter] = useState(null)



  useEffect(() => {
    loadArray("./public/data/characters.json")
      .then(charsArray => setAllCharacters(charsArray))
      .catch(error => console.error("Error loading characters:", error))
  }, [])

  //functions

  const addToPlayerCollection = (newCharacters) => {
    setPlayerCharacters(prevCollection => {
      const updatedCollection = [...prevCollection]

      newCharacters.forEach(newChar => {
        const existingCharIndex = updatedCollection.findIndex(
          char => char.id === newChar.id
        )

        if (existingCharIndex !== -1) {
          updatedCollection[existingCharIndex] = {
            ...updatedCollection[existingCharIndex],
            duplicates: updatedCollection[existingCharIndex].duplicates + 1
          }
        } else {
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
            genre: newChar.genre,
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
  }

  function gachaButton() {
    if (allCharacters.length > 0) {
      const rawResults = gachaPull(allCharacters, 5)
      const newPull = pullCount + 1
      setPullCount(newPull)
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
          genre: char.genre,
          age: char.age,
          birthday: char.birthday,
          likes: char.likes,
          dislikes: char.dislikes,
          favoriteFood: char.favoriteFood,
          hobbies: char.hobbies,
          stories: char.stories,
          skillsDescriptions: char.skillsDescriptions,
          equipmentDescriptions: char.equipmentDescriptions,
          opinions: char.opinions,
          fragments: char.fragments,
          birthdayQuoteSelf: char.birthdayQuoteSelf,
          birthdayQuotePlayer: char.birthdayQuotePlayer,
          _drawUid: "pull-" + newPull + "-" + i + "-" + Math.random().toString(36).slice(2, 6)
        }
      })
      setCharacterArray(annotated)
      addToPlayerCollection(rawResults)
    }
  }

  const changeView = (view) => {
    setCurrentView(view)
  }

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

  const handleCharacterClick = (character) => {
    setSelectedCharacter(character)
  }

  const closeCharacterDetail = () => {
    setSelectedCharacter(null)
  }

  return (
    <div className="app-container">
      {currentView === "start" && (
        <div className="start-view">
          <h1>Soul Echoes</h1>
          <p>A lo largo de distintos mundos y tiempos han surgido héroes y villanos que llevaron a cabo grandes hazañas que dejaron su huella en la historia. Las almas de estos personajes hacen eco en los distintos fragmentos de la realidad. Hoy, esos fragmentos se han unido y estos ecos han tomado vida nuevamente. Escucha sus voces: descubre las historias que guardan estas almas mientras te ayudan a continuar con tu objetivo de reunir todos sus relatos.</p>
          <button onClick={() => changeView("gacha")}>Comienza el juego</button>
        </div>
      )}

      {currentView === "gacha" && (
        <div className="gacha-view">
          <h1>Soul Echoes</h1>
          <p>¡Empieza el gacha!</p>
          <button onClick={gachaButton}>¡Prueba tu suerte!</button>
          <button onClick={() => changeView("library")} style={{ marginLeft: '10px' }}>
            Ver Mi Colección ({playerCharacters.length})
          </button>
          <GachaCards
            arrayInicial={characterArray}
            onCharacterClick={handleCharacterClick} />
        </div>
      )}

      {currentView === "library" && (
        <PlayerLibrary
          playerCharacters={getSortedCollection()}
          sortBy={sortBy}
          setSortBy={setSortBy}
          onBack={() => changeView("gacha")}
          onCharacterClick={handleCharacterClick}
          onShowStats={() => changeView("stats")}
        />
      )}
      {currentView === "stats" && (
        <PlayerStats
          playerCharacters={playerCharacters}
          allCharacters={allCharacters}
          onBack={() => changeView("library")}
        />
      )}
      {/* Character Detail Modal */}
      {selectedCharacter && (
        <CharacterDetail
          character={selectedCharacter}
          onClose={closeCharacterDetail}
        />
      )}
    </div>
  )
}
export default App

