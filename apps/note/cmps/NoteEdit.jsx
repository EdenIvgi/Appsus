import { imageUploadService } from '../../../services/image-upload.service.js'

const { useState, useEffect, useRef } = React

export function NoteEdit({ note, onSave, onCancel, onChange }) {
    const [noteToEdit, setNoteToEdit] = useState(note)
    const [showColorPicker, setShowColorPicker] = useState(false)
    const colorPickerRef = useRef(null)
    const imageInputRef = useRef(null)

    useEffect(() => {
        setNoteToEdit(note)
    }, [note])

    useEffect(() => {
        if (onChange) {
            onChange(noteToEdit)
        }
    }, [noteToEdit])

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

    function handleTxtChange(ev) {
        const { value } = ev.target
        const updatedNote = {
            ...noteToEdit,
            info: { ...noteToEdit.info, txt: value }
        }
        setNoteToEdit(updatedNote)
    }

    function handleSave() {
        // For image notes, save even without text
        if (noteToEdit.type === 'NoteImg' && noteToEdit.info.url) {
            onSave(noteToEdit)
            return
        }
        
        // For text notes, require some content
        if (!noteToEdit.info.txt || !noteToEdit.info.txt.trim()) {
            onCancel()
            return
        }
        onSave(noteToEdit)
    }

    function handleCancel() {
        onCancel()
    }

    function handleColorChange(color) {
        const updatedNote = {
            ...noteToEdit,
            style: { ...noteToEdit.style, backgroundColor: color }
        }
        setNoteToEdit(updatedNote)
        setShowColorPicker(false)
    }

    function toggleColorPicker() {
        setShowColorPicker(!showColorPicker)
    }

    function handleTogglePin() {
        const updatedNote = {
            ...noteToEdit,
            isPinned: !noteToEdit.isPinned
        }
        setNoteToEdit(updatedNote)
    }

    function handleBackdropClick(e) {
        if (e.target === e.currentTarget) {
            handleSave() // Auto-save when clicking outside
        }
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

    function handleAddImage() {
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
                    ...noteToEdit,
                    type: 'NoteImg',
                    info: {
                        ...noteToEdit.info,
                        url: imageData.url,
                        title: noteToEdit.info.title || ''
                    }
                }
                setNoteToEdit(updatedNote)
            })
            .catch(error => {
                console.error('Error uploading image:', error)
                alert('Error uploading image: ' + error)
            })

        // Reset the input
        event.target.value = ''
    }

    // Format last edited time (you can enhance this with actual timestamp)
    const formatEditTime = () => {
        const now = new Date()
        return `Edited ${now.toLocaleDateString()} ${now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
    }

    return (
        <div className="note-edit-modal-backdrop" onClick={handleBackdropClick}>
            <div className="note-edit-modal">
                <div 
                    className="note-edit-modal-content"
                    style={{ backgroundColor: (noteToEdit.style && noteToEdit.style.backgroundColor) || '#ffffff' }}
                >
                    {/* Header with pin button */}
                    <div className="note-edit-header">
                        <input
                            className="note-title-input"
                            placeholder="Title"
                            value={noteToEdit.info.title || ''}
                            onChange={(e) => setNoteToEdit({
                                ...noteToEdit,
                                info: { ...noteToEdit.info, title: e.target.value }
                            })}
                        />
                        <button 
                            className={`btn-pin-modal ${noteToEdit.isPinned ? 'pinned' : ''}`}
                            onClick={handleTogglePin}
                            title={noteToEdit.isPinned ? 'Unpin note' : 'Pin note'}
                        >
                            <span className="material-icons">push_pin</span>
                        </button>
                    </div>

                    {/* Main content area */}
                    {noteToEdit.type === 'NoteImg' && noteToEdit.info.url && (
                        <div className="note-edit-image-container">
                            <img 
                                src={noteToEdit.info.url.startsWith('assets/img/') ? 
                                    JSON.parse(localStorage.getItem('imageStore') || '{}')[noteToEdit.info.url.split('/').pop()] || noteToEdit.info.url 
                                    : noteToEdit.info.url
                                } 
                                alt={noteToEdit.info.title || 'Note image'}
                                className="note-edit-image"
                            />
                        </div>
                    )}
                    
                    <textarea
                        className="note-edit-textarea"
                        placeholder={noteToEdit.type === 'NoteImg' ? 'Add a description...' : 'Take a note...'}
                        value={noteToEdit.info.txt || ''}
                        onChange={handleTxtChange}
                        autoFocus={noteToEdit.type !== 'NoteImg'}
                    />

                    {/* Edit timestamp */}
                    <div className="note-edit-timestamp">
                        {formatEditTime()}
                    </div>
                    
                    {/* Action bar */}
                    <div className="note-edit-toolbar">
                        <div className="note-edit-tools">
                            <div ref={colorPickerRef} className="color-picker-container-modal">
                                <button className="tool-btn" onClick={toggleColorPicker} title="Background options">
                                    <span className="material-icons">palette</span>
                                </button>
                                {showColorPicker && (
                                    <div className="color-picker-modal-popup">
                                        {colors.map(color => (
                                            <button
                                                key={color}
                                                className="color-btn-modal-popup"
                                                style={{ backgroundColor: color }}
                                                onClick={() => handleColorChange(color)}
                                                title="Change color"
                                            />
                                        ))}
                                    </div>
                                )}
                            </div>
                            <button className="tool-btn" onClick={handleAddImage} title="Add image">
                                <span className="material-icons">image</span>
                            </button>
                            <button className="tool-btn" title="Archive">
                                <span className="material-icons">archive</span>
                            </button>
                            <button className="tool-btn" title="More">
                                <span className="material-icons">more_vert</span>
                            </button>
                            <button className="tool-btn" title="Undo">
                                <span className="material-icons">undo</span>
                            </button>
                            <button className="tool-btn" title="Redo">
                                <span className="material-icons">redo</span>
                            </button>
                        </div>
                        
                        <button className="btn-close" onClick={handleSave}>
                            Close
                        </button>
                    </div>
                </div>
            </div>

            {/* Hidden file input for image uploads */}
            <input
                ref={imageInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                style={{ display: 'none' }}
            />
        </div>
    )
} 