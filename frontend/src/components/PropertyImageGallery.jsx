import { useEffect, useRef, useState } from 'react';

export default function PropertyImageGallery({ images }) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [imageError, setImageError] = useState(false);
  const lightboxRef = useRef(null);

  useEffect(() => {
    if (lightboxOpen) {
      lightboxRef.current?.focus();
    }
  }, [lightboxOpen]);

  let parsedImages = [];

  try {
    const parsed =
      typeof images === 'string' ? JSON.parse(images || '[]') : images;

    if (Array.isArray(parsed)) {
      parsedImages = parsed.filter(
        (image) => typeof image === 'string' && image.length > 0
      );
    }
  } catch (error) {
    parsedImages = [];
  }

  if (parsedImages.length === 0) {
    return <div className="gallery-placeholder">No images available</div>;
  }

  function changeImage(newIndex) {
    setSelectedIndex(newIndex);
    setImageError(false);
  }

  function handleLightboxKeyDown(event) {
    if (event.key === 'Escape') {
      setLightboxOpen(false);
    }
  }

  const selectedImage = parsedImages[selectedIndex];

  return (
    <div className="property-image-gallery">
      <div className="gallery-main">
        <button
          type="button"
          className="gallery-main-button"
          onClick={() => setLightboxOpen(true)}
          aria-label="Open enlarged property image"
        >
          {!imageError ? (
            <img
              className="gallery-main-image"
              src={selectedImage}
              alt={`Property view ${selectedIndex + 1}`}
              onError={() => setImageError(true)}
            />
          ) : (
            <div className="gallery-placeholder">Image unavailable</div>
          )}
        </button>

        {parsedImages.length > 1 && (
          <>
            <button
              type="button"
              className="carousel-arrow carousel-arrow-left"
              aria-label="Previous property image"
              onClick={() =>
                changeImage(
                  (selectedIndex - 1 + parsedImages.length) % parsedImages.length
                )
              }
            >
              <span aria-hidden="true">&lsaquo;</span>
            </button>

            <span className="carousel-counter">
              {selectedIndex + 1} of {parsedImages.length}
            </span>

            <button
              type="button"
              className="carousel-arrow carousel-arrow-right"
              aria-label="Next property image"
              onClick={() =>
                changeImage((selectedIndex + 1) % parsedImages.length)
              }
            >
              <span aria-hidden="true">&rsaquo;</span>
            </button>
          </>
        )}
      </div>

      {parsedImages.length > 1 && (
        <div className="gallery-thumbnails" aria-label="Property images">
          {parsedImages.map((image, imageIndex) => (
            <button
              type="button"
              key={`${image}-${imageIndex}`}
              className={
                imageIndex === selectedIndex ? 'thumbnail active' : 'thumbnail'
              }
              onClick={() => changeImage(imageIndex)}
              aria-label={`Show property view ${imageIndex + 1}`}
              aria-pressed={imageIndex === selectedIndex}
            >
              <img src={image} alt="" />
            </button>
          ))}
        </div>
      )}

      {lightboxOpen && (
        <div
          ref={lightboxRef}
          className="lightbox"
          role="dialog"
          aria-modal="true"
          aria-label="Enlarged property image"
          tabIndex={-1}
          onKeyDown={handleLightboxKeyDown}
          onClick={() => setLightboxOpen(false)}
        >
          <button
            type="button"
            className="lightbox-close"
            onClick={() => setLightboxOpen(false)}
            aria-label="Close image"
          >
            <span aria-hidden="true">&times;</span>
          </button>

          <img
            src={selectedImage}
            alt={`Enlarged property view ${selectedIndex + 1}`}
            onClick={(event) => event.stopPropagation()}
          />
        </div>
      )}
    </div>
  );
}
