export function parsePropertyPhotos(images) {
  let parsedImages = images;

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