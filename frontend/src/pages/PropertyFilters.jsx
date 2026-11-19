import { useState } from 'react';

const initialFilters = {
    city: '',
    zipcode: '',
    minPrice: '',
    maxPrice: '',
    beds: '',
    baths: '',
};

export default function PropertyFilters({ onSubmit }) {

    const [filters, setFilters] = useState(initialFilters);

    function handleFilterChange(event) {
        const { name, value } = event.target;

        setFilters((previousFilters) => ({
            ...previousFilters,
            [name]: value,
        }));
    }

    function handleFilterSubmit(event) {
        event.preventDefault();
        onSubmit(filters);
    }

    function handleClearFilters() {
        setFilters(initialFilters);
        onSubmit(initialFilters);
    }

    return (
        <div className="property-filters">
            <form onSubmit={handleFilterSubmit}>
                <div className="filter-field">
                    <label htmlFor="city">City</label>
                    <input
                        type="text"
                        id="city"
                        name="city"
                        placeholder="Any city"
                        value={filters.city}
                        onChange={handleFilterChange}
                    />
                </div>

                <div className="filter-field">
                    <label htmlFor="zipcode">ZIP code</label>
                    <input
                        type="text"
                        id="zipcode"
                        name="zipcode"
                        placeholder="Any ZIP"
                        value={filters.zipcode}
                        onChange={handleFilterChange}
                    />
                </div>

                <div className="filter-field">
                    <label htmlFor="minPrice">Min price</label>
                    <input
                        type="number"
                        id="minPrice"
                        name="minPrice"
                        placeholder="No minimum"
                        value={filters.minPrice}
                        onChange={handleFilterChange}
                    />
                </div>

                <div className="filter-field">
                    <label htmlFor="maxPrice">Max price</label>
                    <input
                        type="number"
                        id="maxPrice"
                        name="maxPrice"
                        placeholder="No maximum"
                        value={filters.maxPrice}
                        onChange={handleFilterChange}
                    />
                </div>

                <div className="filter-field">
                    <label htmlFor="beds">Beds</label>
                    <select
                        id="beds"
                        name="beds"
                        value={filters.beds}
                        onChange={handleFilterChange}
                    >
                        <option value="">Any beds</option>
                        <option value="1">1</option>
                        <option value="2">2</option>
                        <option value="3">3</option>
                        <option value="4">4</option>
                        <option value="5">5</option>
                        <option value="6">6</option>
                        <option value="7">7</option>
                        <option value="8">8</option>
                        <option value="9">9</option>
                        <option value="10">10</option>
                    </select>
                </div>

                <div className="filter-field">
                    <label htmlFor="baths">Baths</label>
                    <select
                        id="baths"
                        name="baths"
                        value={filters.baths}
                        onChange={handleFilterChange}
                    >
                        <option value="">Any baths</option>
                        <option value="1">1</option>
                        <option value="2">2</option>
                        <option value="3">3</option>
                        <option value="4">4</option>
                        <option value="5">5</option>
                        <option value="6">6</option>
                        <option value="7">7</option>
                        <option value="8">8</option>
                        <option value="9">9</option>
                        <option value="10">10</option>
                    </select>
                </div>

                <div className="filter-actions">
                    <button type="submit">Apply</button>
                    <button type="button" onClick={handleClearFilters}>
                        Clear
                    </button>
                </div>
            </form>
        </div>
    );
}
