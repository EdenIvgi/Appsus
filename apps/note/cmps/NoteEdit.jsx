const { useState, useEffect } = React

export function NoteEdit({ note, onSave, onCancel, onChange }) {
    const [noteToEdit, setNoteToEdit] = useState(note)

    useEffect(() => {
        setNoteToEdit(note)
    }, [note])

    useEffect(() => {
        if (onChange) {
            onChange(noteToEdit)
        }
    }, [noteToEdit, onChange])

    function handleTxtChange(ev) {
        const { value } = ev.target
        const updatedNote = {
            ...noteToEdit,
            info: { ...noteToEdit.info, txt: value }
        }
        setNoteToEdit(updatedNote)
    }

    function handleSave() {
        if (!noteToEdit.info.txt.trim()) {
            onCancel()
            return
        }
        onSave(noteToEdit)
    }

    function handleColorChange(color) {
        const updatedNote = {
            ...noteToEdit,
            style: { ...noteToEdit.style, backgroundColor: color }
        }
        setNoteToEdit(updatedNote)
    }

    function handleTogglePin() {
        const updatedNote = {
            ...noteToEdit,
            isPinned: !noteToEdit.isPinned
        }
        setNoteToEdit(updatedNote)
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
        <div className="note-edit-container">
            <div 
                className="note-edit"
                style={{ backgroundColor: (noteToEdit.style && noteToEdit.style.backgroundColor) || '#ffffff' }}
            >
                <textarea
                    className="note-edit-input"
                    placeholder="Take a note..."
                    value={noteToEdit.info.txt || ''}
                    onChange={handleTxtChange}
                    autoFocus
                />
                
                <div className="note-edit-actions">
                    <div className="note-edit-tools">
                        <button 
                            className={`btn-pin ${noteToEdit.isPinned ? 'pinned' : ''}`}
                            onClick={handleTogglePin}
                            title={noteToEdit.isPinned ? 'Unpin note' : 'Pin note'}
                        >
                            <span className="material-icons">push_pin</span>
                        </button>
                        
                        <div className="color-palette">
                            {colors.map(color => (
                                <button
                                    key={color}
                                    className="color-btn"
                                    style={{ backgroundColor: color }}
                                    onClick={() => handleColorChange(color)}
                                    title="Change color"
                                />
                            ))}
                        </div>
                    </div>
                    
                    <div className="note-edit-buttons">
                        <button className="btn-cancel" onClick={onCancel}>
                            Cancel
                        </button>
                        <button className="btn-save" onClick={handleSave}>
                            Save
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
} 