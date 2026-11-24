import { useEffect, useState } from 'react';

export const FAVORITES_STORAGE_KEY = 'idx-exchange-favorites';

function loadStoredFavorites() {
  try {
    const storedFavorites = localStorage.getItem(FAVORITES_STORAGE_KEY);

    if (!storedFavorites) {
      return [];
    }

    const parsedFavorites = JSON.parse(storedFavorites);
    return Array.isArray(parsedFavorites) ? parsedFavorites : [];
  } catch {
    return [];
  }
}

export default function useFavorites() {
  const [favorites, setFavorites] = useState(loadStoredFavorites);

  useEffect(() => {
    try {
      localStorage.setItem(
        FAVORITES_STORAGE_KEY,
        JSON.stringify(favorites)
      );
    } catch {
    }
  }, [favorites]);

  function isFavorite(listingId) {
    return favorites.some(
      (property) =>
        String(property.L_ListingID) === String(listingId)
    );
  }

  function toggleFavorite(property) {
    if (!property?.L_ListingID) {
      return;
    }

    setFavorites((currentFavorites) => {
      const alreadySaved = currentFavorites.some(
        (favorite) =>
          String(favorite.L_ListingID) ===
          String(property.L_ListingID)
      );

      if (alreadySaved) {
        return currentFavorites.filter(
          (favorite) =>
            String(favorite.L_ListingID) !==
            String(property.L_ListingID)
        );
      }

      return [...currentFavorites, property];
    });
  }

  return {
    favorites,
    favoriteCount: favorites.length,
    isFavorite,
    toggleFavorite,
  };
}