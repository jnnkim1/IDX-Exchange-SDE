import { useState } from 'react';

export default function PropertyImageCarousel({ images, alt = 'Property' }) {
  const [imageError, setImageError] = useState(false);
  const [index, setIndex] = useState(0);

  let parsedImages = [];

  try {
    const parsed = typeof images === 'string' ? JSON.parse(images || '[]') : images;
    
    if (Array.isArray(parsed)) {
      parsedImages = parsed.filter(
        (image) =>
          typeof image === 'string' &&
          image.length > 0
      );
    }
    
  } catch (error) {

    parsedImages = [];
  }

  const totalImages = parsedImages.length;

  function changeImage(newIndex) {
    setIndex(newIndex);
    setImageError(false);
  }

  function handleControlClick(event, newIndex) {
    event.stopPropagation();
    changeImage(newIndex);
  }

  if (totalImages === 0) {
    return <div className="property-card-image-placeholder">No images available</div>;
  }
  
  return (
    <div className="property-image-carousel">
      {!imageError ? (
        <img
          className="property-card-image"
          src={parsedImages[index]}
          alt={`${alt}, view ${index + 1} of ${totalImages}`}
          onError={() => setImageError(true)}
        />
      ) : (
        <div className="property-card-image-placeholder">
          No image available
        </div>
      )}
      {totalImages > 1 && (
        <>
          <button
            type="button"
            className="carousel-arrow carousel-arrow-left"
            aria-label="Previous property photo"
            onClick={(event) =>
              handleControlClick(event, (index - 1 + totalImages) % totalImages)
            }
            onKeyDown={(event) => event.stopPropagation()}
          >
            <span aria-hidden="true">&lsaquo;</span>
          </button>

          <span className="carousel-counter">
            {index + 1} of {totalImages}
          </span>

          <button
            type="button"
            className="carousel-arrow carousel-arrow-right"
            aria-label="Next property photo"
            onClick={(event) =>
              handleControlClick(event, (index + 1) % totalImages)
            }
            onKeyDown={(event) => event.stopPropagation()}
          >
            <span aria-hidden="true">&rsaquo;</span>
          </button>
        </>
      )}
    </div>
  );
}
