import { utilService } from './util.service.js'
import { storageService } from './asyncStorageService.js'

const BOOK_KEY = 'bookDB'
_createBooks()

export const bookService = {
    query,
    get,
    remove,
    save,
    getEmptyBook,
    getDefaultFilter,
    getCategories,
    getAuthors,
    addReview,
    removeReview,
    getNextBookId,
    getPrevBookId,
    addGoogleBook,
    mapGoogleBookToAppBook,
    getBooksFromGoogle,
    getBooksFromGoogleMod
}

function query(filterBy = {}) {
    return storageService.query(BOOK_KEY)
        .then(books => {
            if (filterBy.txt) {
                const regExp = new RegExp(filterBy.txt, 'i')
                books = books.filter(book =>
                    regExp.test(book.title)
                    || regExp.test(book.description)
                    || book.authors.includes(filterBy.txt)
                    || regExp.test(book.subtitle)
                    || book.categories.includes(filterBy.txt)
                )
            }
            if (filterBy.minPrice) {
                books = books.filter(book => book.listPrice.amount >= filterBy.minPrice)
            }
            if (filterBy.maxPrice) {
                books = books.filter(book => book.listPrice.amount <= filterBy.maxPrice)
            }
            return books
        })
}

function get(bookId) {
    return storageService.get(BOOK_KEY, bookId)
}

function remove(bookId) {
    return storageService.remove(BOOK_KEY, bookId)
}

function save(book) {
    if (book.id) {
        return storageService.put(BOOK_KEY, book)
    } else {
        return storageService.post(BOOK_KEY, book)
    }
}

function getEmptyBook(vendor = '', speed = '') {
    return { vendor, speed }
}

function getDefaultFilter() {
    return { txt: '', minPrice: '', maxPrice: '' }
}

function getCategories() {
    return query().then(books =>
        [...new Set(books.flatMap(book => book.categories))]
    )
}
function getAuthors() {
    return query().then(books =>
        [...new Set(books.flatMap(book => book.authors))]
    )
}

function _createBooks() {
    let books = JSON.parse(localStorage.getItem(BOOK_KEY))
    if (!books || !books.length) {
        const ctgs = ['Love', 'Fiction', 'Poetry', 'Computers', 'Religion']
        books = []
        for (let i = 0; i < 20; i++) {
            const book = {
                id: utilService.makeId(),
                title: utilService.makeLorem(2),
                subtitle: utilService.makeLorem(4),
                authors: [
                    utilService.makeLorem(1)
                ],
                publishedDate: utilService.getRandomIntInclusive(1950, 2024),
                description: utilService.makeLorem(20),
                pageCount: utilService.getRandomIntInclusive(20, 600),
                categories: [ctgs[utilService.getRandomIntInclusive(0, ctgs.length - 1)]],
                thumbnail: `http://coding-academy.org/books-photos/${i + 1}.jpg`,
                language: "en",
                listPrice: {
                    amount: utilService.getRandomIntInclusive(80, 500),
                    currencyCode: "EUR",
                    isOnSale: Math.random() > 0.7
                }
            }
            books.push(book)
        }
        localStorage.setItem(BOOK_KEY, JSON.stringify(books))
    }
}

function addReview(bookId, review) {
    return get(bookId).then(book => {
        if (!book.reviews) book.reviews = [];
        review.id = utilService.makeId();
        book.reviews.push(review);
        return save(book).then(() => review);
    });
}

function removeReview(bookId, reviewId) {
    return get(bookId).then(book => {
        if (!book.reviews) return Promise.reject('No reviews to remove');
        book.reviews = book.reviews.filter(r => r.id !== reviewId);
        return save(book);
    });
}

function getNextBookId(bookId) {
    return query().then(books => {
        const idx = books.findIndex(book => book.id === bookId)
        if (idx === -1) return null
        return books[(idx + 1) % books.length].id
    })
}

function getPrevBookId(bookId) {
    return query().then(books => {
        const idx = books.findIndex(book => book.id === bookId)
        if (idx === -1) return null
        return books[(idx - 1 + books.length) % books.length].id
    })
}

function addGoogleBook(googleBook) {
    const mappedBook = mapGoogleBookToAppBook(googleBook)
    return query().then(books => {
        if (books.some(b => b.id === mappedBook.id)) {
            return Promise.reject('Book already exists');
        }
        return save(mappedBook);
    });
}

function mapGoogleBookToAppBook(googleBook) {
    const info = googleBook.volumeInfo
    return {
        id: googleBook.id || utilService.makeId(),
        title: info.title || 'Untitled',
        subtitle: info.subtitle || utilService.makeLorem(4),
        authors: info.authors || [],
        publishedDate: info.publishedDate || '',
        description: info.description || utilService.makeLorem(20),
        pageCount: info.pageCount || utilService.getRandomIntInclusive(20, 600),
        categories: info.categories || [],
        thumbnail: (info.imageLinks && info.imageLinks.thumbnail) ? info.imageLinks.thumbnail : `BooksImages/${utilService.getRandomIntInclusive(1, 20)}.jpg`,
        language: info.language || 'en',
        listPrice: {
            amount: utilService.getRandomIntInclusive(80, 500),
            currencyCode: "EUR",
            isOnSale: Math.random() > 0.7
        }
    }
}

function getBooksFromGoogle(searchTerm) {
    if (!searchTerm) return Promise.resolve([])
    const apiKey = 'AIzaSyDMH47YocQU9movVE3rddkcS0-FlF1ksFU'
    const url = `https://www.googleapis.com/books/v1/volumes?printType=books&q=${encodeURIComponent(searchTerm)}&key=${apiKey}`
    
    return fetch(url)
        .then(res => res.json())
        .then(data => {
            if (!data.items) return []
            return data.items
        })
        .catch(err => {
            console.error('Error fetching from Google Books API:', err)
            return []
        })
}

function getBooksFromGoogleMod(searchTerm) {
    return getBooksFromGoogle(searchTerm)
        .then(books => books.map(mapGoogleBookToAppBook))
} 