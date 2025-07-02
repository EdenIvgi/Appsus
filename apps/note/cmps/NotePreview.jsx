import { NoteTxt } from './NoteTxt.jsx'

export function NotePreview({ note, onRemoveNote, onTogglePin, onChangeNoteColor }) {
    
    function DynamicNoteComponent({ note }) {
        switch (note.type) {
            case 'NoteTxt':
                return <NoteTxt info={note.info} />
            // Future note types can be added here
            // case 'NoteImg':
            //     return <NoteImg info={note.info} />
            // case 'NoteTodos':
            //     return <NoteTodos info={note.info} />
            default:
                return <div>Unknown note type</div>
        }
    }

    function onColorChange(color) {
        onChangeNoteColor(note.id, color)
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
            <div className="note-content">
                <DynamicNoteComponent note={note} />
            </div>
            
            <div className="note-actions">
                <button 
                    className={`btn-pin ${note.isPinned ? 'pinned' : ''}`}
                    onClick={() => onTogglePin(note.id)}
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
                            onClick={() => onColorChange(color)}
                            title="Change color"
                        />
                    ))}
                </div>
                
                <button 
                    className="btn-remove"
                    onClick={() => onRemoveNote(note.id)}
                    title="Delete note"
                >
                    <span className="material-icons">delete</span>
                </button>
            </div>
        </article>
    )
} 