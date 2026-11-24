import { act, renderHook } from '@testing-library/react';
import useFavorites, {
  FAVORITES_STORAGE_KEY,
} from './useFavorites';

const property = {
  L_ListingID: '123',
  L_Address: '1 Test Street',
};

beforeEach(() => {
  localStorage.clear();
});

test('loads saved favorites from localStorage', () => {
  localStorage.setItem(
    FAVORITES_STORAGE_KEY,
    JSON.stringify([property])
  );

  const { result } = renderHook(() => useFavorites());

  expect(result.current.favorites).toEqual([property]);
  expect(result.current.favoriteCount).toBe(1);
  expect(result.current.isFavorite('123')).toBe(true);
});

test('adds and removes a favorite', () => {
  const { result } = renderHook(() => useFavorites());

  act(() => {
    result.current.toggleFavorite(property);
  });

  expect(result.current.favoriteCount).toBe(1);
  expect(result.current.isFavorite('123')).toBe(true);

  act(() => {
    result.current.toggleFavorite(property);
  });

  expect(result.current.favoriteCount).toBe(0);
  expect(result.current.isFavorite('123')).toBe(false);
});