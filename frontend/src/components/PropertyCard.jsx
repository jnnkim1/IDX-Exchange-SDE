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
  const cardClass =
    "property-card";

  let firstPhoto = null;
  try {
    let images = JSON.parse(image || '[]');
    if (Array.isArray(images) && images.length > 0) {
      firstPhoto = images[0];
    }
  } catch (error) {
    firstPhoto = null;
    console.error('Error parsing image:', error);
  }
  const content = (
    <>
      {firstPhoto ? (
        <img
          className="property-card-image"
          src={firstPhoto}
          alt={`Property at ${address}, ${city}, ${state}`}
        />
      ) : (
        <p className="text-lg text-gray-400">No image available</p>
      )}
      <div className="property-card-details">
        <h3 className="text-2xl font-bold">${price}</h3>
        <p className="text-lg">{address}</p>
        <p className="text-lg">{city}, {state}</p>
        <p className="text-lg">{bedrooms} beds | {bathrooms} baths | {squareFeet} sqft</p>
      </div>
    </>
  );

  return (
    <button
      type="button"
      className={cardClass}
      onMouseEnter={onHover}
      onMouseLeave={onHover}
      onClick={onClick}
      aria-label={`View property at ${address}, ${city}, ${state}`}
    >

      {content}
    </button>
  );
}
