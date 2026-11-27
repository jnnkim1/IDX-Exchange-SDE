import PropTypes from 'prop-types';

export function getPaginationItems(currentPage, totalPages) {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }

  const items = [1];

  // Show the current page and the pages next to it. Use dots for far-away
  // pages so the pagination bar does not get too long.
  const startPage = Math.max(2, currentPage - 1);
  const endPage = Math.min(totalPages - 1, currentPage + 1);

  if (startPage > 2) {
    items.push('...');
  }

  for (let page = startPage; page <= endPage; page += 1) {
    items.push(page);
  }

  if (endPage < totalPages - 1) {
    items.push('...');
  }

  items.push(totalPages);
  return items;
}

export default function Pagination({
  currentPage,
  totalPages,
  onPageChange,
}) {
  if (totalPages <= 1) {
    return null;
  }

  const items = getPaginationItems(currentPage, totalPages);

  return (
    <nav className="pagination" aria-label="Property results pages">
      <button
        type="button"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
      >
        Previous
      </button>

      {items.map((item, index) =>
        typeof item === 'number' ? (
          <button
            type="button"
            aria-current={item === currentPage ? 'page' : undefined}
            className={item === currentPage ? 'active' : ''}
            key={item}
            onClick={() => onPageChange(item)}
          >
            {item}
          </button>
        ) : (
          <span key={`ellipsis-${index}`} aria-hidden="true">
            {item}
          </span>
        )
      )}

      <button
        type="button"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
      >
        Next
      </button>
    </nav>
  );
}

Pagination.propTypes = {
  currentPage: PropTypes.number.isRequired,
  totalPages: PropTypes.number.isRequired,
  onPageChange: PropTypes.func.isRequired,
};
