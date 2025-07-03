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
    const [isSidebarOpen, setIsSidebarOpen] = useState(false)
    const [searchTerm, setSearchTerm] = useState('')
    const editRef = useRef(null)
    const sidebarRef = useRef(null)

    useEffect(() => {
        loadNotes()
    }, [filterBy])

    useEffect(() => {
        function handleClickOutside(event) {
            // Handle sidebar close when clicking outside
            if (sidebarRef.current && !sidebarRef.current.contains(event.target) && isSidebarOpen) {
                const hamburger = document.querySelector('.hamburger-menu')
                if (hamburger && !hamburger.contains(event.target)) {
                    setIsSidebarOpen(false)
                }
            }

            // Handle note edit close when clicking outside
            if (editRef.current && !editRef.current.contains(event.target)) {
                // Auto-save if there's content, otherwise cancel
                if (currentEditNote && currentEditNote.info.txt && currentEditNote.info.txt.trim()) {
                    onSaveNote(currentEditNote)
                } else {
                    onCancelEdit()
                }
            }
        }

        if (isCreating || editingNote || isSidebarOpen) {
            document.addEventListener('mousedown', handleClickOutside)
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside)
        }
    }, [isCreating, editingNote, currentEditNote, isSidebarOpen])

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

    function onToggleSidebar() {
        setIsSidebarOpen(!isSidebarOpen)
    }

    function onSearchChange(event) {
        setSearchTerm(event.target.value)
        // You can implement search functionality here
    }

    console.log('Current notes count in render:', notes.length)

    return (
        <section className="note-index">
            {/* Mobile Header */}
            <header className="note-header">
                <button className="hamburger-menu" onClick={onToggleSidebar}>
                    <span className="material-icons">menu</span>
                </button>
                <div className="app-logo">
                    <span className="logo-icon">📝</span>
                    <span className="logo-text">Misskeep</span>
                </div>
                <div className="search-container">
                    <span className="material-icons search-icon">search</span>
                    <input 
                        type="text" 
                        placeholder="Search your notes" 
                        className="search-input"
                        value={searchTerm}
                        onChange={onSearchChange}
                    />
                </div>
            </header>

            {/* Icon Sidebar - Always Visible */}
            <aside className="note-icon-sidebar">
                <div className="icon-spacer"></div>
                <nav className="icon-nav">
                    <div className="icon-nav-item active">
                        <span className="material-icons">lightbulb_outline</span>
                    </div>
                    <div className="icon-nav-item">
                        <span className="material-icons">notifications</span>
                    </div>
                    <div className="icon-nav-item">
                        <span className="material-icons">archive</span>
                    </div>
                    <div className="icon-nav-item">
                        <span className="material-icons">delete</span>
                    </div>
                </nav>
            </aside>

            {/* Backdrop */}
            {isSidebarOpen && <div className="sidebar-backdrop" onClick={() => setIsSidebarOpen(false)}></div>}
            
            {/* Sidebar Drawer */}
            <aside ref={sidebarRef} className={`note-sidebar ${isSidebarOpen ? 'open' : ''}`}>
                <div className="sidebar-header">
                    <span className="app-title">Misskeep</span>
                </div>
                <nav className="sidebar-nav">
                    <div className="nav-item active">
                        <span className="material-icons nav-icon">lightbulb_outline</span>
                        <span className="nav-text">Notes</span>
                    </div>
                    <div className="nav-item">
                        <span className="material-icons nav-icon">notifications</span>
                        <span className="nav-text">Reminders</span>
                    </div>
                    
                    <div className="nav-section">
                        <div className="section-title">LABELS</div>
                        <div className="nav-item">
                            <span className="material-icons nav-icon">add</span>
                            <span className="nav-text">Create new label</span>
                        </div>
                    </div>
                    
                    <div className="nav-item">
                        <span className="material-icons nav-icon">archive</span>
                        <span className="nav-text">Archive</span>
                    </div>
                    <div className="nav-item">
                        <span className="material-icons nav-icon">delete</span>
                        <span className="nav-text">Trash</span>
                    </div>
                    
                    <div className="nav-divider"></div>
                    
                    <div className="nav-item">
                        <span className="material-icons nav-icon">settings</span>
                        <span className="nav-text">Settings</span>
                    </div>
                    <div className="nav-item">
                        <span className="material-icons nav-icon">feedback</span>
                        <span className="nav-text">Send app feedback</span>
                    </div>
                    <div className="nav-item">
                        <span className="material-icons nav-icon">help</span>
                        <span className="nav-text">Help</span>
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

            {/* Floating Action Button */}
            <button className="fab" onClick={onCreateNote}>
                <span className="material-icons">add</span>
            </button>
        </section>
    )
}
