export async function fetchProperties({
    city = '',
    zipcode = '',
    minPrice = '',
    maxPrice = '',
    beds = '',
    baths = '',
    limit = 20,
    offset = 0 } = {}) {
    const queryParams = new URLSearchParams({
        limit,
        offset,
    });
    const optionalFilters = { city, zipcode, minPrice, maxPrice, beds, baths };
    for (const [key, value] of Object.entries(optionalFilters)) {
        if (value !== '') {
            queryParams.append(key, value);
        }
    }
    const response = await fetch(`/api/properties?${queryParams.toString()}`);
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