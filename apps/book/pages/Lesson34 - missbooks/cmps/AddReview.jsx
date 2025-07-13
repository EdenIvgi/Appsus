const { useState } = React;
import { bookService } from '../services/bookService.js'
import { showSuccessMsg, showErrorMsg } from '../services/event-bus.service.js'

export function AddReview({ bookId, onReviewAdded }) {
    const [review, setReview] = useState({ fullname: '', rating: 5, readAt: '' })
    const [submitting, setSubmitting] = useState(false)

    function handleChange({ target }) {
        const { name, value } = target
        setReview(prev => ({ ...prev, [name]: value }))
    }

    function onSubmit(ev) {
        ev.preventDefault()
        setSubmitting(true)
        bookService.addReview(bookId, review)
            .then(() => {
                showSuccessMsg('Review added!')
                setReview({ fullname: '', rating: 5, readAt: '' })
                onReviewAdded && onReviewAdded()
            })
            .catch(() => showErrorMsg('Failed to add review'))
            .finally(() => setSubmitting(false))
    }

    return (
        <form className="add-review" onSubmit={onSubmit}>
            <h3>Add Review</h3>
            <label>
                Full Name
                <input name="fullname" value={review.fullname} onChange={handleChange} required />
            </label>
            <label>
                Rating
                <select name="rating" value={review.rating} onChange={handleChange} required>
                    {[1,2,3,4,5].map(n => <option key={n} value={n}>{'★'.repeat(n)}{'☆'.repeat(5-n)}</option>)}
                </select>
            </label>
            <label>
                Read At
                <input name="readAt" type="date" value={review.readAt} onChange={handleChange} required />
            </label>
            <button type="submit" disabled={submitting}>Add Review</button>
        </form>
    )
} 