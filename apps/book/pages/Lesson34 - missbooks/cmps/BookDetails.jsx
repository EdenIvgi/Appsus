const { useParams, useNavigate } = ReactRouterDOM
const { useEffect, useState } = React
import { bookService } from "../services/bookService.js"
import { LongTxt } from "./LongTxt.jsx"
import { showSuccessMsg, showErrorMsg } from "../services/event-bus.service.js"
import { AddReview } from "./AddReview.jsx"

export function BookDetails() {
    const [book, setBook] = useState(null)
    const [nextBookId, setNextBookId] = useState(null)
    const [prevBookId, setPrevBookId] = useState(null)
    const { bookId } = useParams()
    const navigate = useNavigate()

    useEffect(() => {
        loadBook()
        bookService.getNextBookId(bookId).then(setNextBookId)
        bookService.getPrevBookId(bookId).then(setPrevBookId)
    }, [bookId])

    function loadBook() {
        bookService.get(bookId)
            .then(book => setBook(book))
            .catch(err => {
                console.log('err:', err)
                navigate('/book')
            })
    }

    function onBack() {
        navigate('/book')
    }

    function onEdit() {
        navigate(`/book/edit/${bookId}`)
    }

    function onRemove() {
        if (confirm('Are you sure you want to remove this book?')) {
            bookService.remove(bookId)
                .then(() => {
                    showSuccessMsg('Book removed successfully!')
                    navigate('/book')
                })
                .catch(err => {
                    console.log('err:', err)
                    showErrorMsg('Failed to remove book')
                })
        }
    }

    function onReviewAdded() {
        loadBook()
    }

    function onDeleteReview(reviewId) {
        bookService.removeReview(bookId, reviewId)
            .then(() => {
                showSuccessMsg('Review removed!')
                loadBook()
            })
            .catch(() => showErrorMsg('Failed to remove review'))
    }

    function getReadingLevel(pageCount) {
        if (pageCount > 500) return 'Serious Reading'
        if (pageCount > 200) return 'Descent Reading'
        if (pageCount < 100) return 'Light Reading'
        return ''
    }

    function getPublishedLabel(publishedDate) {
        const currentYear = new Date().getFullYear()
        if (currentYear - publishedDate > 10) return 'Vintage'
        if (currentYear - publishedDate < 1) return 'New'
        return ''
    }

    function getPriceClass(amount) {
        if (amount > 150) return 'price-red'
        if (amount < 20) return 'price-green'
        return ''
    }

    if (!book) return <div>Loading...</div>
    return (
        <section className="book-details">
            <h1>{book.title}</h1>
            <h2>{book.subtitle}</h2>
            <img src={book.thumbnail} alt={book.title} />
            <p><strong>Authors:</strong> {book.authors && book.authors.join(', ')}</p>
            <p><strong>Published:</strong> {book.publishedDate} <span>({getPublishedLabel(book.publishedDate)})</span></p>
            <p><strong>Page Count:</strong> {book.pageCount} pages <span>({getReadingLevel(book.pageCount)})</span></p>
            <LongTxt txt={book.description} />
            <p><strong>Categories:</strong> {book.categories && book.categories.join(', ')}</p>
            <p><strong>Language:</strong> {book.language}</p>
            <p><strong>Price:</strong> <span className={getPriceClass(book.listPrice.amount)}>{book.listPrice.amount} {book.listPrice.currencyCode}</span>
                {book.listPrice.isOnSale && <span className="on-sale-sign"> On Sale!</span>}
            </p>
            <div className="book-actions">
                <button onClick={onBack}>Back</button>
                <button onClick={onEdit} className="edit-btn">Edit</button>
                <button onClick={onRemove} className="remove-btn">Remove</button>
                {prevBookId && <button onClick={() => navigate(`/book/${prevBookId}`)} className="details-btn">Prev</button>}
                {nextBookId && <button onClick={() => navigate(`/book/${nextBookId}`)} className="details-btn">Next</button>}
            </div>

            <hr style={{margin: '2rem 0'}} />
            <AddReview bookId={bookId} onReviewAdded={onReviewAdded} />
            <h3>Reviews</h3>
            <ul className="review-list">
                {book.reviews && book.reviews.length > 0 ? book.reviews.map(r => (
                    <li key={r.id} className="review-item">
                        <strong>{r.fullname}</strong> &mdash; <span>{'★'.repeat(+r.rating)}{'☆'.repeat(5 - +r.rating)}</span> <br/>
                        <small>Read at: {r.readAt}</small>
                        <button className="remove-btn" onClick={() => onDeleteReview(r.id)}>Delete</button>
                    </li>
                )) : <li>No reviews yet.</li>}
            </ul>
        </section>
    )
} 