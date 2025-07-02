const { useState, useEffect, useRef } = React

import { noteService } from '../services/note.service.js'
import { NoteList } from '../cmps/NoteList.jsx'
import { NoteEdit } from '../cmps/NoteEdit.jsx'

export function NoteIndex() {
    const [notes, setNotes] = useState([])
    const [filterBy, setFilterBy] = useState(noteService.getDefaultFilter())
    const [isCreating, setIsCreating] = useState(false)
    const [editingNote, setEditingNote] = useState(null)
    const [currentEditNote, setCurrentEditNote] = useState(null)
    const editRef = useRef(null)

    useEffect(() => {
        loadNotes()
    }, [filterBy])

    useEffect(() => {
        function handleClickOutside(event) {
            if (editRef.current && !editRef.current.contains(event.target)) {
                // Auto-save if there's content, otherwise cancel
                if (currentEditNote && currentEditNote.info.txt && currentEditNote.info.txt.trim()) {
                    onSaveNote(currentEditNote)
                } else {
                    onCancelEdit()
                }
            }
        }

        if (isCreating || editingNote) {
            document.addEventListener('mousedown', handleClickOutside)
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside)
        }
    }, [isCreating, editingNote, currentEditNote])

    function loadNotes() {
        noteService.query(filterBy)
            .then(notes => {
                setNotes(notes)
            })
            .catch(err => console.log('Error loading notes:', err))
    }

    function onCreateNote() {
        const emptyNote = noteService.getEmptyNote()
        setCurrentEditNote(emptyNote)
        setIsCreating(true)
    }

    function onSaveNote(noteToSave) {
        if (!noteToSave.info.txt || !noteToSave.info.txt.trim()) {
            onCancelEdit()
            return
        }

        console.log('Saving note:', noteToSave)
        console.log('noteToSave.id:', noteToSave.id)
        console.log('Is new note (!noteToSave.id):', !noteToSave.id)
        
        // Store the new note flag before the service call
        const isNewNote = !noteToSave.id

        noteService.save(noteToSave)
            .then(savedNote => {
                console.log('Saved note received:', savedNote)
                console.log('isNewNote variable:', isNewNote)
                
                if (isNewNote) {
                    console.log('Adding new note to list')
                    // Add new note to the beginning of the list
                    setNotes(prevNotes => {
                        console.log('Previous notes count:', prevNotes.length)
                        const newNotes = [savedNote, ...prevNotes]
                        console.log('New notes count:', newNotes.length)
                        console.log('New notes array:', newNotes)
                        return newNotes
                    })
                } else {
                    console.log('Updating existing note')
                    // Update existing note
                    setNotes(prevNotes => 
                        prevNotes.map(note => 
                            note.id === savedNote.id ? savedNote : note
                        )
                    )
                }
                
                setIsCreating(false)
                setEditingNote(null)
                setCurrentEditNote(null)
            })
            .catch(err => console.log('Error saving note:', err))
    }

    function onCancelEdit() {
        setIsCreating(false)
        setEditingNote(null)
        setCurrentEditNote(null)
    }

    function onEditNote(note) {
        setCurrentEditNote({...note})
        setEditingNote(note)
    }

    function onNoteChange(updatedNote) {
        setCurrentEditNote(updatedNote)
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

    console.log('Current notes count in render:', notes.length)

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
                {!isCreating && !editingNote && (
                    <div className="note-input-container">
                        <div className="note-input" onClick={onCreateNote}>
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
                )}

                {(isCreating || editingNote) && currentEditNote && (
                    <div ref={editRef}>
                        <NoteEdit
                            note={currentEditNote}
                            onSave={onSaveNote}
                            onCancel={onCancelEdit}
                            onChange={onNoteChange}
                        />
                    </div>
                )}
                
                <NoteList 
                    notes={notes}
                    onRemoveNote={onRemoveNote}
                    onTogglePin={onTogglePin}
                    onChangeNoteColor={onChangeNoteColor}
                    onEditNote={onEditNote}
                />
            </main>
        </section>
    )
}
