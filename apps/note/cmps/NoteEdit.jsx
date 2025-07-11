import { imageUploadService } from '../../../services/image-upload.service.js'
import { NoteVideo } from './NoteVideo.jsx'
import { NoteTodos } from './NoteTodos.jsx'
import { LabelPicker } from './LabelPicker.jsx'

const { useState, useEffect, useRef } = React

export function NoteEdit({ note, onSave, onCancel, onChange }) {
    const [noteToEdit, setNoteToEdit] = useState(note)
    const [showColorPicker, setShowColorPicker] = useState(false)
    const [showLabelPicker, setShowLabelPicker] = useState(false)
    const [showMoreMenu, setShowMoreMenu] = useState(false)
    const colorPickerRef = useRef(null)
    const labelPickerRef = useRef(null)
    const moreMenuRef = useRef(null)
    const imageInputRef = useRef(null)

    useEffect(() => {
        console.log('🎨 NOTE EDIT COMPONENT - Received note:', note)
        console.log('📋 Note type:', note && note.type)
        console.log('📝 Note info:', note && note.info)
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
            if (labelPickerRef.current && !labelPickerRef.current.contains(event.target)) {
                setShowLabelPicker(false)
            }
            if (moreMenuRef.current && !moreMenuRef.current.contains(event.target)) {
                setShowMoreMenu(false)
            }
        }

        if (showColorPicker || showLabelPicker || showMoreMenu) {
            document.addEventListener('mousedown', handleClickOutside)
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside)
        }
    }, [showColorPicker, showLabelPicker, showMoreMenu])

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
        
        // For video notes, save even without text if there's a URL
        if (noteToEdit.type === 'NoteVideo' && noteToEdit.info.url) {
            onSave(noteToEdit)
            return
        }
        
        // For todo notes, always save (like Google Keep does)
        if (noteToEdit.type === 'NoteTodos') {
            console.log('💾 SAVING TODO NOTE:', noteToEdit)
            console.log('📋 Todo info:', noteToEdit.info)
            console.log('📝 Title:', noteToEdit.info.title)
            console.log('✅ Todos:', noteToEdit.info.todos)
            
            // Ensure there's always at least an empty structure
            let todoToSave = { ...noteToEdit }
            if (!todoToSave.info.todos) {
                todoToSave.info.todos = []
            }
            if (!todoToSave.info.title) {
                todoToSave.info.title = ''
            }
            
            console.log('✅ Saving todo note with structure:', todoToSave)
            onSave(todoToSave)
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

    function handleColorChange(colorValue) {
        const actualColor = colorValue === 'default' ? '#ffffff' : colorValue
        const updatedNote = {
            ...noteToEdit,
            style: { ...(noteToEdit.style || {}), backgroundColor: actualColor }
        }
        setNoteToEdit(updatedNote)
        setShowColorPicker(false)
    }

    function toggleColorPicker() {
        setShowColorPicker(!showColorPicker)
        setShowLabelPicker(false)
        setShowMoreMenu(false)
    }

    function toggleMoreMenu() {
        setShowMoreMenu(!showMoreMenu)
        setShowColorPicker(false)
        setShowLabelPicker(false)
    }

    function handleShowLabelPicker() {
        setShowLabelPicker(true)
        setShowMoreMenu(false)
        setShowColorPicker(false)
    }

    function handleLabelsChange(newLabels) {
        setNoteToEdit({
            ...noteToEdit,
            labels: newLabels
        })
    }

    function handleTogglePin() {
        const updatedNote = {
            ...noteToEdit,
            isPinned: !noteToEdit.isPinned
        }
        setNoteToEdit(updatedNote)
    }

    function handleTodoUpdate(todoInfo) {
        const updatedNote = {
            ...noteToEdit,
            info: { ...noteToEdit.info, ...todoInfo }
        }
        setNoteToEdit(updatedNote)
    }

    function handleBackdropClick(e) {
        if (e.target === e.currentTarget) {
            handleSave() // Auto-save when clicking outside
        }
    }

    // Google Keep exact color palette with names
    const colors = [
        { value: 'default', name: 'Default' },
        { value: '#faafa9', name: 'Coral' },
        { value: '#f29f75', name: 'Peach' },
        { value: '#fff8b9', name: 'Sand' },
        { value: '#e2f6d3', name: 'Mint' },
        { value: '#b4ded4', name: 'Sage' },
        { value: '#d3e4ec', name: 'Fog' },
        { value: '#afccdc', name: 'Storm' },
        { value: '#d3bedb', name: 'Dusk' },
        { value: '#f5e2dc', name: 'Blossom' },
        { value: '#e9e3d3', name: 'Clay' },
        { value: '#efeff1', name: 'Chalk' }
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
                        {/* Only show title input for non-todo notes */}
                        {noteToEdit.type !== 'NoteTodos' && (
                            <input
                                className="note-title-input"
                                placeholder="Title"
                                value={noteToEdit.info.title || ''}
                                onChange={(e) => setNoteToEdit({
                                    ...noteToEdit,
                                    info: { ...noteToEdit.info, title: e.target.value }
                                })}
                            />
                        )}
                        <button 
                            className={`btn-pin-modal ${noteToEdit.isPinned ? 'pinned' : ''}`}
                            onClick={handleTogglePin}
                            title={noteToEdit.isPinned ? 'Unpin note' : 'Pin note'}
                        >
                            <span className="material-symbols-outlined">push_pin</span>
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

                    {/* Video URL input for video notes */}
                    {noteToEdit.type === 'NoteVideo' && (
                        <div className="note-edit-video-container">
                            <input
                                className="note-video-url-input"
                                placeholder="Enter video URL..."
                                value={noteToEdit.info.url || ''}
                                onChange={(e) => setNoteToEdit({
                                    ...noteToEdit,
                                    info: { ...noteToEdit.info, url: e.target.value }
                                })}
                                autoFocus
                            />
                            {noteToEdit.info.url && (
                                <div className="note-edit-video-preview">
                                    <NoteVideo info={noteToEdit.info} />
                                </div>
                            )}
                        </div>
                    )}

                    {/* Todo list for todo notes */}
                    {noteToEdit.type === 'NoteTodos' && (
                        <div className="note-edit-todos-container">
                            <NoteTodos 
                                info={noteToEdit.info} 
                                onUpdate={handleTodoUpdate} 
                                isEditable={true} 
                            />
                        </div>
                    )}
                    
                    {/* Only show textarea for non-todo notes */}
                    {noteToEdit.type !== 'NoteTodos' && (
                        <textarea
                            className="note-edit-textarea"
                            placeholder={
                                noteToEdit.type === 'NoteImg' ? 'Add a description...' : 
                                noteToEdit.type === 'NoteVideo' ? 'Add a description...' : 
                                'Take a note...'
                            }
                            value={noteToEdit.info.txt || ''}
                            onChange={handleTxtChange}
                            autoFocus={noteToEdit.type !== 'NoteImg' && noteToEdit.type !== 'NoteVideo'}
                        />
                    )}

                    {/* Edit timestamp */}
                    <div className="note-edit-timestamp">
                        {formatEditTime()}
                    </div>
                    
                    {/* Action bar */}
                    <div className="note-edit-toolbar">
                        <div className="note-edit-tools">
                            <div ref={colorPickerRef} className="color-picker-container-modal">
                                <button className="tool-btn" onClick={toggleColorPicker} title="Background options">
                                    <span className="material-symbols-outlined">palette</span>
                                </button>
                                {showColorPicker && (
                                    <div className="color-picker-modal-popup">
                                        {colors.map(colorObj => (
                                            <button
                                                key={colorObj.value}
                                                type="button"
                                                className={`color-btn-modal-popup ${colorObj.value === 'default' ? 'default-color' : ''}`}
                                                style={{ backgroundColor: colorObj.value === 'default' ? '#ffffff' : colorObj.value }}
                                                onClick={() => handleColorChange(colorObj.value)}
                                                title={colorObj.name}
                                            />
                                        ))}
                                    </div>
                                )}
                            </div>
                            <button className="tool-btn" onClick={handleAddImage} title="Add image">
                                <span className="material-symbols-outlined">image</span>
                            </button>
                            <button className="tool-btn" title="Archive">
                                <span className="material-symbols-outlined">archive</span>
                            </button>
                            
                            <div ref={moreMenuRef} className="more-menu-container">
                                <button className="tool-btn" onClick={toggleMoreMenu} title="More">
                                    <span className="material-symbols-outlined">more_vert</span>
                                </button>
                                {showMoreMenu && (
                                    <div className="more-menu-popup">
                                        <button 
                                            className="more-menu-item"
                                            onClick={handleShowLabelPicker}
                                        >
                                            <span className="material-symbols-outlined">label</span>
                                            Add label
                                        </button>
                                        <button className="more-menu-item">
                                            <span className="material-symbols-outlined">archive</span>
                                            Archive
                                        </button>
                                    </div>
                                )}
                            </div>
                            <button className="tool-btn" title="Undo">
                                <span className="material-symbols-outlined">undo</span>
                            </button>
                            <button className="tool-btn" title="Redo">
                                <span className="material-symbols-outlined">redo</span>
                            </button>
                        </div>
                        
                        <button className="btn-close" onClick={handleSave}>
                            Close
                        </button>
                    </div>

                    {/* Label Picker */}
                    {showLabelPicker && (
                        <div ref={labelPickerRef} className="label-picker-container">
                            <LabelPicker
                                selectedLabels={noteToEdit.labels || []}
                                onLabelsChange={handleLabelsChange}
                                onClose={() => setShowLabelPicker(false)}
                            />
                        </div>
                    )}
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