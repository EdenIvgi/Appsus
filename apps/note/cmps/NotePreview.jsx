import { NoteTxt } from './NoteTxt.jsx'

export function NotePreview({ note, onRemoveNote, onTogglePin, onChangeNoteColor, onEditNote }) {
    console.log('NotePreview rendering note:', note)
    
    function DynamicNoteComponent({ note }) {
        console.log('DynamicNoteComponent note type:', note.type)
        console.log('DynamicNoteComponent note info:', note.info)
        
        switch (note.type) {
            case 'NoteTxt':
                return <NoteTxt info={note.info} />
            default:
                console.log('Unknown note type:', note.type)
                return <div>Unknown note type</div>
        }
    }

    function onColorChange(color) {
        onChangeNoteColor(note.id, color)
    }

    function handleNoteClick() {
        onEditNote(note)
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
                    <span className="material-icons">push_pin</span>
                </button>
                
                <div className="color-palette">
                    {colors.map(color => (
                        <button
                            key={color}
                            className="color-btn"
                            style={{ backgroundColor: color }}
                            onClick={(e) => {
                                e.stopPropagation()
                                onColorChange(color)
                            }}
                            title="Change color"
                        />
                    ))}
                </div>
                
                <button 
                    className="btn-remove"
                    onClick={(e) => {
                        e.stopPropagation()
                        onRemoveNote(note.id)
                    }}
                    title="Delete note"
                >
                    <span className="material-icons">delete</span>
                </button>
            </div>
        </article>
    )
} 