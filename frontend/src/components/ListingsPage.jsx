import PropertyCard from './PropertyCard';
import PropertyFilters from './PropertyFilters';
import { useState, useEffect } from 'react';
import { fetchProperties } from '../api/client';

const PAGE_SIZE = 20;

function getPagination(currentPage, totalPages) {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }
  
  const pages = [1];
  const startPage = Math.max(2, currentPage - 1);
  const endPage = Math.min(totalPages - 1, currentPage + 1);

  if (startPage > 2) {
    pages.push('...');
  }

  for (let i = startPage; i <= endPage; i++) {
    pages.push(i);
  }

  if (endPage < totalPages - 1) {
    pages.push('...');
  }

  pages.push(totalPages);

  return pages;
}

export default function ListingsPage() {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [total, setTotal] = useState(0);
  const [activeFilters, setActiveFilters] = useState({});
  const [currentPage, setCurrentPage] = useState(1);

  const offset = (currentPage - 1) * PAGE_SIZE;
  const totalPages = Math.ceil(total / PAGE_SIZE);

  const firstResult = total === 0 ? 0 : offset + 1;
  const lastResult = offset + properties.length;

  const pagination = getPagination(currentPage, totalPages);

  function handleFilterSubmit(newFilters) {
    setActiveFilters(newFilters);
    setCurrentPage(1);
  }

  function handlePageChange(newPage) {
    if (newPage < 1 || newPage > totalPages) {
      return;
    }
    setCurrentPage(newPage);
  }

  useEffect(() => {
    const loadProperties = async () => {
      setLoading(true);
      setError(null);

      try {

        const data = await fetchProperties({ ...activeFilters, limit: PAGE_SIZE, offset: offset });
        setProperties(data.results);
        setTotal(data.total);
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    loadProperties();
  }, [activeFilters, offset]);

  return (
    <>
      <PropertyFilters onSubmit={handleFilterSubmit} />

      {loading ? (
        <p>Loading properties...</p>
      ) : error ? (
        <p>Error: {error}</p>
      ) : (
        <>
          <p>Showing {firstResult}-{lastResult} of {total} properties</p>

          {properties.length === 0 ? (
            <p>No properties match your filters.</p>
          ) : (
            <div className="property-grid">
              {properties.map((property) => (
                <PropertyCard
                  key={property.L_ListingID}
                  image={property.L_Photos}
                  price={property.L_SystemPrice}
                  address={property.L_Address}
                  city={property.L_City}
                  state={property.L_State}
                  bedrooms={property.L_Keyword2}
                  bathrooms={property.LM_Dec_3}
                  squareFeet={property.LM_Int2_3}
                />
              ))}
            </div>
          )}
          {totalPages > 1 && (
            <div className="pagination">
              <button onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1}>
                Previous
              </button>
              {pagination.map((item, index) => (
                typeof item === 'number' ? (
                <button
                  aria-current={item === currentPage ? 'page' : undefined}
                  className={item === currentPage ? 'active' : ''}
                  key={item}
                  onClick={() => handlePageChange(item)}
                >
                  {item}
                </button>
              ) : (
                <span key={`ellipsis-${index}`}>{item}</span>
              )
              ))}

              <button onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage >= totalPages}>
                Next
              </button>
            </div>
          )}
        </>
      )}
    </>
  );
}
