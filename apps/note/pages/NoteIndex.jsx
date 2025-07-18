const { useState, useEffect, useRef, useCallback, useMemo } = React
const { NavLink, useLocation, useNavigate } = ReactRouterDOM

import { noteService } from '../services/note.service.js'
import { imageUploadService } from '../../../services/image-upload.service.js'
import { showSuccessMsg } from '../../../services/event-bus.service.js'
import { NoteList } from '../cmps/NoteList.jsx'
import { NoteEdit } from '../cmps/NoteEdit.jsx'
import { VideoUrlInput } from '../cmps/VideoUrlInput.jsx'
import { LabelList } from '../cmps/LabelList.jsx'
import { LabelEditor } from '../cmps/LabelEditor.jsx'

export function NoteIndex() {
    const location = useLocation()
    const navigate = useNavigate()
    
    // Initialize filter from URL query parameters
    const [notes, setNotes] = useState([])
    const [filterBy, setFilterBy] = useState(() => {
        const searchParams = new URLSearchParams(location.search)
        return noteService.getFilterFromParams(searchParams)
    })
    const [isCreating, setIsCreating] = useState(false)
    const [editingNote, setEditingNote] = useState(null)
    const [currentEditNote, setCurrentEditNote] = useState(null)
    const [isSidebarOpen, setIsSidebarOpen] = useState(false)
    
    // Derive state from filterBy instead of separate state variables
    const searchTerm = filterBy.txt || ''
    const activeTypeFilter = filterBy.type || 'all'
    const activeLabelFilter = filterBy.labelName || null
    const activeStatusFilter = filterBy.status || 'active'
    
    const [showVideoUrlInput, setShowVideoUrlInput] = useState(false)
    const [showLabelEditor, setShowLabelEditor] = useState(false)
    const [showInputMoreMenu, setShowInputMoreMenu] = useState(false)
    const [labelRefreshTrigger, setLabelRefreshTrigger] = useState(0)
    const editRef = useRef(null)
    const sidebarRef = useRef(null)
    const imageInputRef = useRef(null)
    const inputMoreMenuRef = useRef(null)

    // Update URL when filter changes
    useEffect(() => {
        const searchParams = new URLSearchParams()
        
        if (filterBy.txt) searchParams.set('txt', filterBy.txt)
        if (filterBy.type && filterBy.type !== 'all') searchParams.set('type', filterBy.type)
        if (filterBy.labelName) searchParams.set('label', filterBy.labelName)
        if (filterBy.isPinned !== undefined) searchParams.set('isPinned', filterBy.isPinned.toString())
        if (filterBy.status && filterBy.status !== 'active') searchParams.set('status', filterBy.status)
        
        const newSearch = searchParams.toString()
        const currentSearch = location.search.substring(1)
        
        if (newSearch !== currentSearch) {
            navigate(`/note${newSearch ? '?' + newSearch : ''}`, { replace: true })
        }
    }, [filterBy, navigate, location.search])

    // Update filter when URL changes (back/forward navigation)
    useEffect(() => {
        const searchParams = new URLSearchParams(location.search)
        const newFilter = noteService.getFilterFromParams(searchParams)
        setFilterBy(newFilter)
    }, [location.search])

    useEffect(() => {
        loadNotes()
    }, [])

    useEffect(() => {
        function handleClickOutside(event) {
            // Handle sidebar close when clicking outside
            if (sidebarRef.current && !sidebarRef.current.contains(event.target) && isSidebarOpen) {
                const hamburger = document.querySelector('.hamburger-menu')
                if (hamburger && !hamburger.contains(event.target)) {
                    setIsSidebarOpen(false)
                }
            }

            // Handle input more menu close when clicking outside
            if (inputMoreMenuRef.current && !inputMoreMenuRef.current.contains(event.target) && showInputMoreMenu) {
                setShowInputMoreMenu(false)
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

        if (isCreating || editingNote || isSidebarOpen || showInputMoreMenu) {
            document.addEventListener('mousedown', handleClickOutside)
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside)
        }
    }, [isCreating, editingNote, currentEditNote, isSidebarOpen, showInputMoreMenu])

    function loadNotes() {
        noteService.query(filterBy)
            .then(notes => {
                setNotes(notes)
            })
            .catch(err => console.error('Error loading notes:', err))
    }

    // Update loadNotes when filterBy changes
    useEffect(() => {
        loadNotes()
    }, [filterBy])

    // Memoize filtered and sorted notes for better performance
    const filteredNotes = useMemo(() => {
        if (!notes || notes.length === 0) return []
        
        let filtered = [...notes]
        
        // Note: Search, type, and label filtering is now handled at the service level
        // Only client-side sorting is done here
        
        // Sort: pinned notes first, then by creation date (newest first)
        return filtered.sort((a, b) => {
            if (a.isPinned && !b.isPinned) return -1
            if (!a.isPinned && b.isPinned) return 1
            return (b.createdAt || 0) - (a.createdAt || 0)
        })
    }, [notes])

    const onCreateNote = useCallback(() => {
        const emptyNote = noteService.getEmptyNote()
        setCurrentEditNote(emptyNote)
        setIsCreating(true)
    }, [])

    const onArchiveNote = useCallback((noteId) => {
        const noteToArchive = notes.find(note => note.id === noteId)
        if (!noteToArchive) return
        
        // Update state immediately for instant UI response
        setNotes(prevNotes => prevNotes.filter(note => note.id !== noteId))
        
        // Archive note
        noteService.archiveNote(noteId)
            .then(() => {
                showSuccessMsg('Note archived!')
            })
            .catch(err => {
                console.error('Error archiving note:', err)
                loadNotes()
            })
    }, [notes])

    const onTrashNote = useCallback((noteId) => {
        const noteToTrash = notes.find(note => note.id === noteId)
        if (!noteToTrash) return
        
        // Update state immediately for instant UI response
        setNotes(prevNotes => prevNotes.filter(note => note.id !== noteId))
        
        // Move note to trash
        noteService.trashNote(noteId)
            .then(() => {
                showSuccessMsg('Note moved to trash!')
            })
            .catch(err => {
                console.error('Error moving note to trash:', err)
                loadNotes()
            })
    }, [notes])

    const onSaveNote = useCallback((noteToSave) => {
        // Check for special action flags
        const shouldArchiveAfterSave = noteToSave._archiveAfterSave
        const shouldTrashAfterSave = noteToSave._trashAfterSave
        
        // Remove the flags from the note before saving
        const cleanNote = {...noteToSave}
        delete cleanNote._archiveAfterSave
        delete cleanNote._trashAfterSave
        
        if (cleanNote.type === 'NoteImg' && cleanNote.info.url) {
        }
        else if (cleanNote.type === 'NoteVideo' && cleanNote.info.url) {
        }
        else if (cleanNote.type === 'NoteTodos') {
        }
        else if (!cleanNote.info.txt || !cleanNote.info.txt.trim()) {
            setIsCreating(false)
            setEditingNote(null)
            setCurrentEditNote(null)
            return
        }

        const isNewNote = !cleanNote.id

        noteService.save(cleanNote)
            .then(savedNote => {
                // Only add to active notes state if not going to be archived/trashed immediately
                if (!shouldArchiveAfterSave && !shouldTrashAfterSave) {
                    if (isNewNote) {
                        setNotes(prevNotes => [savedNote, ...prevNotes])
                        showSuccessMsg('Note added successfully!')
                    } else {
                        setNotes(prevNotes => 
                            prevNotes.map(note => 
                                note.id === savedNote.id ? savedNote : note
                            )
                        )
                        showSuccessMsg('Note saved successfully!')
                    }
                }
                
                setIsCreating(false)
                setEditingNote(null)
                setCurrentEditNote(null)
                
                // Perform the action after saving
                if (shouldArchiveAfterSave) {
                    // Archive the note directly using the saved note object
                    noteService.archiveNote(savedNote.id)
                        .then(() => {
                            showSuccessMsg('Note archived!')
                        })
                        .catch(err => {
                            console.error('Error archiving note:', err)
                            loadNotes()
                        })
                } else if (shouldTrashAfterSave) {
                    // Trash the note directly using the saved note object
                    noteService.trashNote(savedNote.id)
                        .then(() => {
                            showSuccessMsg('Note moved to trash!')
                        })
                        .catch(err => {
                            console.error('Error trashing note:', err)
                            loadNotes()
                        })
                }
            })
            .catch(err => console.error('Error saving note:', err))
    }, [])

    const onCancelEdit = useCallback(() => {
        setIsCreating(false)
        setEditingNote(null)
        setCurrentEditNote(null)
    }, [])

    const onEditNote = useCallback((note) => {
        setCurrentEditNote({...note})
        setEditingNote(note)
    }, [])

    const onNoteChange = useCallback((updatedNote) => {
        setCurrentEditNote(updatedNote)
    }, [])

    const onRemoveNote = useCallback((noteId) => {
        const noteToRemove = notes.find(note => note.id === noteId)
        if (!noteToRemove) return
        
        const currentStatus = noteToRemove.status || 'active'
        
        // Update state immediately for instant UI response
        setNotes(prevNotes => prevNotes.filter(note => note.id !== noteId))
        
        // Handle different removal stages
        if (currentStatus === 'active') {
            // First removal: archive the note
            noteService.archiveNote(noteId)
                .then(() => {
                    showSuccessMsg('Note archived!')
                })
                .catch(err => {
                    console.error('Error archiving note:', err)
                    loadNotes()
                })
        } else if (currentStatus === 'archived') {
            // Second removal: move to trash
            noteService.trashNote(noteId)
                .then(() => {
                    showSuccessMsg('Note moved to trash!')
                })
                .catch(err => {
                    console.error('Error trashing note:', err)
                    loadNotes()
                })
        } else if (currentStatus === 'trashed') {
            // Third removal: permanently delete
            noteService.permanentlyDeleteNote(noteId)
                .then(() => {
                    showSuccessMsg('Note permanently deleted!')
                })
                .catch(err => {
                    console.error('Error permanently deleting note:', err)
                    loadNotes()
                })
        }
    }, [notes])

    const onTogglePin = useCallback((noteId) => {
        setNotes(prevNotes => {
            const noteToUpdate = prevNotes.find(note => note.id === noteId)
            if (!noteToUpdate) return prevNotes
            
            const updatedNote = { ...noteToUpdate, isPinned: !noteToUpdate.isPinned }
            
            // Save to storage in background
            noteService.save(updatedNote).catch(err => {
                console.error('Error updating note:', err)
            })
            
            return prevNotes.map(note => 
                note.id === noteId ? updatedNote : note
            )
        })
    }, [])

    const onChangeNoteColor = useCallback((noteId, backgroundColor) => {
        setNotes(prevNotes => {
            const noteToUpdate = prevNotes.find(note => note.id === noteId)
            if (!noteToUpdate) return prevNotes
            
            const updatedNote = { 
                ...noteToUpdate, 
                style: { ...(noteToUpdate.style || {}), backgroundColor } 
            }
            
            // Save to storage in background
            noteService.save(updatedNote).catch(err => {
                console.error('Error updating note:', err)
            })
            
            return prevNotes.map(note => 
                note.id === noteId ? updatedNote : note
            )
        })
    }, [])

    const onUpdateNote = useCallback((updatedNote) => {
        setNotes(prevNotes => {
            // Save to storage in background
            noteService.save(updatedNote).catch(err => {
                console.error('Error updating note:', err)
            })
            
            return prevNotes.map(note => 
                note.id === updatedNote.id ? updatedNote : note
            )
        })
    }, [])

    const onLabelsChange = useCallback((noteId, newLabels) => {
        setNotes(prevNotes => {
            const noteToUpdate = prevNotes.find(note => note.id === noteId)
            if (!noteToUpdate) return prevNotes
            
            const updatedNote = { 
                ...noteToUpdate, 
                labels: newLabels
            }
            
            // Save to storage in background
            noteService.save(updatedNote).catch(err => {
                console.error('Error updating note labels:', err)
            })
            
            return prevNotes.map(note => 
                note.id === noteId ? updatedNote : note
            )
        })
    }, [])

    const onDuplicateNote = useCallback((noteId) => {
        const noteToDuplicate = notes.find(note => note.id === noteId)
        if (!noteToDuplicate) return
        
        // Create a copy with new ID and timestamp
        const duplicatedNote = {
            ...noteToDuplicate,
            id: undefined, // Will be generated by noteService.save
            createdAt: Date.now(),
            isPinned: false // Duplicated notes are not pinned by default
        }
        
        // Save the duplicated note
        noteService.save(duplicatedNote)
            .then(savedNote => {
                // Add to the beginning of the list (like new notes)
                setNotes(prevNotes => [savedNote, ...prevNotes])
                showSuccessMsg('Note duplicated successfully!')
            })
            .catch(err => {
                console.error('Error duplicating note:', err)
            })
    }, [notes])

    const onToggleSidebar = useCallback(() => {
        setIsSidebarOpen(prev => !prev)
    }, [])

    const onSearchChange = useCallback((event) => {
        const term = event.target.value
        setFilterBy(prev => ({ ...prev, txt: term }))
    }, [])

    const onTypeFilterChange = useCallback((type) => {
        setFilterBy(prev => ({ 
            ...prev, 
            type: type === 'all' ? '' : type 
        }))
    }, [])

    const onClearSearch = useCallback(() => {
        setFilterBy(noteService.getDefaultFilter())
    }, [])

    const onStatusFilterChange = useCallback((status) => {
        setFilterBy(prev => ({ 
            ...prev, 
            status: status,
            txt: '', // Clear search when changing status
            type: '', // Clear type filter when changing status
            labelName: null // Clear label filter when changing status
        }))
    }, [])

    const onRestoreNote = useCallback((noteId) => {
        const noteToRestore = notes.find(note => note.id === noteId)
        if (!noteToRestore) return
        
        // Update state immediately for instant UI response
        setNotes(prevNotes => prevNotes.filter(note => note.id !== noteId))
        
        // Restore note to active status
        noteService.restoreNote(noteId)
            .then(() => {
                showSuccessMsg('Note restored!')
            })
            .catch(err => {
                console.error('Error restoring note:', err)
                loadNotes()
            })
    }, [notes])

    const onPermanentDeleteNote = useCallback((noteId) => {
        const noteToDelete = notes.find(note => note.id === noteId)
        if (!noteToDelete) return
        
        // Update state immediately for instant UI response
        setNotes(prevNotes => prevNotes.filter(note => note.id !== noteId))
        
        // Permanently delete note
        noteService.permanentlyDeleteNote(noteId)
            .then(() => {
                showSuccessMsg('Note permanently deleted!')
            })
            .catch(err => {
                console.error('Error permanently deleting note:', err)
                loadNotes()
            })
    }, [notes])

    const onLabelFilter = useCallback((labelName) => {
        // Toggle label filter - if same label clicked, clear filter
        if (activeLabelFilter === labelName) {
            setFilterBy(prev => ({ ...prev, labelName: null }))
        } else {
            setFilterBy(prev => ({ 
                ...prev, 
                labelName: labelName
            }))
        }
    }, [activeLabelFilter])

    const onCreateImageNote = useCallback(() => {
        if (imageInputRef.current) {
            imageInputRef.current.click()
        }
    }, [])

    const onCreateVideoNote = useCallback(() => {
        setShowVideoUrlInput(true)
    }, [])

    const onCreateTodoNote = useCallback(() => {
        const newTodoNote = noteService.getEmptyNote('NoteTodos')
        setCurrentEditNote(newTodoNote)
        setIsCreating(true)
    }, [])

    const onVideoUrlSave = useCallback((videoData) => {
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
    }, [])

    const onVideoUrlCancel = useCallback(() => {
        setShowVideoUrlInput(false)
    }, [])

    const onOpenLabelEditor = useCallback(() => {
        setShowLabelEditor(true)
    }, [])

    const onCloseLabelEditor = useCallback(() => {
        setShowLabelEditor(false)
        setLabelRefreshTrigger(prev => prev + 1)
    }, [])

    const toggleInputMoreMenu = useCallback((e) => {
        e.stopPropagation()
        setShowInputMoreMenu(!showInputMoreMenu)
    }, [showInputMoreMenu])

    const handleImageUpload = useCallback((event) => {
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

        event.target.value = ''
    }, [])

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
                    <div 
                        className={`icon-nav-item ${activeStatusFilter === 'active' ? 'active' : ''}`}
                        onClick={() => onStatusFilterChange('active')}
                    >
                        <span className="material-symbols-outlined">lightbulb</span>
                    </div>
                    <div 
                        className={`icon-nav-item ${activeStatusFilter === 'archived' ? 'active' : ''}`}
                        onClick={() => onStatusFilterChange('archived')}
                    >
                        <span className="material-symbols-outlined">archive</span>
                    </div>
                    <div 
                        className={`icon-nav-item ${activeStatusFilter === 'trashed' ? 'active' : ''}`}
                        onClick={() => onStatusFilterChange('trashed')}
                    >
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
                            className={`nav-item ${activeStatusFilter === 'active' && activeTypeFilter === 'all' ? 'active' : ''}`}
                            onClick={() => onStatusFilterChange('active')}
                        >
                            <span className="material-symbols-outlined nav-icon">lightbulb</span>
                            <span className="nav-text">All Notes</span>
                        </div>
                        <div 
                            className={`nav-item ${activeStatusFilter === 'archived' ? 'active' : ''}`}
                            onClick={() => onStatusFilterChange('archived')}
                        >
                            <span className="material-symbols-outlined nav-icon">archive</span>
                            <span className="nav-text">Archive</span>
                        </div>
                        <div 
                            className={`nav-item ${activeStatusFilter === 'trashed' ? 'active' : ''}`}
                            onClick={() => onStatusFilterChange('trashed')}
                        >
                            <span className="material-symbols-outlined nav-icon">delete</span>
                            <span className="nav-text">Trash</span>
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
                        <div className="nav-item" onClick={onOpenLabelEditor}>
                            <span className="material-symbols-outlined nav-icon">edit</span>
                            <span className="nav-text">Edit labels</span>
                        </div>
                        <LabelList 
                            key={labelRefreshTrigger}
                            onLabelFilter={onLabelFilter}
                            activeLabelFilter={activeLabelFilter}
                        />
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
                                    onClick={(e) => {
                                        e.stopPropagation()
                                        onCreateImageNote()
                                    }}
                                >
                                    <span className="material-symbols-outlined">add_a_photo</span>
                                </button>
                                <button 
                                    className="input-action-btn" 
                                    title="New note with video"
                                    onClick={(e) => {
                                        e.stopPropagation()
                                        onCreateVideoNote()
                                    }}
                                >
                                    <span className="material-symbols-outlined">videocam</span>
                                </button>
                                <button 
                                    className="input-action-btn" 
                                    title="New list"
                                    onClick={(e) => {
                                        e.stopPropagation()
                                        onCreateTodoNote()
                                    }}
                                >
                                    <span className="material-symbols-outlined">check_box</span>
                                </button>

                                <div ref={inputMoreMenuRef} className="more-menu-container">
                                    <button 
                                        className="input-action-btn" 
                                        onClick={toggleInputMoreMenu}
                                        title="More"
                                    >
                                        <span className="material-symbols-outlined">more_vert</span>
                                    </button>
                                    {showInputMoreMenu && (
                                        <div className="more-menu-popup">
                                            <button 
                                                className="more-menu-item"
                                                onClick={(e) => {
                                                    e.stopPropagation()
                                                    setShowInputMoreMenu(false)
                                                    onOpenLabelEditor()
                                                }}
                                            >
                                                <span className="material-symbols-outlined">edit</span>
                                                Edit labels
                                            </button>
                                        </div>
                                    )}
                                </div>
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
                            onArchiveNote={onArchiveNote}
                            onTrashNote={onTrashNote}
                            onDuplicateNote={onDuplicateNote}
                        />
                    </div>
                )}
                
                {filteredNotes.length === 0 && (searchTerm || activeTypeFilter !== 'all' || activeLabelFilter) ? (
                    <div className="no-results">
                        <div className="no-results-icon">
                            <span className="material-symbols-outlined">search_off</span>
                        </div>
                        <h3>No notes found</h3>
                        <p>
                            {searchTerm 
                                ? `No notes match "${searchTerm}"${activeTypeFilter !== 'all' ? ` in ${activeTypeFilter === 'NoteTxt' ? 'text notes' : activeTypeFilter === 'NoteImg' ? 'image notes' : activeTypeFilter === 'NoteVideo' ? 'video notes' : 'todo notes'}` : ''}${activeLabelFilter ? ' with selected label' : ''}`
                                : activeLabelFilter
                                ? 'No notes with this label'
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
                        notes={filteredNotes}
                        onRemoveNote={onRemoveNote}
                        onTogglePin={onTogglePin}
                        onChangeNoteColor={onChangeNoteColor}
                        onEditNote={onEditNote}
                        onAddVideo={onCreateVideoNote}
                        onUpdateNote={onUpdateNote}
                        onLabelsChange={onLabelsChange}
                        onDuplicateNote={onDuplicateNote}
                        onRestoreNote={onRestoreNote}
                        onArchiveNote={onArchiveNote}
                        onTrashNote={onTrashNote}
                        onPermanentDeleteNote={onPermanentDeleteNote}
                        currentStatus={activeStatusFilter}
                    />
                )}
            </main>

            <button className="fab" onClick={onCreateNote}>
                <span className="material-symbols-outlined">add</span>
            </button>

            {showVideoUrlInput && (
                <VideoUrlInput 
                    onSave={onVideoUrlSave}
                    onCancel={onVideoUrlCancel}
                />
            )}

            {showLabelEditor && (
                <LabelEditor 
                    onClose={onCloseLabelEditor}
                />
            )}

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
