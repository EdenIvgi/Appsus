// note service
import { storageService } from '../../services/async-storage.service.js'
import { utilService } from '../../services/util.service.js'

const STORAGE_KEY = 'notesDB'

// Sample notes data
const notes = [
    {
        id: 'n101',
        createdAt: 1112222,
        type: 'NoteTxt',
        isPinned: true,
        style: { backgroundColor: '#00d' },
        info: { txt: 'Fullstack Me Baby!' }
    },
    {
        id: 'n102',
        createdAt: 1112223,
        type: 'NoteImg',
        isPinned: false,
        info: { url: 'http://some-img/me', title: 'Bobi and Me' },
        style: { backgroundColor: '#00d' }
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
        }
    }
]

// Create notes in storage if they don't exist
_createNotes()

export const noteService = {
    query,
    getById,
    save,
    remove,
    getEmptyNote,
    getFilterFromParams,
    getDefaultFilter
}

function query(filterBy = {}) {
    return storageService.query(STORAGE_KEY)
        .then(notes => {
            if (filterBy.txt) {
                const regex = new RegExp(filterBy.txt, 'i')
                notes = notes.filter(note => 
                    note.info.txt?.includes(filterBy.txt) ||
                    note.info.title?.includes(filterBy.txt) ||
                    note.info.todos?.some(todo => todo.txt.includes(filterBy.txt))
                )
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
        info: {}
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

function _createNotes() {
    let notesFromStorage = storageService.loadFromStorage(STORAGE_KEY)
    if (!notesFromStorage || !notesFromStorage.length) {
        notesFromStorage = notes
        storageService.saveToStorage(STORAGE_KEY, notesFromStorage)
    }
}