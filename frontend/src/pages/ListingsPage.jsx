import PropertyCard from '../components/PropertyCard';
import Pagination from '../components/Pagination';
import PropertyFilters from './PropertyFilters';
import PropertySort from './PropertySort';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchProperties } from '../api/client';

const PAGE_SIZE = 20;

const DEFAULT_SORT = {
  sortBy: 'id',
  sortOrder: 'ASC',
};

export default function ListingsPage({ isFavorite = () => false, toggleFavorite = () => {} }) {
  const navigate = useNavigate();
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [total, setTotal] = useState(0);
  const [activeFilters, setActiveFilters] = useState({});
  const [activeSort, setActiveSort] = useState(DEFAULT_SORT);
  const [currentPage, setCurrentPage] = useState(1);

  const offset = (currentPage - 1) * PAGE_SIZE;
  const totalPages = Math.ceil(total / PAGE_SIZE);

  const firstResult = total === 0 ? 0 : offset + 1;
  const lastResult = offset + properties.length;

  function handleFilterSubmit(newFilters) {
    setActiveFilters(newFilters);
    setActiveSort(DEFAULT_SORT);
    setCurrentPage(1);
  }

  function handleSortSubmit(sort) {
    setActiveSort(sort);
    setCurrentPage(1);
  }

  function handlePageChange(newPage) {
    if (newPage < 1 || newPage > totalPages) {
      return;
    }
    setCurrentPage(newPage);
  }

  function handlePropertyClick(property) {
    navigate(`/property/${property.L_ListingID}`);
  }

  useEffect(() => {
    const loadProperties = async () => {
      setLoading(true);
      setError(null);

      try {

        const data = await fetchProperties({ ...activeFilters, ...activeSort, limit: PAGE_SIZE, offset: offset });
        setProperties(data.results);
        setTotal(data.total);
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    loadProperties();
  }, [activeFilters, activeSort, offset]);

  return (
    <>
      <PropertyFilters onSearch={handleFilterSubmit} />

      {loading ? (
        <p className="listings-status">Loading properties...</p>
      ) : error ? (
        <p className="listings-status listings-error">Error: {error}</p>
      ) : (
        <>
          <div className="results-toolbar">
            <p>Showing {firstResult}-{lastResult} of {total} properties</p>
            <PropertySort
              onSubmit={handleSortSubmit}
              value={activeSort}
            />
          </div>

          {properties.length === 0 ? (
            <p>No properties match your filters.</p>
          ) : (
            <div className="property-grid">
              {properties.map((property) => (
                <PropertyCard
                  key={property.L_ListingID}
                  onClick={() => handlePropertyClick(property)}
                  image={property.L_Photos}
                  price={property.L_SystemPrice}
                  address={property.L_Address}
                  city={property.L_City}
                  state={property.L_State}
                  bedrooms={property.L_Keyword2}
                  bathrooms={property.LM_Dec_3}
                  squareFeet={property.LM_Int2_3}
                  isFavorite={isFavorite(property.L_ListingID)}
                  onFavoriteToggle={() => toggleFavorite(property)}
                />
              ))}
            </div>
          )}
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        </>
      )}
    </>
  );
}
