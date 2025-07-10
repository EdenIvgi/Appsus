// note service
import { storageService } from '../../../services/async-storage.service.js'
import { utilService } from '../../../services/util.service.js'

const STORAGE_KEY = 'notesDB'
const LABELS_STORAGE_KEY = 'labelsDB'

// Default labels (Google Keep style)
const defaultLabels = [
    { id: 'l101', name: 'Critical' },
    { id: 'l102', name: 'Family' },
    { id: 'l103', name: 'Work' },
    { id: 'l104', name: 'Friends' },
    { id: 'l105', name: 'Spam' },
    { id: 'l106', name: 'Memories' },
    { id: 'l107', name: 'Romantic' }
]

// Sample notes data
const notes = [
    {
        id: 'n101',
        createdAt: 1112222,
        type: 'NoteTxt',
        isPinned: true,
        style: { backgroundColor: '#00d' },
        info: { txt: 'Fullstack Me Baby!' },
        labels: ['l103'] // Work label
    },
    {
        id: 'n102',
        createdAt: 1112223,
        type: 'NoteImg',
        isPinned: false,
        info: { url: '/assets/img/test.jpg', title: 'Cute Puppy' },
        style: { backgroundColor: '#00d' },
        labels: ['l106'] // Memories label
    },
    {
        id: 'n103',
        createdAt: 1112224,
        type: 'NoteTodos',
        isPinned: false,
        info: {
            title: 'Get my stuff together',
            todos: [
                { txt: 'Driving license', doneAt: null },
                { txt: 'Coding power', doneAt: 187111111 }
            ]
        },
        labels: ['l101', 'l103'] // Critical and Work labels
    },
    {
        id: 'n104',
        createdAt: 1112225,
        type: 'NoteVideo',
        isPinned: false,
        info: {
            url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
            title: 'Sample Video Note',
            txt: 'This is a sample video note with YouTube content'
        },
        style: { backgroundColor: '#ffffff' },
        labels: ['l102'] // Family label
    }
]

// Create notes and labels in storage if they don't exist
_createNotes()
_createLabels()

export const noteService = {
    query,
    getById,
    save,
    remove,
    getEmptyNote,
    getFilterFromParams,
    getDefaultFilter,
    // Label methods
    getLabels,
    saveLabel,
    removeLabel,
    getLabelById,
    getNotesWithLabel
}

function query(filterBy = {}) {
    return storageService.query(STORAGE_KEY)
        .then(notes => {
            if (filterBy.txt) {
                notes = notes.filter(note => _searchInNote(note, filterBy.txt))
            }
            if (filterBy.type) {
                notes = notes.filter(note => note.type === filterBy.type)
            }
            if (filterBy.isPinned !== undefined) {
                notes = notes.filter(note => note.isPinned === filterBy.isPinned)
            }
            return notes
        })
}

function _searchInNote(note, searchTerm) {
    if (!searchTerm) return true
    
    // Split search term into individual words and clean them
    const searchWords = searchTerm.toLowerCase()
        .split(/\s+/)
        .filter(word => word.length > 0)
    
    if (searchWords.length === 0) return true
    
    // Collect all searchable text from the note
    const searchableTexts = []
    
    // Add note text content
    if (note.info.txt) {
        searchableTexts.push(note.info.txt.toLowerCase())
    }
    
    // Add note title
    if (note.info.title) {
        searchableTexts.push(note.info.title.toLowerCase())
    }
    
    // Add todos text
    if (note.info.todos && Array.isArray(note.info.todos)) {
        note.info.todos.forEach(todo => {
            if (todo.txt) {
                searchableTexts.push(todo.txt.toLowerCase())
            }
        })
    }
    
    // Combine all text into one string
    const allText = searchableTexts.join(' ')
    
    // Check if ALL search words are found somewhere in the note
    return searchWords.every(word => allText.includes(word))
}

function getById(noteId) {
    return storageService.get(STORAGE_KEY, noteId)
}

function save(note) {
    if (note.id) {
        return storageService.put(STORAGE_KEY, note)
    } else {
        note.id = utilService.makeId()
        note.createdAt = Date.now()
        return storageService.post(STORAGE_KEY, note)
    }
}

function remove(noteId) {
    return storageService.remove(STORAGE_KEY, noteId)
}

function getEmptyNote(type = 'NoteTxt') {
    const emptyNote = {
        type,
        isPinned: false,
        style: { backgroundColor: '#ffffff' },
        info: {},
        labels: []
    }

    switch (type) {
        case 'NoteTxt':
            emptyNote.info = { txt: '' }
            break
        case 'NoteImg':
            emptyNote.info = { url: '', title: '' }
            break
        case 'NoteTodos':
            emptyNote.info = { title: '', todos: [] }
            break
        case 'NoteVideo':
            emptyNote.info = { url: '', title: '' }
            break
    }

    return emptyNote
}

function getFilterFromParams(searchParams) {
    return {
        txt: searchParams.get('txt') || '',
        type: searchParams.get('type') || '',
        isPinned: searchParams.get('isPinned') === 'true'
    }
}

function getDefaultFilter() {
    return {
        txt: '',
        type: '',
        isPinned: undefined
    }
}

// Label management functions
function getLabels() {
    return storageService.query(LABELS_STORAGE_KEY)
}

function getLabelById(labelId) {
    return storageService.get(LABELS_STORAGE_KEY, labelId)
}

function saveLabel(label) {
    if (label.id) {
        return storageService.put(LABELS_STORAGE_KEY, label)
    } else {
        label.id = utilService.makeId()
        return storageService.post(LABELS_STORAGE_KEY, label)
    }
}

function removeLabel(labelId) {
    return storageService.remove(LABELS_STORAGE_KEY, labelId)
        .then(() => {
            // Remove this label from all notes
            return storageService.query(STORAGE_KEY)
                .then(notes => {
                    const updatedNotes = notes.map(note => {
                        if (note.labels && note.labels.includes(labelId)) {
                            return {
                                ...note,
                                labels: note.labels.filter(id => id !== labelId)
                            }
                        }
                        return note
                    })
                    return Promise.all(updatedNotes.map(note => storageService.put(STORAGE_KEY, note)))
                })
        })
}

function getNotesWithLabel(labelId) {
    return storageService.query(STORAGE_KEY)
        .then(notes => notes.filter(note => note.labels && note.labels.includes(labelId)))
}

function _createLabels() {
    let labelsFromStorage = utilService.loadFromStorage(LABELS_STORAGE_KEY)
    if (!labelsFromStorage || !labelsFromStorage.length) {
        labelsFromStorage = defaultLabels
        utilService.saveToStorage(LABELS_STORAGE_KEY, labelsFromStorage)
    }
}

function _createNotes() {
    let notesFromStorage = utilService.loadFromStorage(STORAGE_KEY)
    if (!notesFromStorage || !notesFromStorage.length) {
        notesFromStorage = notes
        utilService.saveToStorage(STORAGE_KEY, notesFromStorage)
    } else {
        let shouldSave = false
        
        // Update the image note if it has the old broken URL
        const imageNote = notesFromStorage.find(note => note.id === 'n102')
        if (imageNote && imageNote.info.url === 'http://some-img/me') {
            imageNote.info.url = '/assets/img/test.jpg'
            imageNote.info.title = 'Cute Puppy'
            shouldSave = true
        }
        
        // Add labels array to existing notes if they don't have it
        notesFromStorage.forEach(note => {
            if (!note.labels) {
                note.labels = []
                shouldSave = true
            }
        })
        
        if (shouldSave) {
            utilService.saveToStorage(STORAGE_KEY, notesFromStorage)
        }
    }
}