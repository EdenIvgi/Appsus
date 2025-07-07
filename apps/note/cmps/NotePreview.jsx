import { NoteTxt } from './NoteTxt.jsx'
import { NoteImg } from './NoteImg.jsx'
import { NoteTodos } from './NoteTodos.jsx'
import { NoteVideo } from './NoteVideo.jsx'
import { imageUploadService } from '../../../services/image-upload.service.js'

const { useState, useEffect, useRef } = React

export function NotePreview({ note, onRemoveNote, onTogglePin, onChangeNoteColor, onEditNote, onAddVideo }) {
    const [showColorPicker, setShowColorPicker] = useState(false)
    const colorPickerRef = useRef(null)
    const imageInputRef = useRef(null)
    
    useEffect(() => {
        function handleClickOutside(event) {
            if (colorPickerRef.current && !colorPickerRef.current.contains(event.target)) {
                setShowColorPicker(false)
            }
        }

        if (showColorPicker) {
            document.addEventListener('mousedown', handleClickOutside)
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside)
        }
    }, [showColorPicker])
    
    function DynamicNoteComponent({ note }) {
        switch (note.type) {
            case 'NoteTxt':
                return <NoteTxt info={note.info} />
            case 'NoteImg':
                return <NoteImg info={note.info} />
            case 'NoteTodos':
                return <NoteTodos info={note.info} />
            case 'NoteVideo':
                return <NoteVideo info={note.info} />
            default:
                return <div>Unknown note type</div>
        }
    }

    function onColorChange(color) {
        onChangeNoteColor(note.id, color)
        setShowColorPicker(false)
    }

    function handleNoteClick() {
        onEditNote(note)
    }

    function toggleColorPicker(e) {
        e.stopPropagation()
        setShowColorPicker(!showColorPicker)
    }

    function handleAddImage(e) {
        e.stopPropagation()
        if (imageInputRef.current) {
            imageInputRef.current.click()
        }
    }

    function handleImageUpload(event) {
        const file = event.target.files[0]
        if (!file) return

        imageUploadService.uploadImage(file)
            .then(imageData => {
                const updatedNote = {
                    ...note,
                    type: 'NoteImg',
                    info: {
                        ...note.info,
                        url: imageData.url,
                        title: note.info.title || ''
                    }
                }
                // Edit the note with the new image
                onEditNote(updatedNote)
            })
            .catch(error => {
                console.error('Error uploading image:', error)
                alert('Error uploading image: ' + error)
            })

        // Reset the input
        event.target.value = ''
    }

    // Google Keep inspired color palette
    const colors = [
        '#ffffff', // Default white
        '#fff475', // Yellow
        '#ffcc02', // Orange
        '#f28b82', // Red/Coral
        '#fdcfe8', // Pink
        '#d7aefb', // Purple
        '#cbf0f8', // Light Blue
        '#aecbfa', // Blue
        '#a7ffeb', // Teal
        '#ccff90', // Green
        '#e6c9a8', // Brown
        '#e8eaed'  // Gray
    ]

    return (
        <article 
            className="note-preview" 
            style={{ backgroundColor: (note.style && note.style.backgroundColor) || '#ffffff' }}
        >
            <div className="note-content" onClick={handleNoteClick}>
                <DynamicNoteComponent note={note} />
            </div>
            
            <div className="note-actions">
                <button 
                    className={`btn-pin ${note.isPinned ? 'pinned' : ''}`}
                    onClick={(e) => {
                        e.stopPropagation()
                        onTogglePin(note.id)
                    }}
                    title={note.isPinned ? 'Unpin note' : 'Pin note'}
                >
                    <span className="material-symbols-outlined">push_pin</span>
                </button>

                <button 
                    className="action-btn"
                    onClick={handleAddImage}
                    title="Add image"
                >
                    <span className="material-symbols-outlined">image</span>
                </button>

                <button 
                    className="action-btn"
                    onClick={(e) => {
                        e.stopPropagation()
                        onAddVideo()
                    }}
                    title="Add video"
                >
                    <span className="material-symbols-outlined">videocam</span>
                </button>

                <button 
                    className="action-btn"
                    onClick={(e) => {
                        e.stopPropagation()
                        // Add archive functionality later
                    }}
                    title="Archive"
                >
                    <span className="material-symbols-outlined">archive</span>
                </button>

                <div ref={colorPickerRef} className="color-picker-container">
                    <button 
                        className="action-btn"
                        onClick={toggleColorPicker}
                        title="Background options"
                    >
                        <span className="material-symbols-outlined">palette</span>
                    </button>

                    {showColorPicker && (
                        <div className="color-picker-popup">
                            {colors.map(color => (
                                <button
                                    key={color}
                                    className="color-btn-popup"
                                    style={{ backgroundColor: color }}
                                    onClick={(e) => {
                                        e.stopPropagation()
                                        onColorChange(color)
                                    }}
                                    title="Change color"
                                />
                            ))}
                        </div>
                    )}
                </div>

                <button 
                    className="action-btn"
                    onClick={(e) => {
                        e.stopPropagation()
                        // Add more options functionality later
                    }}
                    title="More"
                >
                    <span className="material-symbols-outlined">more_vert</span>
                </button>
                
                <button 
                    className="btn-remove"
                    onClick={(e) => {
                        e.stopPropagation()
                        onRemoveNote(note.id)
                    }}
                    title="Delete note"
                >
                    <span className="material-symbols-outlined">delete</span>
                </button>
            </div>

            {/* Hidden file input for image uploads */}
            <input
                ref={imageInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                style={{ display: 'none' }}
            />
        </article>
    )
} 