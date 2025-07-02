import { NotePreview } from './NotePreview.jsx'

export function NoteList({ notes, onRemoveNote, onTogglePin, onChangeNoteColor, onEditNote }) {
    console.log('NoteList received notes:', notes.length)
    console.log('NoteList notes array:', notes)

    if (!notes || notes.length === 0) {
        return <div className="note-list empty">No notes to display</div>
    }

    return (
        <div className="note-list">
            {notes.map((note, index) => {
                console.log(`Rendering note ${index}:`, note)
                return (
                    <NotePreview 
                        key={note.id}
                        note={note}
                        onRemoveNote={onRemoveNote}
                        onTogglePin={onTogglePin}
                        onChangeNoteColor={onChangeNoteColor}
                        onEditNote={onEditNote}
                    />
                )
            })}
        </div>
    )
}
