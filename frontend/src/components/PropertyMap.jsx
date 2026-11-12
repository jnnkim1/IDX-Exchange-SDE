export default function PropertyMap({ latitude, longitude }) {
  const apiKey = process.env.REACT_APP_GOOGLE_MAPS_API_KEY;
  const hasCoordinates =
    latitude !== null &&
    latitude !== undefined &&
    latitude !== '' &&
    longitude !== null &&
    longitude !== undefined &&
    longitude !== '' &&
    Number.isFinite(Number(latitude)) &&
    Number.isFinite(Number(longitude));

  if (!hasCoordinates) {
    return (
      <section className="property-map-panel">
        <h2>Location</h2>
        <p className="property-map-message">Map coordinates are unavailable.</p>
      </section>
    );
  }

  const location = `${Number(latitude)},${Number(longitude)}`;
  const directionsUrl =
    `https://www.google.com/maps/dir/?api=1` +
    `&destination=${encodeURIComponent(location)}`;

  if (!apiKey) {
    return (
      <section className="property-map-panel">
        <div className="property-map-heading">
          <h2>Location</h2>
          <a href={directionsUrl} target="_blank" rel="noreferrer">
            Get directions
          </a>
        </div>
        <p className="property-map-message">Google Maps is not configured.</p>
      </section>
    );
  }

  const mapUrl =
    `https://www.google.com/maps/embed/v1/place` +
    `?key=${encodeURIComponent(apiKey)}` +
    `&q=${encodeURIComponent(location)}` +
    `&zoom=15`;

  return (
    <section className="property-map-panel">
      <div className="property-map-heading">
        <h2>Location</h2>
        <a href={directionsUrl} target="_blank" rel="noreferrer">
          Get directions
        </a>
      </div>
      <iframe
        className="property-map"
        title="Property location"
        src={mapUrl}
        loading="lazy"
        allowFullScreen
        referrerPolicy="no-referrer-when-downgrade"
      />
    </section>
  );
}
