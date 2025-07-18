import { NoteTxt } from './NoteTxt.jsx'
import { NoteImg } from './NoteImg.jsx'
import { NoteTodos } from './NoteTodos.jsx'
import { NoteVideo } from './NoteVideo.jsx'
import { LabelPicker } from './LabelPicker.jsx'
import { LabelDisplay } from './LabelDisplay.jsx'
import { imageUploadService } from '../../../services/image-upload.service.js'

const { useState, useEffect, useRef, memo, useMemo, useCallback } = React

export const NotePreview = memo(function NotePreview({ note, onRemoveNote, onTogglePin, onChangeNoteColor, onEditNote, onAddVideo, onUpdateNote, onLabelsChange, onDuplicateNote, onRestoreNote, onArchiveNote, onTrashNote, onPermanentDeleteNote, currentStatus }) {
    const [showColorPicker, setShowColorPicker] = useState(false)
    const [showLabelPicker, setShowLabelPicker] = useState(false)
    const [showMoreMenu, setShowMoreMenu] = useState(false)
    const colorPickerRef = useRef(null)
    const labelPickerRef = useRef(null)
    const moreMenuRef = useRef(null)
    const imageInputRef = useRef(null)
    const notePreviewRef = useRef(null)
    const mouseLeaveTimeoutRef = useRef(null)
    
    useEffect(() => {
        function handleClickOutside(event) {
            // Close popups if clicking outside the entire note
            if (notePreviewRef.current && !notePreviewRef.current.contains(event.target)) {
                setShowColorPicker(false)
                setShowLabelPicker(false)
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

    // Cleanup timeout on unmount
    useEffect(() => {
        return () => {
            if (mouseLeaveTimeoutRef.current) {
                clearTimeout(mouseLeaveTimeoutRef.current)
            }
        }
    }, [])


    
    const handleTodoUpdate = useCallback((todoInfo) => {
        if (onUpdateNote) {
            const updatedNote = {
                ...note,
                info: { ...note.info, ...todoInfo }
            }
            onUpdateNote(updatedNote)
        }
    }, [note, onUpdateNote])

    // Memoize the note content to prevent re-rendering on state changes
    const noteContent = useMemo(() => {
        switch (note.type) {
            case 'NoteTxt':
                return <NoteTxt info={note.info} isPreview={true} />
            case 'NoteImg':
                return <NoteImg info={note.info} />
            case 'NoteTodos':
                return <NoteTodos info={note.info} onUpdate={currentStatus === 'active' ? handleTodoUpdate : null} isEditable={false} />
            case 'NoteVideo':
                return <NoteVideo info={note.info} />
            default:
                return <div>Unknown note type</div>
        }
    }, [note.type, note.info, currentStatus, handleTodoUpdate])

    const onColorChange = useCallback((colorValue) => {
        const actualColor = colorValue === 'default' ? '#ffffff' : colorValue
        onChangeNoteColor(note.id, actualColor)
        setShowColorPicker(false)
    }, [note.id, onChangeNoteColor])

    const handleNoteClick = useCallback(() => {
        // Only allow editing for active notes
        if (currentStatus === 'active') {
            onEditNote(note)
        }
    }, [currentStatus, note, onEditNote])

    const toggleColorPicker = useCallback((e) => {
        e.stopPropagation()
        setShowColorPicker(prev => !prev)
        setShowLabelPicker(false)
        setShowMoreMenu(false)
    }, [])

    const handleNoteMouseLeave = useCallback(() => {
        // Delay closing to allow mouse to move to color picker or label picker
        mouseLeaveTimeoutRef.current = setTimeout(() => {
            setShowColorPicker(false)
            setShowLabelPicker(false)
            setShowMoreMenu(false)
        }, 100)
    }, [])

    const handleNoteMouseEnter = useCallback(() => {
        // Cancel any pending close when mouse re-enters
        if (mouseLeaveTimeoutRef.current) {
            clearTimeout(mouseLeaveTimeoutRef.current)
            mouseLeaveTimeoutRef.current = null
        }
    }, [])

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

    function handleConvertToList(e) {
        e.stopPropagation()
        const updatedNote = {
            ...note,
            type: 'NoteTodos',
            info: {
                title: note.info.title || '',
                todos: note.info.txt ? [{ txt: note.info.txt, doneAt: null }] : []
            }
        }
        onEditNote(updatedNote)
    }

    const toggleMoreMenu = useCallback((e) => {
        e.stopPropagation()
        setShowMoreMenu(prev => !prev)
        setShowColorPicker(false)
        setShowLabelPicker(false)
    }, [])

    const handleShowLabelPicker = useCallback((e) => {
        e.stopPropagation()
        setShowLabelPicker(true)
        setShowMoreMenu(false)
        setShowColorPicker(false)
    }, [])

    const handleLabelsChange = useCallback((newLabels) => {
        if (onLabelsChange) {
            onLabelsChange(note.id, newLabels)
        }
    }, [note.id, onLabelsChange])

    return (
        <article 
            ref={notePreviewRef}
            className={`note-preview ${showColorPicker || showLabelPicker ? 'color-picker-active' : ''} ${showMoreMenu ? 'more-menu-active' : ''}`}
            style={{ backgroundColor: (note.style && note.style.backgroundColor) || '#ffffff' }}
            onMouseLeave={handleNoteMouseLeave}
            onMouseEnter={handleNoteMouseEnter}
        >
            {/* Pin button in top-right corner - only for active notes */}
            {currentStatus === 'active' && (
                <button 
                    className={`btn-pin-corner ${note.isPinned ? 'pinned' : ''}`}
                    onClick={(e) => {
                        e.stopPropagation()
                        onTogglePin(note.id)
                    }}
                    title={note.isPinned ? 'Unpin note' : 'Pin note'}
                >
                    <span className="material-symbols-outlined">push_pin</span>
                </button>
            )}

            <div className="note-content" onClick={handleNoteClick}>
                {noteContent}
                
                {/* Display labels */}
                {note.labels && note.labels.length > 0 && (
                    <div className="note-labels">
                        {note.labels.map(labelId => (
                            <LabelDisplay 
                                key={labelId} 
                                labelId={labelId} 
                                noteColor={(note.style && note.style.backgroundColor) || '#ffffff'}
                            />
                        ))}
                    </div>
                )}
            </div>
            
            <div className="note-actions">
                {/* Only show action buttons for active notes */}
                {currentStatus === 'active' && (
                    <div className="active-note-actions">
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

                        {/* Only show list button for non-todo notes */}
                        {note.type !== 'NoteTodos' && (
                            <button 
                                className="action-btn"
                                onClick={handleConvertToList}
                                title="Convert to list"
                            >
                                <span className="material-symbols-outlined">checklist</span>
                            </button>
                        )}

                        <button 
                            className="action-btn"
                            onClick={(e) => {
                                e.stopPropagation()
                                if (onArchiveNote) {
                                    onArchiveNote(note.id)
                                }
                            }}
                            title="Archive"
                        >
                            <span className="material-symbols-outlined">archive</span>
                        </button>

                        <button 
                            className="action-btn"
                            onClick={(e) => {
                                e.stopPropagation()
                                if (onTrashNote) {
                                    onTrashNote(note.id)
                                }
                            }}
                            title="Move to trash"
                        >
                            <span className="material-symbols-outlined">delete</span>
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
                                <div 
                                    className="color-picker-popup"
                                    onMouseEnter={handleNoteMouseEnter}
                                    onMouseLeave={handleNoteMouseLeave}
                                >
                                    {colors.map(colorObj => (
                                        <button
                                            key={colorObj.value}
                                            type="button"
                                            className={`color-btn-popup ${colorObj.value === 'default' ? 'default-color' : ''}`}
                                            style={{ backgroundColor: colorObj.value === 'default' ? '#ffffff' : colorObj.value }}
                                            onClick={(e) => {
                                                e.stopPropagation()
                                                onColorChange(colorObj.value)
                                            }}
                                            title={colorObj.name}
                                        />
                                    ))}
                                </div>
                            )}
                        </div>

                        {showLabelPicker && (
                            <div ref={labelPickerRef} className="label-picker-container">
                                <LabelPicker
                                    selectedLabels={note.labels || []}
                                    onLabelsChange={handleLabelsChange}
                                    onClose={() => setShowLabelPicker(false)}
                                    onMouseEnter={handleNoteMouseEnter}
                                    onMouseLeave={handleNoteMouseLeave}
                                />
                            </div>
                        )}

                        <div ref={moreMenuRef} className="more-menu-container">
                            <button 
                                className="action-btn"
                                onClick={toggleMoreMenu}
                                title="More"
                            >
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
                                    <button 
                                        className="more-menu-item"
                                        onClick={(e) => {
                                            e.stopPropagation()
                                            setShowMoreMenu(false)
                                            if (onDuplicateNote) {
                                                onDuplicateNote(note.id)
                                            }
                                        }}
                                    >
                                        <span className="material-symbols-outlined">content_copy</span>
                                        Duplicate
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                )}
                
                {/* Show restore button for archived/trashed notes */}
                {currentStatus === 'archived' || currentStatus === 'trashed' ? (
                    <button 
                        className="action-btn"
                        onClick={(e) => {
                            e.stopPropagation()
                            onRestoreNote(note.id)
                        }}
                        title="Restore note"
                    >
                        <span className="material-symbols-outlined">restore</span>
                    </button>
                ) : null}
                
                {/* Only show delete button in trash view */}
                {currentStatus === 'trashed' && (
                    <button 
                        className="btn-remove"
                        onClick={(e) => {
                            e.stopPropagation()
                            if (onPermanentDeleteNote) {
                                onPermanentDeleteNote(note.id)
                            }
                        }}
                        title="Delete permanently"
                    >
                        <span className="material-symbols-outlined">delete_forever</span>
                    </button>
                )}
            </div>

            <input
                ref={imageInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                style={{ display: 'none' }}
            />
        </article>
    )
}) 