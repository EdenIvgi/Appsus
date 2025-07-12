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
    },
    {
        id: 'n105',
        createdAt: 1112226,
        type: 'NoteTxt',
        isPinned: false,
        style: { backgroundColor: '#fff8b9' },
        info: { 
            title: 'Travel Journal - Day 1',
            txt: 'Today was an absolutely incredible day in Tokyo! We started early with a visit to the famous Tsukiji Outer Market where we had the most amazing sushi breakfast. The freshness of the fish was beyond anything I\'ve ever experienced. After that, we walked through the beautiful gardens of the Imperial Palace. The cherry blossoms were in full bloom, creating a magical pink canopy everywhere we looked. We spent hours just sitting under the trees, taking photos, and enjoying the peaceful atmosphere. Later in the afternoon, we explored the bustling Shibuya district and experienced the famous scramble crossing. The energy was infectious! We ended the day with a traditional kaiseki dinner at a small family-run restaurant in Asakusa. Every dish was a work of art. Tomorrow we\'re planning to visit Mount Fuji - can\'t wait!' 
        },
        labels: ['l106', 'l102'] // Memories, Family labels
    },
    {
        id: 'n106',
        createdAt: 1112227,
        type: 'NoteTxt',
        isPinned: false,
        style: { backgroundColor: '#e2f6d3' },
        info: { 
            title: 'Project Ideas & Thoughts',
            txt: 'I\'ve been thinking a lot about our next big project at work. There are so many possibilities we could explore! First, there\'s the idea of creating a mobile app that helps people track their daily habits and build better routines. We could integrate it with wearable devices and use machine learning to provide personalized recommendations. Second, we could develop a platform for local businesses to connect with their community, kind of like a neighborhood social network but focused on commerce and services. Third, there\'s this concept I\'ve been mulling over about a collaborative learning platform where people can teach each other skills through short video tutorials and interactive workshops. The challenge would be creating a good matching algorithm to connect learners with the right instructors based on their learning style, schedule, and goals. Each of these projects would require different technical stacks and team compositions. We should probably do a proper feasibility study and market research before committing to any direction. Maybe we should set up some brainstorming sessions with the whole team next week?' 
        },
        labels: ['l103'] // Work label
    },
    {
        id: 'n107',
        createdAt: 1112228,
        type: 'NoteTxt',
        isPinned: true,
        style: { backgroundColor: '#d3bedb' },
        info: { 
            txt: 'Remember to call mom on Sunday!' 
        },
        labels: ['l102'] // Family label
    },
    {
        id: 'n108',
        createdAt: 1112229,
        type: 'NoteTxt',
        isPinned: false,
        style: { backgroundColor: '#afccdc' },
        info: { 
            title: 'Book Recommendations',
            txt: 'Here are some amazing books I discovered this month: "The Midnight Library" by Matt Haig - a philosophical novel about parallel lives and the paths not taken. It really made me think about choices and regrets. "Atomic Habits" by James Clear - practical strategies for building good habits and breaking bad ones. The 1% improvement principle is genius! "The Seven Husbands of Evelyn Hugo" by Taylor Jenkins Reid - absolutely captivating storytelling about a reclusive Hollywood icon. "Project Hail Mary" by Andy Weir - science fiction at its finest, with humor and heart. I couldn\'t put it down! "The Thursday Murder Club" by Richard Osman - a cozy mystery series that\'s both funny and engaging. Perfect for relaxing evenings.' 
        },
        labels: ['l106'] // Memories label
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
    // Status management
    archiveNote,
    trashNote,
    restoreNote,
    permanentlyDeleteNote,
    // Label methods
    getLabels,
    saveLabel,
    removeLabel,
    getLabelById,
    getNotesWithLabel,
    // Helper methods for label names
    getLabelIdByName,
    getLabelNameById
}

function query(filterBy = {}) {
    return storageService.query(STORAGE_KEY)
        .then(notes => {
            // Handle labelName filtering asynchronously
            if (filterBy.labelName) {
                return getLabelIdByName(filterBy.labelName)
                    .then(labelId => {
                        if (labelId) {
                            notes = notes.filter(note => note.labels && note.labels.includes(labelId))
                        }
                        return _applyOtherFilters(notes, filterBy)
                    })
            }
            
            return _applyOtherFilters(notes, filterBy)
        })
}

function _applyOtherFilters(notes, filterBy) {
    // Always filter by status first
    if (filterBy.status) {
        notes = notes.filter(note => (note.status || 'active') === filterBy.status)
    }
    
    if (filterBy.txt) {
        notes = notes.filter(note => _searchInNote(note, filterBy.txt))
    }
    if (filterBy.type) {
        notes = notes.filter(note => note.type === filterBy.type)
    }
    if (filterBy.label) {
        notes = notes.filter(note => note.labels && note.labels.includes(filterBy.label))
    }
    if (filterBy.isPinned !== undefined) {
        notes = notes.filter(note => note.isPinned === filterBy.isPinned)
    }
    return notes
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

function archiveNote(noteId) {
    return storageService.get(STORAGE_KEY, noteId)
        .then(note => {
            if (note) {
                const updatedNote = { ...note, status: 'archived' }
                return storageService.put(STORAGE_KEY, updatedNote)
            }
        })
}

function trashNote(noteId) {
    return storageService.get(STORAGE_KEY, noteId)
        .then(note => {
            if (note) {
                const updatedNote = { ...note, status: 'trashed' }
                return storageService.put(STORAGE_KEY, updatedNote)
            }
        })
}

function restoreNote(noteId) {
    return storageService.get(STORAGE_KEY, noteId)
        .then(note => {
            if (note) {
                const updatedNote = { ...note, status: 'active' }
                return storageService.put(STORAGE_KEY, updatedNote)
            }
        })
}

function permanentlyDeleteNote(noteId) {
    return storageService.remove(STORAGE_KEY, noteId)
}

function getEmptyNote(type = 'NoteTxt') {
    const emptyNote = {
        type,
        isPinned: false,
        style: { backgroundColor: '#ffffff' },
        info: {},
        labels: [],
        status: 'active' // active, archived, trashed
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
    const isPinnedParam = searchParams.get('isPinned')
    return {
        txt: searchParams.get('txt') || '',
        type: searchParams.get('type') || '',
        labelName: searchParams.get('label') || null,
        isPinned: isPinnedParam ? isPinnedParam === 'true' : undefined,
        status: searchParams.get('status') || 'active'
    }
}

function getDefaultFilter() {
    return {
        txt: '',
        type: '',
        labelName: null,
        isPinned: undefined,
        status: 'active'
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

function getLabelIdByName(labelName) {
    return storageService.query(LABELS_STORAGE_KEY)
        .then(labels => {
            const label = labels.find(l => l.name.toLowerCase() === labelName.toLowerCase())
            return label ? label.id : null
        })
}

function getLabelNameById(labelId) {
    return storageService.query(LABELS_STORAGE_KEY)
        .then(labels => {
            const label = labels.find(l => l.id === labelId)
            return label ? label.name : null
        })
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
            if (!note.status) {
                note.status = 'active'
                shouldSave = true
            }
        })
        
        if (shouldSave) {
            utilService.saveToStorage(STORAGE_KEY, notesFromStorage)
        }
    }
}