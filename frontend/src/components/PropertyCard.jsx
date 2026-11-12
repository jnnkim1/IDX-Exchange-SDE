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

      {content}
    </article>
  );
}
