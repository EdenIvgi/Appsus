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
    getBooksFromGoogle,
    getBooksFromGoogleMod,
}

window.bookService = bookService

function query(filterBy = {}) {
    return storageService.query(BOOK_KEY)
        .then(books => {
            if (filterBy.txt) {
                const regExp = new RegExp(filterBy.txt, 'i')
                books = books.filter(book => regExp.test(book.title) || regExp.test(book.description))
            }
            if (filterBy.minPrice !== undefined) {
                books = books.filter(book => book.listPrice.amount >= filterBy.minPrice)
            }
            if (filterBy.maxPrice !== undefined) {
                books = books.filter(book => book.listPrice.amount <= filterBy.maxPrice)
            }
            if (filterBy.category) {
                books = books.filter(book => book.categories.includes(filterBy.category))
            }
            if (filterBy.author) {
                books = books.filter(book => book.authors.includes(filterBy.author))
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
    return { id: '', vendor, speed }
}

function getDefaultFilter() {
    return { txt: '', minPrice: '', maxPrice: '', category: '', author: '' }
}

function getCategories() {
    return ['Computers', 'Hack', 'Fiction', 'Biography', 'History', 'Science', 'Travel']
}

function getAuthors() {
    return ['John Doe', 'Jane Smith', 'Bob Johnson', 'Alice Williams', 'Mike Brown']
}

function _createBooks() {
    let books = utilService.loadFromStorage(BOOK_KEY)
    if (!books || !books.length) {
        books = [
            _createBook('metus hendrerit', 'Fiction', ['John Doe'], 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.', 'https://example.com/book1.jpg', 2014, 29.99, 'USD'),
            _createBook('euismod nulla', 'Biography', ['Jane Smith'], 'Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.', 'https://example.com/book2.jpg', 2018, 19.99, 'USD'),
            _createBook('Duis aute irure dolor', 'Science', ['Bob Johnson'], 'Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.', 'https://example.com/book3.jpg', 2020, 39.99, 'USD'),
        ]
        utilService.saveToStorage(BOOK_KEY, books)
    }
}

function _createBook(title, category, authors, description, thumbnail, publishedDate, price, currencyCode) {
    const book = getEmptyBook()
    book.id = utilService.makeId()
    book.title = title
    book.subtitle = ''
    book.authors = authors
    book.publishedDate = publishedDate
    book.description = description
    book.pageCount = utilService.getRandomIntInclusive(100, 500)
    book.categories = [category]
    book.thumbnail = thumbnail
    book.language = 'en'
    book.listPrice = {
        amount: price,
        currencyCode,
        isOnSale: Math.random() > 0.7
    }
    book.reviews = []
    return book
}

function addReview(bookId, review) {
    return get(bookId).then(book => {
        if (!book.reviews) book.reviews = []
        review.id = utilService.makeId()
        book.reviews.push(review)
        return save(book)
    })
}

function removeReview(bookId, reviewId) {
    return get(bookId).then(book => {
        book.reviews = book.reviews.filter(review => review.id !== reviewId)
        return save(book)
    })
}

function getNextBookId(bookId) {
    return storageService.query(BOOK_KEY).then(books => {
        const bookIdx = books.findIndex(book => book.id === bookId)
        return books[bookIdx + 1] ? books[bookIdx + 1].id : books[0].id
    })
}

function getPrevBookId(bookId) {
    return storageService.query(BOOK_KEY).then(books => {
        const bookIdx = books.findIndex(book => book.id === bookId)
        return books[bookIdx - 1] ? books[bookIdx - 1].id : books[books.length - 1].id
    })
}

function addGoogleBook(googleBook) {
    const book = mapGoogleBookToAppBook(googleBook)
    return save(book)
}

function mapGoogleBookToAppBook(googleBook) {
    const book = getEmptyBook()
    book.id = googleBook.id
    book.title = googleBook.volumeInfo.title || 'Unknown Title'
    book.subtitle = googleBook.volumeInfo.subtitle || ''
    book.authors = googleBook.volumeInfo.authors || ['Unknown Author']
    book.publishedDate = googleBook.volumeInfo.publishedDate || 'Unknown'
    book.description = googleBook.volumeInfo.description || 'No description available'
    book.pageCount = googleBook.volumeInfo.pageCount || 0
    book.categories = googleBook.volumeInfo.categories || ['Unknown']
    book.thumbnail = googleBook.volumeInfo.imageLinks?.thumbnail || 'https://via.placeholder.com/128x193?text=No+Image'
    book.language = googleBook.volumeInfo.language || 'en'
    book.listPrice = {
        amount: googleBook.saleInfo?.listPrice?.amount || 0,
        currencyCode: googleBook.saleInfo?.listPrice?.currencyCode || 'USD',
        isOnSale: googleBook.saleInfo?.saleability === 'FOR_SALE'
    }
    book.reviews = []
    return book
}

function getBooksFromGoogle(searchTerm) {
    const API_KEY = 'AIzaSyBxcVK7EQAGIJd6UZ9gBZNFJ6QqQhCROVA'
    const url = `https://www.googleapis.com/books/v1/volumes?q=${searchTerm}&key=${API_KEY}`
    return fetch(url)
        .then(response => response.json())
        .then(data => data.items || [])
        .catch(error => {
            console.error('Error fetching books from Google:', error)
            return []
        })
}

function getBooksFromGoogleMod(searchTerm) {
    return getBooksFromGoogle(searchTerm)
} 