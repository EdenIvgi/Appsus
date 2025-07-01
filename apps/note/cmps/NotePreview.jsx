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

    const colors = ['#ffffff', '#ffeb3b', '#ff9800', '#f44336', '#e91e63', '#9c27b0', '#673ab7', '#3f51b5', '#2196f3', '#00bcd4', '#009688', '#4caf50']

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
                    📌
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
                    🗑️
                </button>
            </div>
        </article>
    )
} 