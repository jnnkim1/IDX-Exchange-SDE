import PropertyCard from './PropertyCard';
import { useState, useEffect } from 'react';
import { fetchProperties } from '../api/client';

export default function ListingsPage() {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    const loadProperties = async () => {
      setLoading(true);
      setError(null);

      try {
        const data = await fetchProperties({ limit: 10, offset: 0 });
        setProperties(data.results);
        setTotal(data.total);
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    loadProperties();
  }, []);
  if (loading) {
    return <p>Loading properties...</p>;
  }
  if (error) {
    return <p>Error: {error}</p>;
  }

  return (
    <>
      <p>Showing {properties.length} of {total} properties</p>
      <div className="property-grid">
        {properties.map((property) => (
          <PropertyCard
            key={property.L_ListingID}
            image={property.L_Photos}
            price={property.L_SystemPrice}
            address={property.L_Address}
            city={property.L_City}
            state={property.L_State}
            bedrooms={property.L_Keyword2}
            bathrooms={property.LM_Dec_3}
            squareFeet={property.LM_Int2_3}
          />
        ))}
      </div>
    </>
  );
}
