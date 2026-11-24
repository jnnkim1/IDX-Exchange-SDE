import PropTypes from 'prop-types';
import { Link, useNavigate } from 'react-router-dom';
import PropertyCard from '../components/PropertyCard';

export default function FavoritesPage({
  favorites,
  isFavorite,
  toggleFavorite,
}) {
  const navigate = useNavigate();

  return (
    <section className="favorites-page">
      <div className="favorites-heading">
        <div>
          <h1>Favorite Properties</h1>
          <p>
            {favorites.length}{' '}
            {favorites.length === 1 ? 'property' : 'properties'} saved
          </p>
        </div>

        <Link to="/">Browse properties</Link>
      </div>

      {favorites.length === 0 ? (
        <div className="favorites-empty">
          <h2>No favorites yet</h2>
          <p>
            Select the heart on a property to save it here.
          </p>
          <Link to="/">View properties</Link>
        </div>
      ) : (
        <div className="property-grid">
          {favorites.map((property) => (
            <PropertyCard
              key={property.L_ListingID}
              onClick={() =>
                navigate(`/property/${property.L_ListingID}`)
              }
              image={property.L_Photos}
              price={property.L_SystemPrice}
              address={property.L_Address}
              city={property.L_City}
              state={property.L_State}
              bedrooms={property.L_Keyword2}
              bathrooms={property.LM_Dec_3}
              squareFeet={property.LM_Int2_3}
              isFavorite={isFavorite(property.L_ListingID)}
              onFavoriteToggle={() => toggleFavorite(property)}
            />
          ))}
        </div>
      )}
    </section>
  );
}

FavoritesPage.propTypes = {
  favorites: PropTypes.arrayOf(
    PropTypes.shape({
      L_ListingID: PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.number,
      ]).isRequired,
    })
  ).isRequired,
  isFavorite: PropTypes.func.isRequired,
  toggleFavorite: PropTypes.func.isRequired,
};