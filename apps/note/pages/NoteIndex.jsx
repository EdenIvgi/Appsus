const { useState, useEffect } = React

import { noteService } from '../services/note.service.js'
import { NoteList } from '../cmps/NoteList.jsx'

export function NoteIndex() {
    const [notes, setNotes] = useState([])
    const [filterBy, setFilterBy] = useState(noteService.getDefaultFilter())

    useEffect(() => {
        loadNotes()
    }, [filterBy])

    function loadNotes() {
        noteService.query(filterBy)
            .then(notes => setNotes(notes))
            .catch(err => console.log('Error loading notes:', err))
    }

    function onRemoveNote(noteId) {
        noteService.remove(noteId)
            .then(() => {
                setNotes(prevNotes => prevNotes.filter(note => note.id !== noteId))
            })
            .catch(err => console.log('Error removing note:', err))
    }

    function onUpdateNote(noteToUpdate) {
        noteService.save(noteToUpdate)
            .then(savedNote => {
                setNotes(prevNotes => 
                    prevNotes.map(note => 
                        note.id === savedNote.id ? savedNote : note
                    )
                )
            })
            .catch(err => console.log('Error updating note:', err))
    }

    function onTogglePin(noteId) {
        const noteToUpdate = notes.find(note => note.id === noteId)
        if (noteToUpdate) {
            const updatedNote = { ...noteToUpdate, isPinned: !noteToUpdate.isPinned }
            onUpdateNote(updatedNote)
        }
    }

    function onChangeNoteColor(noteId, backgroundColor) {
        const noteToUpdate = notes.find(note => note.id === noteId)
        if (noteToUpdate) {
            const updatedNote = { 
                ...noteToUpdate, 
                style: { ...noteToUpdate.style, backgroundColor } 
            }
            onUpdateNote(updatedNote)
        }
    }

    return (
        <section className="note-index">
            <aside className="note-sidebar">
                <nav className="sidebar-nav">
                    <div className="nav-item active">
                        <span className="material-icons nav-icon">lightbulb_outline</span>
                        <span className="nav-text">Notes</span>
                    </div>
                    <div className="nav-item">
                        <span className="material-icons nav-icon">notifications</span>
                        <span className="nav-text">Reminders</span>
                    </div>
                    <div className="nav-item">
                        <span className="material-icons nav-icon">edit</span>
                        <span className="nav-text">Edit labels</span>
                    </div>
                    <div className="nav-item">
                        <span className="material-icons nav-icon">archive</span>
                        <span className="nav-text">Archive</span>
                    </div>
                    <div className="nav-item">
                        <span className="material-icons nav-icon">delete</span>
                        <span className="nav-text">Bin</span>
                    </div>
                </nav>
            </aside>
            
            <main className="note-main">
                <div className="note-input-container">
                    <div className="note-input">
                        <span className="input-placeholder">Take a note...</span>
                        <div className="input-actions">
                            <button className="input-action-btn" title="New note with image">
                                <span className="material-icons">add_a_photo</span>
                            </button>
                            <button className="input-action-btn" title="New note with drawing">
                                <span className="material-icons">brush</span>
                            </button>
                            <button className="input-action-btn" title="More">
                                <span className="material-icons">more_vert</span>
                            </button>
                        </div>
                    </div>
                </div>
                
                <NoteList 
                    notes={notes}
                    onRemoveNote={onRemoveNote}
                    onTogglePin={onTogglePin}
                    onChangeNoteColor={onChangeNoteColor}
                />
            </main>
        </section>
    )
}
