import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { fetchOpenHouses, fetchPropertyDetails } from '../api/client';
import PropertyImageGallery from '../components/PropertyImageGallery';
import PropertyMap from '../components/PropertyMap';

function formatOpenHouseDate(value) {
  if (!value) return 'Date unavailable';

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return date.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'UTC',
  });
}

function formatOpenHouseTime(value) {
  if (!value) return null;

  const timeMatch = String(value).match(/^(\d{1,2}):(\d{2})/);
  if (!timeMatch) return value;

  const date = new Date(2000, 0, 1, Number(timeMatch[1]), Number(timeMatch[2]));
  return date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
  });
}

function getOpenHouseRemarks(allData) {
  if (!allData) return null;

  try {
    let parsed = allData;

    // Handle a JSON string, an already-parsed object, or a double-encoded string.
    for (let attempt = 0; attempt < 2 && typeof parsed === 'string'; attempt += 1) {
      parsed = JSON.parse(parsed);
    }

    const remarks = parsed?.OpenHouseRemarks;

    if (remarks === null || remarks === undefined) return null;

    const text = String(remarks).trim();
    return text || null;
  } catch (error) {
    return null;
  }
}

function firstAvailable(...values) {
  return values.find(
    (value) => value !== null && value !== undefined && value !== ''
  );
}

function humanizeDetailValue(value) {
  return String(value)
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
    .replace(/_/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function formatDetailValue(value) {
  if (value === true || value === 1 || value === '1') return 'Yes';
  if (value === false || value === 0 || value === '0') return 'No';

  if (Array.isArray(value)) {
    return value.map(humanizeDetailValue).join(', ');
  }

  if (typeof value === 'string') {
    try {
      const parsed = JSON.parse(value);
      if (Array.isArray(parsed)) {
        return parsed.map(humanizeDetailValue).join(', ');
      }
    } catch (error) {
      // The value is a normal string rather than JSON.
    }

    return value
      .split(',')
      .map(humanizeDetailValue)
      .filter(Boolean)
      .join(', ');
  }

  return humanizeDetailValue(value);
}

function cleanDescription(value) {
  if (typeof value !== 'string') return '';

  return value
    .replace(/\?{3,}/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export default function PropertyDetailPage() {
  const { id } = useParams();
  const [property, setProperty] = useState(null);
  const [openHouses, setOpenHouses] = useState([]);
  const [openHouseError, setOpenHouseError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function loadPropertyDetails() {
      setLoading(true);
      setError(null);

      try {

        const data = await fetchPropertyDetails(id);
        setProperty(data);
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    }
    loadPropertyDetails();
  }, [id]);

  useEffect(() => {
    async function loadOpenHouses() {
      setOpenHouseError(null);

      try {
        const data = await fetchOpenHouses(id);
        setOpenHouses(data);
      } catch (error) {
        setOpenHouseError(error.message);
      }
    }

    loadOpenHouses();
  }, [id]);

  if (loading) {
    return <p>Loading property details...</p>;
  }
  if (error) {
    return <p>Error: {error}</p>;
  }

  if (!property) {
    return <p>Property not found</p>;
  }

  const price = Number(property.L_SystemPrice);
  const formattedPrice = Number.isFinite(price)
    ? `$${price.toLocaleString('en-US')}`
    : 'Price unavailable';

  const lotSize = property.LotSizeAcres
    ? `${Number(property.LotSizeAcres).toLocaleString('en-US')} acres`
    : property.LotSizeSquareFeet
      ? `${Number(property.LotSizeSquareFeet).toLocaleString('en-US')} sqft`
      : null;

  const propertyDetails = [
    {
      label: 'Property type',
      value: firstAvailable(property.PropertySubTypeAdditional, property.L_Type_),
    },
    {
      label: 'Status',
      value: firstAvailable(property.StandardStatus, property.L_Status),
    },
    { label: 'Lot size', value: lotSize },
    {
      label: 'Garage',
      value: firstAvailable(property.AttachedGarageYN, property.GarageYN),
    },
    { label: 'Heating', value: firstAvailable(property.Heating, property.HeatingYN) },
    { label: 'Cooling', value: firstAvailable(property.Cooling, property.CoolingYN) },
  ].filter((detail) => detail.value !== null && detail.value !== undefined);

  const description = cleanDescription(property.L_Remarks);

  return (
    <main className="property-detail-page">
      <div className="property-detail-main">
        <PropertyImageGallery images={property.L_Photos} />
        <PropertyMap
          latitude={property.LMD_MP_Latitude}
          longitude={property.LMD_MP_Longitude}
        />
      </div>

      <div className="property-detail-sidebar">
        <section className="property-details-container">
          <div className="property-heading">
            <div>
              <h1>{property.L_Address}</h1>
              <p className="property-location">
                {property.L_City}, {property.L_State}
              </p>
            </div>
            <p className="property-detail-price">{formattedPrice}</p>
          </div>

          <div className="property-facts">
            <span><strong>{property.L_Keyword2}</strong> beds</span>
            <span><strong>{property.LM_Dec_3}</strong> baths</span>
            <span>
              <strong>{Number(property.LM_Int2_3).toLocaleString('en-US')}</strong> sqft
            </span>
            <span><strong>{property.YearBuilt || 'N/A'}</strong> year built</span>
          </div>

          {description && (
            <div className="property-description">
              <h2>About this property</h2>
              <p>{description}</p>
            </div>
          )}

          {propertyDetails.length > 0 && (
            <div className="property-extra-details">
              <h2>Property details</h2>
              <dl>
                {propertyDetails.map((detail) => (
                  <div key={detail.label}>
                    <dt>{detail.label}</dt>
                    <dd>{formatDetailValue(detail.value)}</dd>
                  </div>
                ))}
              </dl>
            </div>
          )}
        </section>

        <section className="open-house-panel">
          <h2>Open houses</h2>

          {openHouseError ? (
            <p className="open-house-message">Open house information is unavailable.</p>
          ) : openHouses.length === 0 ? (
            <p className="open-house-message">No open houses are currently scheduled.</p>
          ) : (
            <div className="open-house-list">
              {openHouses.map((openHouse) => {
                const startTime = formatOpenHouseTime(openHouse.OH_StartTime);
                const endTime = formatOpenHouseTime(openHouse.OH_EndTime);
                const remarks = getOpenHouseRemarks(openHouse.all_data);

                return (
                  <article className="open-house-item" key={openHouse.id}>
                    <p className="open-house-date">
                      {formatOpenHouseDate(openHouse.OpenHouseDate)}
                    </p>
                    {(startTime || endTime) && (
                      <p className="open-house-time">
                        {startTime || 'Time unavailable'}
                        {endTime && ` – ${endTime}`}
                      </p>
                    )}
                    {remarks && (
                      <p className="open-house-remarks">{remarks}</p>
                    )}
                  </article>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
