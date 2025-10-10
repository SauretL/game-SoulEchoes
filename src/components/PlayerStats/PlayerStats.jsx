import './PlayerStats.css'

function PlayerStats({ playerCharacters, allCharacters, playerCoins, onBack }) {
    // ========== STATISTICS CALCULATION ==========
    const totalCharacters = allCharacters.length
    const uniqueOwnedCharacters = new Set(playerCharacters.map(char => char.id)).size

    const rarityStats = calculateRarityStats(playerCharacters, allCharacters)
    const classStats = calculateClassStats(playerCharacters, allCharacters)
    const fragmentStats = calculateFragmentStats(playerCharacters, allCharacters)
    const genderStats = calculateGenderStats(playerCharacters, allCharacters)
    const fragmentDetailedStats = calculateFragmentDetailedStats(playerCharacters, allCharacters)

    // ========== DEBUG LOGGING ==========
    console.log("=== DEBUG GENDER STATS ===")
    console.log("All characters genders:", allCharacters.map(char => ({
        id: char.id,
        name: char.name,
        gender: char.gender
    })))
    console.log("Player characters genders:", playerCharacters.map(char => ({
        id: char.id,
        name: char.name,
        gender: char.gender
    })))
    console.log("Gender stats result:", genderStats)

    // ========== RENDER COMPONENT ==========
    return (
        <div className="stats-container">

            {/* ========== HEADER SECTION ========== */}
            <div className="stats-header">
                <h1>Estadísticas de la Colección</h1>
                <div className="stats-top-info">
                    <span className="coins-info">Monedas: {playerCoins}</span>
                    <button onClick={onBack} className="back-button">
                        Volver a la Biblioteca
                    </button>
                </div>
            </div>

            {/* ========== GENERAL STATISTICS SECTION ========== */}
            <div className="stats-section">
                <h2>Resumen General</h2>
                <div className="general-stats">
                    <div className="stat-card">
                        <h3>Progreso de colección de personajes</h3>
                        <p>{uniqueOwnedCharacters} / {totalCharacters}</p>
                        <div className="progress-bar">
                            <div
                                className="progress-fill"
                                style={{ width: `${(uniqueOwnedCharacters / totalCharacters) * 100}%` }}
                            ></div>
                        </div>
                    </div>
                </div>
            </div>

            {/* ========== RARITY STATISTICS SECTION ========== */}
            <div className="stats-section">
                <h2>Estadísticas por Rareza</h2>
                <div className="stats-grid">
                    {rarityStats.map(stat => (
                        <div key={stat.rarity} className="stat-card">
                            <h3>{stat.rarity}</h3>
                            <p>{stat.owned} / {stat.total}</p>
                            <div className="progress-bar">
                                <div
                                    className="progress-fill"
                                    style={{ width: `${(stat.owned / stat.total) * 100}%` }}
                                ></div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* ========== CLASS STATISTICS SECTION ========== */}
            <div className="stats-section">
                <h2>Estadísticas por Clase</h2>
                <div className="stats-grid">
                    {classStats.map(stat => (
                        <div key={stat.class} className="stat-card">
                            <h3>{stat.class}</h3>
                            <p>{stat.owned} / {stat.total}</p>
                            <div className="progress-bar">
                                <div
                                    className="progress-fill"
                                    style={{ width: `${(stat.owned / stat.total) * 100}%` }}
                                ></div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* ========== FRAGMENT STATISTICS SECTION ========== */}
            <div className="stats-section">
                <h2>Estadísticas por Fragmento</h2>
                <div className="stats-grid">
                    {fragmentStats.map(stat => (
                        <div key={stat.fragment} className="stat-card">
                            <h3>{stat.fragment}</h3>
                            <p>{stat.owned} / {stat.total}</p>
                            <div className="progress-bar">
                                <div
                                    className="progress-fill"
                                    style={{ width: `${(stat.owned / stat.total) * 100}%` }}
                                ></div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* ========== GENDER STATISTICS SECTION ========== */}
            <div className="stats-section">
                <h2>Estadísticas por Género</h2>
                <div className="stats-grid">
                    {genderStats.map(stat => (
                        <div key={stat.gender} className="stat-card">
                            <h3>{stat.gender}</h3>
                            <p>{stat.owned} / {stat.total}</p>
                            <div className="progress-bar">
                                <div
                                    className="progress-fill"
                                    style={{ width: `${(stat.owned / stat.total) * 100}%` }}
                                ></div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* ========== DETAILED FRAGMENT BREAKDOWN SECTION ========== */}
            <div className="stats-section">
                <h2>Desglose por Fragmento</h2>
                {fragmentDetailedStats.map(fragmentStat => (
                    <div key={fragmentStat.fragment} className="fragment-detailed">
                        <h3>Fragmento: {fragmentStat.fragment}</h3>
                        <div className="detailed-stats">

                            {/* RARITY BREAKDOWN */}
                            <div className="detailed-category">
                                <h4>Rarezas</h4>
                                {fragmentStat.rarities.map(stat => (
                                    <div key={stat.rarity} className="mini-stat">
                                        <span>{stat.rarity}:</span>
                                        <span>{stat.owned}/{stat.total}</span>
                                    </div>
                                ))}
                            </div>

                            {/* CLASS BREAKDOWN */}
                            <div className="detailed-category">
                                <h4>Clases</h4>
                                {fragmentStat.classes.map(stat => (
                                    <div key={stat.class} className="mini-stat">
                                        <span>{stat.class}:</span>
                                        <span>{stat.owned}/{stat.total}</span>
                                    </div>
                                ))}
                            </div>

                            {/* GENDER BREAKDOWN */}
                            <div className="detailed-category">
                                <h4>Géneros</h4>
                                {fragmentStat.genders.map(stat => (
                                    <div key={stat.gender} className="mini-stat">
                                        <span>{stat.gender}:</span>
                                        <span>{stat.owned}/{stat.total}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}

// ========== STATISTICS CALCULATION FUNCTIONS ==========

/**
 * Calculate rarity statistics for owned vs total characters
 */
function calculateRarityStats(playerCharacters, allCharacters) {
    const rarityGroups = {}

    allCharacters.forEach(char => {
        const rarity = char.rarity
        if (!rarityGroups[rarity]) {
            rarityGroups[rarity] = { total: 0, owned: 0 }
        }
        rarityGroups[rarity].total++
    })

    playerCharacters.forEach(char => {
        const rarity = char.rarity
        if (rarityGroups[rarity]) {
            rarityGroups[rarity].owned++
        }
    })

    return Object.entries(rarityGroups).map(([rarity, stats]) => ({
        rarity,
        owned: stats.owned,
        total: stats.total
    }))
}

/**
 * Calculate class statistics for owned vs total characters
 */
function calculateClassStats(playerCharacters, allCharacters) {
    const classGroups = {}

    allCharacters.forEach(char => {
        const charClass = char.class
        if (!classGroups[charClass]) {
            classGroups[charClass] = { total: 0, owned: 0 }
        }
        classGroups[charClass].total++
    })

    playerCharacters.forEach(char => {
        const charClass = char.class
        if (classGroups[charClass]) {
            classGroups[charClass].owned++
        }
    })

    return Object.entries(classGroups).map(([charClass, stats]) => ({
        class: charClass,
        owned: stats.owned,
        total: stats.total
    }))
}

/**
 * Calculate fragment statistics for owned vs total characters
 */
function calculateFragmentStats(playerCharacters, allCharacters) {
    const fragmentGroups = {}

    allCharacters.forEach(char => {
        const fragment = char.fragment
        if (!fragmentGroups[fragment]) {
            fragmentGroups[fragment] = { total: 0, owned: 0 }
        }
        fragmentGroups[fragment].total++
    })

    playerCharacters.forEach(char => {
        const fragment = char.fragment
        if (fragmentGroups[fragment]) {
            fragmentGroups[fragment].owned++
        }
    })

    return Object.entries(fragmentGroups).map(([fragment, stats]) => ({
        fragment,
        owned: stats.owned,
        total: stats.total
    }))
}

/**
 * Calculate gender statistics for owned vs total characters
 */
function calculateGenderStats(playerCharacters, allCharacters) {
    const genderGroups = {}

    allCharacters.forEach(char => {
        const gender = (char.gender && char.gender.trim() !== '') ? char.gender : 'No especificado'
        if (!genderGroups[gender]) {
            genderGroups[gender] = { total: 0, owned: 0 }
        }
        genderGroups[gender].total++
    })

    playerCharacters.forEach(char => {
        const gender = (char.gender && char.gender.trim() !== '') ? char.gender : 'No especificado'
        if (genderGroups[gender]) {
            genderGroups[gender].owned++
        }
    })

    return Object.entries(genderGroups).map(([gender, stats]) => ({
        gender,
        owned: stats.owned,
        total: stats.total
    }))
}

/**
 * Calculate detailed fragment statistics including rarities, classes and genders
 */
function calculateFragmentDetailedStats(playerCharacters, allCharacters) {
    const fragments = [...new Set(allCharacters.map(char => char.fragment))]

    return fragments.map(fragment => {
        const fragmentChars = allCharacters.filter(char => char.fragment === fragment)
        const ownedFragmentChars = playerCharacters.filter(char => char.fragment === fragment)

        const rarities = calculateRarityStats(ownedFragmentChars, fragmentChars)
        const classes = calculateClassStats(ownedFragmentChars, fragmentChars)
        const genders = calculateGenderStats(ownedFragmentChars, fragmentChars)

        return {
            fragment,
            rarities,
            classes,
            genders,
            totalOwned: ownedFragmentChars.length,
            total: fragmentChars.length
        }
    })
}

export default PlayerStats