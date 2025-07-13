const { useState, useEffect } = React;

export function BookFilter({ defaultFilter, onSetFilter }) {
    const [filterByToEdit, setFilterByToEdit] = useState(defaultFilter);

    useEffect(() => {
        onSetFilter(filterByToEdit);
    }, [filterByToEdit]);

    function handleChange({ target }) {
        const { name, value, type } = target;
        const val = (type === 'number') ? +value : value;
        setFilterByToEdit(prevFilter => ({ ...prevFilter, [name]: val }));
    }

    const { txt, minPrice, maxPrice } = filterByToEdit;
    return (
        <section className="book-filter">
            <h2>Filter our books</h2>
            <form>
                <label htmlFor="txt">Title</label>
                <input value={txt} onChange={handleChange}
                type="text"
                    placeholder="By Text"
                    id="txt"
                    name="txt"
                />

                <label htmlFor="minPrice">Min Price</label>
                <input value={minPrice} onChange={handleChange}
                type="number"
                    placeholder="By Min Price"
                    id="minPrice"
                name="minPrice"
                />

                <label htmlFor="maxPrice">Max Price</label>
                <input value={maxPrice} onChange={handleChange}
                    type="number"
                    placeholder="By Max Price"
                    id="maxPrice"
                    name="maxPrice"
                />
            </form>
        </section>
    );
} 