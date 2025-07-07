const { useState, useEffect, useRef } = React
const { NavLink } = ReactRouterDOM

import { noteService } from '../services/note.service.js'
import { imageUploadService } from '../../../services/image-upload.service.js'
import { NoteList } from '../cmps/NoteList.jsx'
import { NoteEdit } from '../cmps/NoteEdit.jsx'
import { VideoUrlInput } from '../cmps/VideoUrlInput.jsx'

export function NoteIndex() {
    const [notes, setNotes] = useState([])
    const [filterBy, setFilterBy] = useState(noteService.getDefaultFilter())
    const [isCreating, setIsCreating] = useState(false)
    const [editingNote, setEditingNote] = useState(null)
    const [currentEditNote, setCurrentEditNote] = useState(null)
    const [isSidebarOpen, setIsSidebarOpen] = useState(false)
    const [searchTerm, setSearchTerm] = useState('')
    const [activeTypeFilter, setActiveTypeFilter] = useState('all')
    const [showVideoUrlInput, setShowVideoUrlInput] = useState(false)
    const editRef = useRef(null)
    const sidebarRef = useRef(null)
    const imageInputRef = useRef(null)

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
            .catch(err => console.error('Error loading notes:', err))
    }

    function onCreateNote() {
        const emptyNote = noteService.getEmptyNote()
        setCurrentEditNote(emptyNote)
        setIsCreating(true)
    }

    function onSaveNote(noteToSave) {
        // For image notes, save even without text if there's a URL
        if (noteToSave.type === 'NoteImg' && noteToSave.info.url) {
            // Allow saving
        }
        // For video notes, save even without text if there's a URL
        else if (noteToSave.type === 'NoteVideo' && noteToSave.info.url) {
            // Allow saving
        }
        // For other notes, require text content
        else if (!noteToSave.info.txt || !noteToSave.info.txt.trim()) {
            onCancelEdit()
            return
        }

        // Store the new note flag before the service call
        const isNewNote = !noteToSave.id

        noteService.save(noteToSave)
            .then(savedNote => {
                if (isNewNote) {
                    // Add new note to the beginning of the list
                    setNotes(prevNotes => [savedNote, ...prevNotes])
                } else {
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
            .catch(err => console.error('Error saving note:', err))
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
            .catch(err => console.error('Error removing note:', err))
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
            .catch(err => console.error('Error updating note:', err))
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
                style: { ...(noteToUpdate.style || {}), backgroundColor } 
            }
            onUpdateNote(updatedNote)
        }
    }

    function onToggleSidebar() {
        setIsSidebarOpen(!isSidebarOpen)
    }

    function onSearchChange(event) {
        const term = event.target.value
        setSearchTerm(term)
        
        // Update filter and reload notes
        const newFilter = {
            ...filterBy,
            txt: term
        }
        setFilterBy(newFilter)
    }

    function onTypeFilterChange(type) {
        setActiveTypeFilter(type)
        
        // Update filter and reload notes
        const newFilter = {
            ...filterBy,
            type: type === 'all' ? '' : type
        }
        setFilterBy(newFilter)
    }

    function onClearSearch() {
        setSearchTerm('')
        setActiveTypeFilter('all')
        setFilterBy(noteService.getDefaultFilter())
    }

    function onCreateImageNote() {
        if (imageInputRef.current) {
            imageInputRef.current.click()
        }
    }

    function onCreateVideoNote() {
        setShowVideoUrlInput(true)
    }

    function onVideoUrlSave(videoData) {
        const newVideoNote = {
            ...noteService.getEmptyNote('NoteVideo'),
            info: {
                url: videoData.url,
                title: videoData.title,
                txt: ''
            }
        }
        setCurrentEditNote(newVideoNote)
        setIsCreating(true)
        setShowVideoUrlInput(false)
    }

    function onVideoUrlCancel() {
        setShowVideoUrlInput(false)
    }

    function handleImageUpload(event) {
        const file = event.target.files[0]
        if (!file) return

        imageUploadService.uploadImage(file)
            .then(imageData => {
                const newNote = {
                    ...noteService.getEmptyNote('NoteImg'),
                    info: {
                        url: imageData.url,
                        title: '',
                        txt: ''
                    }
                }
                setCurrentEditNote(newNote)
                setIsCreating(true)
            })
            .catch(error => {
                console.error('Error uploading image:', error)
                alert('Error uploading image: ' + error)
            })

        // Reset the input
        event.target.value = ''
    }

    return (
        <section className="note-index">
            {/* Mobile Header */}
            <header className="note-header">
                <button className="hamburger-menu" onClick={onToggleSidebar}>
                    <span className="material-symbols-outlined">menu</span>
                </button>
                <div className="app-logo">
                    <span className="logo-icon">📝</span>
                    <span className="logo-text">Misskeep</span>
                </div>
                <div className="search-container">
                    <input 
                        type="text" 
                        placeholder="Search your notes" 
                        className="search-input"
                        value={searchTerm}
                        onChange={onSearchChange}
                    />
                    {searchTerm && (
                        <button 
                            className="search-clear-btn"
                            onClick={onClearSearch}
                            title="Clear search"
                        >
                            <span className="material-symbols-outlined">close</span>
                        </button>
                    )}
                </div>
                <nav className="header-nav">
                    <NavLink to="/" className="nav-btn">
                        <span className="material-symbols-outlined">home</span>
                        <span className="nav-text">Home</span>
                    </NavLink>
                    <NavLink to="/about" className="nav-btn">
                        <span className="material-symbols-outlined">info</span>
                        <span className="nav-text">About</span>
                    </NavLink>
                    <NavLink to="/mail" className="nav-btn">
                        <span className="material-symbols-outlined">mail</span>
                        <span className="nav-text">Mail</span>
                    </NavLink>
                </nav>
            </header>

            {/* Icon Sidebar - Always Visible */}
            <aside className="note-icon-sidebar">
                <div className="icon-spacer"></div>
                <nav className="icon-nav">
                    <div className="icon-nav-item active">
                        <span className="material-symbols-outlined">lightbulb</span>
                    </div>
                    <div className="icon-nav-item">
                        <span className="material-symbols-outlined">notifications</span>
                    </div>
                    <div className="icon-nav-item">
                        <span className="material-symbols-outlined">archive</span>
                    </div>
                    <div className="icon-nav-item">
                        <span className="material-symbols-outlined">delete</span>
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
                    {/* App Navigation */}
                    <div className="nav-section">
                        <div className="section-title">APPSUS</div>
                        <NavLink to="/" className="nav-item">
                            <span className="material-symbols-outlined nav-icon">home</span>
                            <span className="nav-text">Home</span>
                        </NavLink>
                        <NavLink to="/about" className="nav-item">
                            <span className="material-symbols-outlined nav-icon">info</span>
                            <span className="nav-text">About</span>
                        </NavLink>
                        <NavLink to="/mail" className="nav-item">
                            <span className="material-symbols-outlined nav-icon">mail</span>
                            <span className="nav-text">Mail</span>
                        </NavLink>
                        <NavLink to="/note" className="nav-item active">
                            <span className="material-symbols-outlined nav-icon">lightbulb</span>
                            <span className="nav-text">Notes</span>
                        </NavLink>
                    </div>
                    
                    <div className="nav-divider"></div>
                    
                    {/* Notes-specific Navigation */}
                    <div className="nav-section">
                        <div className="section-title">NOTES</div>
                        <div 
                            className={`nav-item ${activeTypeFilter === 'all' ? 'active' : ''}`}
                            onClick={() => onTypeFilterChange('all')}
                        >
                            <span className="material-symbols-outlined nav-icon">lightbulb</span>
                            <span className="nav-text">All Notes</span>
                        </div>
                        <div className="nav-item">
                            <span className="material-symbols-outlined nav-icon">notifications</span>
                            <span className="nav-text">Reminders</span>
                        </div>
                    </div>

                    {/* Type Filtering */}
                    <div className="nav-section">
                        <div className="section-title">FILTER BY TYPE</div>
                        <div 
                            className={`nav-item ${activeTypeFilter === 'all' ? 'active' : ''}`}
                            onClick={() => onTypeFilterChange('all')}
                        >
                            <span className="material-symbols-outlined nav-icon">select_all</span>
                            <span className="nav-text">All Types</span>
                        </div>
                        <div 
                            className={`nav-item ${activeTypeFilter === 'NoteTxt' ? 'active' : ''}`}
                            onClick={() => onTypeFilterChange('NoteTxt')}
                        >
                            <span className="material-symbols-outlined nav-icon">text_fields</span>
                            <span className="nav-text">Text Notes</span>
                        </div>
                        <div 
                            className={`nav-item ${activeTypeFilter === 'NoteImg' ? 'active' : ''}`}
                            onClick={() => onTypeFilterChange('NoteImg')}
                        >
                            <span className="material-symbols-outlined nav-icon">image</span>
                            <span className="nav-text">Image Notes</span>
                        </div>
                        <div 
                            className={`nav-item ${activeTypeFilter === 'NoteTodos' ? 'active' : ''}`}
                            onClick={() => onTypeFilterChange('NoteTodos')}
                        >
                            <span className="material-symbols-outlined nav-icon">check_box</span>
                            <span className="nav-text">Todo Notes</span>
                        </div>
                        <div 
                            className={`nav-item ${activeTypeFilter === 'NoteVideo' ? 'active' : ''}`}
                            onClick={() => onTypeFilterChange('NoteVideo')}
                        >
                            <span className="material-symbols-outlined nav-icon">videocam</span>
                            <span className="nav-text">Video Notes</span>
                        </div>
                    </div>
                    
                    <div className="nav-section">
                        <div className="section-title">LABELS</div>
                        <div className="nav-item">
                            <span className="material-symbols-outlined nav-icon">add</span>
                            <span className="nav-text">Create new label</span>
                        </div>
                    </div>
                    
                    <div className="nav-item">
                        <span className="material-symbols-outlined nav-icon">archive</span>
                        <span className="nav-text">Archive</span>
                    </div>
                    <div className="nav-item">
                        <span className="material-symbols-outlined nav-icon">delete</span>
                        <span className="nav-text">Trash</span>
                    </div>
                    
                    <div className="nav-divider"></div>
                    
                    <div className="nav-item">
                        <span className="material-symbols-outlined nav-icon">settings</span>
                        <span className="nav-text">Settings</span>
                    </div>
                    <div className="nav-item">
                        <span className="material-symbols-outlined nav-icon">feedback</span>
                        <span className="nav-text">Send app feedback</span>
                    </div>
                    <div className="nav-item">
                        <span className="material-symbols-outlined nav-icon">help</span>
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
                                <button 
                                    className="input-action-btn" 
                                    title="New note with image"
                                    onClick={onCreateImageNote}
                                >
                                    <span className="material-symbols-outlined">add_a_photo</span>
                                </button>
                                <button 
                                    className="input-action-btn" 
                                    title="New note with video"
                                    onClick={onCreateVideoNote}
                                >
                                    <span className="material-symbols-outlined">videocam</span>
                                </button>
                                <button className="input-action-btn" title="New note with drawing">
                                    <span className="material-symbols-outlined">brush</span>
                                </button>
                                <button className="input-action-btn" title="More">
                                    <span className="material-symbols-outlined">more_vert</span>
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
                
                {notes.length === 0 && (searchTerm || activeTypeFilter !== 'all') ? (
                    <div className="no-results">
                        <div className="no-results-icon">
                            <span className="material-symbols-outlined">search_off</span>
                        </div>
                        <h3>No notes found</h3>
                        <p>
                            {searchTerm 
                                ? `No notes match "${searchTerm}"${activeTypeFilter !== 'all' ? ` in ${activeTypeFilter === 'NoteTxt' ? 'text notes' : activeTypeFilter === 'NoteImg' ? 'image notes' : activeTypeFilter === 'NoteVideo' ? 'video notes' : 'todo notes'}` : ''}`
                                : `No ${activeTypeFilter === 'NoteTxt' ? 'text notes' : activeTypeFilter === 'NoteImg' ? 'image notes' : activeTypeFilter === 'NoteVideo' ? 'video notes' : 'todo notes'} found`
                            }
                        </p>
                        <button className="clear-search-btn" onClick={onClearSearch}>
                            <span className="material-symbols-outlined">clear_all</span>
                            Clear filters
                        </button>
                    </div>
                ) : (
                    <NoteList 
                        notes={notes}
                        onRemoveNote={onRemoveNote}
                        onTogglePin={onTogglePin}
                        onChangeNoteColor={onChangeNoteColor}
                        onEditNote={onEditNote}
                        onAddVideo={onCreateVideoNote}
                    />
                )}
            </main>

            {/* Floating Action Button */}
            <button className="fab" onClick={onCreateNote}>
                <span className="material-symbols-outlined">add</span>
            </button>

            {/* Video URL Input Modal */}
            {showVideoUrlInput && (
                <VideoUrlInput 
                    onSave={onVideoUrlSave}
                    onCancel={onVideoUrlCancel}
                />
            )}

            {/* Hidden file input for image uploads */}
            <input
                ref={imageInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                style={{ display: 'none' }}
            />
        </section>
    )
}
