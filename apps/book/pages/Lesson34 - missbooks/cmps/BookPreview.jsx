export function BookPreview({ book }) {

    function getPriceClass(amount) {
        if (amount > 150) return 'price-red';
        if (amount < 20) return 'price-green';
        return '';
    }

    // Defensive: handle missing listPrice or amount
    const amount = book.listPrice && typeof book.listPrice.amount === 'number' ? book.listPrice.amount : null;
    const isOnSale = book.listPrice && book.listPrice.isOnSale;

    return (
        <article className="book-preview">
            <h3>{book.title}</h3>
            <p className={getPriceClass(amount)}>
                Price: <span>{amount !== null ? `$${amount}` : 'N/A'}</span>
                {isOnSale && <span className="on-sale-sign"> On Sale!</span>}
            </p>
            <img src={book.thumbnail} alt={book.title} />
        </article>
    )
} 