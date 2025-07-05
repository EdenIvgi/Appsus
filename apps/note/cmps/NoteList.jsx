import { NotePreview } from './NotePreview.jsx'

export function NoteList({ notes, onRemoveNote, onTogglePin, onChangeNoteColor, onEditNote, onAddVideo }) {
    if (!notes || notes.length === 0) {
        return <div className="note-list empty">No notes to display</div>
    }

    // Separate pinned and unpinned notes
    const pinnedNotes = notes.filter(note => note.isPinned)
    const otherNotes = notes.filter(note => !note.isPinned)

    return (
        <div className="note-list-container">
            {/* Pinned Notes Section */}
            {pinnedNotes.length > 0 && (
                <div className="note-section">
                    <div className="section-label">PINNED</div>
                    <div className="note-list">
                        {pinnedNotes.map((note, index) => (
                            <NotePreview 
                                key={note.id}
                                note={note}
                                onRemoveNote={onRemoveNote}
                                onTogglePin={onTogglePin}
                                onChangeNoteColor={onChangeNoteColor}
                                onEditNote={onEditNote}
                                onAddVideo={onAddVideo}
                            />
                        ))}
                    </div>
                </div>
            )}

            {/* Other Notes Section */}
            {otherNotes.length > 0 && (
                <div className="note-section">
                    {pinnedNotes.length > 0 && <div className="section-label">OTHERS</div>}
                    <div className="note-list">
                        {otherNotes.map((note, index) => (
                            <NotePreview 
                                key={note.id}
                                note={note}
                                onRemoveNote={onRemoveNote}
                                onTogglePin={onTogglePin}
                                onChangeNoteColor={onChangeNoteColor}
                                onEditNote={onEditNote}
                                onAddVideo={onAddVideo}
                            />
                        ))}
                    </div>
                </div>
            )}
        </div>
    )
}
