export function parsePropertyPhotos(images) {
  let parsedImages = images;

  // Photos may come from MySQL as JSON text or already be an array. Support
  // both so missing or unusual data does not crash the page.
  if (typeof images === 'string') {
    try {
      parsedImages = JSON.parse(images);
    } catch {
      return [];
    }
  }

  if (!Array.isArray(parsedImages)) {
    return [];
  }

  return parsedImages.filter(
    (image) => typeof image === 'string' && image.trim().length > 0
  );
}
