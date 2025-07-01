import { NotePreview } from './NotePreview.jsx'

export function NoteList({ notes, onRemoveNote, onTogglePin, onChangeNoteColor }) {
    if (!notes || notes.length === 0) {
        return <div className="note-list empty">No notes to display</div>
    }

    return (
        <div className="note-list">
            {notes.map(note => (
                <NotePreview 
                    key={note.id}
                    note={note}
                    onRemoveNote={onRemoveNote}
                    onTogglePin={onTogglePin}
                    onChangeNoteColor={onChangeNoteColor}
                />
            ))}
        </div>
    )
}
