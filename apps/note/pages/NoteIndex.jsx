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
            <h1>Notes</h1>
            <NoteList 
                notes={notes}
                onRemoveNote={onRemoveNote}
                onTogglePin={onTogglePin}
                onChangeNoteColor={onChangeNoteColor}
            />
        </section>
    )
}
