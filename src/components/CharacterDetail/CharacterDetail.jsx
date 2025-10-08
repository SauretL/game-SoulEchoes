import { useState } from 'react'
import './CharacterDetail.css'

function CharacterDetail({ character, onClose }) {
    const [activeTab, setActiveTab] = useState('general')
    const [currentImageIndex, setCurrentImageIndex] = useState(0)

    if (!character) return null

    const nextImage = () => {
        setCurrentImageIndex((prev) =>
            prev < (character.images?.length - 1) ? prev + 1 : 0
        )
    }

    const prevImage = () => {
        setCurrentImageIndex((prev) =>
            prev > 0 ? prev - 1 : (character.images?.length - 1)
        )
    }

    return (
        <div className="character-detail-overlay">
            <div className="character-detail-container">
                {/* Header */}
                <div className="detail-header">
                    <h1>{character.name}</h1>
                    <button className="close-button" onClick={onClose}>×</button>
                </div>

                <div className="detail-content">
                    {/* Image Gallery */}
                    <div className="image-section">
                        <div className="main-image-container">
                            <img
                                src={character.images?.[currentImageIndex]}
                                alt={character.name}
                                className="main-image"
                            />
                            {character.images?.length > 1 && (
                                <>
                                    <button className="image-nav prev" onClick={prevImage}>‹</button>
                                    <button className="image-nav next" onClick={nextImage}>›</button>
                                    <div className="image-counter">
                                        {currentImageIndex + 1} / {character.images.length}
                                    </div>
                                </>
                            )}
                        </div>
                    </div>

                    {/* Info Section */}
                    <div className="info-section">
                        {/* Tabs */}
                        <div className="tabs">
                            {['general', 'quotes', 'story', 'gallery', 'skills', 'equipment'].map(tab => (
                                <button
                                    key={tab}
                                    className={`tab-button ${activeTab === tab ? 'active' : ''}`}
                                    onClick={() => setActiveTab(tab)}
                                >
                                    {tab === 'general' && 'General'}
                                    {tab === 'quotes' && 'Frases'}
                                    {tab === 'story' && 'Historia'}
                                    {tab === 'gallery' && 'Galería'}
                                    {tab === 'skills' && 'Habilidades'}
                                    {tab === 'equipment' && 'Equipamiento'}
                                </button>
                            ))}
                        </div>

                        {/* Tab Content */}
                        <div className="tab-content">
                            {/* General Tab */}
                            {activeTab === 'general' && (
                                <div className="general-info">
                                    <p><strong>Epitafio:</strong> {character.epitaph}</p>
                                    <p><strong>Rareza:</strong> {character.rarity}</p>
                                    <p><strong>Clase:</strong> {character.class}</p>
                                    <p><strong>Fragmento:</strong> {character.fragment}</p>
                                    <p><strong>Género:</strong> {character.gender}</p>
                                    <p><strong>Edad:</strong> {character.age}</p>
                                    <p><strong>Cumpleaños:</strong> {character.birthday}</p>
                                    <p><strong>Gustos:</strong> {character.likes}</p>
                                    <p><strong>Disgustos:</strong> {character.dislikes}</p>
                                    <p><strong>Comida favorita:</strong> {character.favoriteFood}</p>
                                    <p><strong>Hobbies:</strong> {character.hobbies}</p>
                                </div>
                            )}

                            {/* Quotes Tab */}
                            {activeTab === 'quotes' && (
                                <div className="quotes-info">
                                    <h3>Frases</h3>
                                    {character.quotes?.map((quote, index) => (
                                        quote && <p key={index}>"{quote}"</p>
                                    ))}

                                    <h3>Frases de Cumpleaños</h3>
                                    <p><strong>Propio:</strong> {character.birthdayQuoteSelf}</p>
                                    <p><strong>Al Jugador:</strong> {character.birthdayQuotePlayer}</p>

                                    <h3>Opiniones</h3>
                                    {character.opinions?.map((opinion, index) => (
                                        opinion && <p key={index}>{opinion}</p>
                                    ))}

                                    <h3>Frases sobre Fragmentos</h3>
                                    {character.fragments && Object.entries(character.fragments).map(([key, value]) => (
                                        value && <p key={key}><strong>{key}:</strong> {value}</p>
                                    ))}
                                </div>
                            )}

                            {/* Story Tab */}
                            {activeTab === 'story' && (
                                <div className="story-info">
                                    {character.stories?.map((story, index) => (
                                        story && (
                                            <div key={index} className="story-section">
                                                <h3>Historia {index + 1}</h3>
                                                <p>{story}</p>
                                            </div>
                                        )
                                    ))}
                                </div>
                            )}

                            {/* Gallery Tab */}
                            {activeTab === 'gallery' && (
                                <div className="gallery-info">
                                    <div className="gallery-grid">
                                        {character.images?.map((image, index) => (
                                            image && (
                                                <img
                                                    key={index}
                                                    src={image}
                                                    alt={`${character.name} ${index + 1}`}
                                                    className={`gallery-thumbnail ${currentImageIndex === index ? 'active' : ''}`}
                                                    onClick={() => setCurrentImageIndex(index)}
                                                />
                                            )
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Skills Tab */}
                            {activeTab === 'skills' && (
                                <div className="skills-info">
                                    {character.skillsNames?.map((skillName, index) => (
                                        skillName && (
                                            <div key={index} className="skill-section">
                                                <h3>{skillName}</h3>
                                                <p>{character.skillsDescriptions?.[index]}</p>
                                            </div>
                                        )
                                    ))}
                                </div>
                            )}

                            {/* Equipment Tab */}
                            {activeTab === 'equipment' && (
                                <div className="equipment-info">
                                    {character.equipmentNames?.map((equipName, index) => (
                                        equipName && (
                                            <div key={index} className="equipment-section">
                                                <h3>{equipName}</h3>
                                                <p>{character.equipmentDescriptions?.[index]}</p>
                                            </div>
                                        )
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div >
    )
}

export default CharacterDetail