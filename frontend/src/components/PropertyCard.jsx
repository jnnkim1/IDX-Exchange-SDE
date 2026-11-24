import PropTypes from 'prop-types';
import PropertyImageCarousel from './PropertyImageCarousel';

export default function PropertyCard({
  image,
  price,
  address,
  city,
  state,
  bedrooms,
  bathrooms,
  squareFeet,
  onHover,
  onClick,
  isFavorite,
  onFavoriteToggle,
}) {
  const numericPrice = Number(price);
  const formattedPrice =
    price === null ||
      price === undefined ||
      price === '' ||
      !Number.isFinite(numericPrice)
      ? 'Price unavailable'
      : numericPrice.toLocaleString('en-US');

  const cardClass =
    "property-card";

  const content = (
    <>
      <PropertyImageCarousel
        images={image}
        alt={`Property at ${address}, ${city}, ${state}`}
      />
      <div className="property-card-details">
        <h3 className="text-2xl font-bold">${formattedPrice}</h3>
        <p className="text-lg">{address}</p>
        <p className="text-lg">{city}, {state}</p>
        <p className="text-lg">{bedrooms} beds | {bathrooms} baths | {squareFeet} sqft</p>
      </div>
    </>
  );

  function handleFavoriteClick(event) {
    event.stopPropagation();
    onFavoriteToggle?.();
  }

  function handleFavoriteKeyDown(event) {
    event.stopPropagation();
  }

  function handleKeyDown(event) {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      onClick?.();
    }
  }

  return (
    <article
      className={cardClass}
      role="link"
      tabIndex="0"
      onMouseEnter={onHover}
      onMouseLeave={onHover}
      onClick={onClick}
      onKeyDown={handleKeyDown}
      aria-label={`View property at ${address}, ${city}, ${state}`}
    >
      <button
        type="button"
        className={
          isFavorite
            ? 'favorite-button is-favorite'
            : 'favorite-button'
        }
        aria-label={
          isFavorite
            ? `Remove ${address} from favorites`
            : `Add ${address} to favorites`
        }
        aria-pressed={isFavorite}
        onClick={handleFavoriteClick}
        onKeyDown={handleFavoriteKeyDown}
      >
        <span aria-hidden="true">
          {isFavorite ? '\u2665' : '\u2661'}
        </span>
      </button>
      {content}
    </article>
  );
}

PropertyCard.propTypes = {
  image: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.arrayOf(PropTypes.string),
  ]),
  price: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  address: PropTypes.string,
  city: PropTypes.string,
  state: PropTypes.string,
  bedrooms: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  bathrooms: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  squareFeet: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  onHover: PropTypes.func,
  onClick: PropTypes.func,
  isFavorite: PropTypes.bool,
  onFavoriteToggle: PropTypes.func,
};