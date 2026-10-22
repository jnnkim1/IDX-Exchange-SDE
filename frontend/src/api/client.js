export async function fetchProperties({ limit = 20, offset = 0 } = {}) {
    const response = await fetch(`/api/properties?limit=${limit}&offset=${offset}`);
    if (!response.ok) {
        throw new Error(`Request failed: ${response.status}`);
    }
    return response.json();
}

export async function fetchPropertyDetails(listingId) {
    const response = await fetch(`/api/properties/${listingId}`);
    if (!response.ok) {
        throw new Error(`Request failed: ${response.status}`);
    }
    return response.json();
}