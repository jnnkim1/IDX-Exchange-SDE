import { useMemo } from 'react';
import { parsePropertyPhotos } from '../utils/propertyPhotos';

export default function usePropertyPhotos(images) {
  return useMemo(() => parsePropertyPhotos(images), [images]);
}