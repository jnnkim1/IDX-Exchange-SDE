import { fetchProperties } from './client';

beforeEach(() => {
    global.fetch = jest.fn();
});

test('returns property data after a successful request', async () => {
    const apiData = {
        total: 1,
        results: [{ L_ListingID: '123' }],
    };

    global.fetch.mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue(apiData),
    });

    const result = await fetchProperties();

    expect(result).toEqual(apiData);
});


test('error when API request fails', async () => {
    global.fetch.mockResolvedValue({
        ok: false,
        status: 500,
        json: jest.fn().mockResolvedValue({ error: 'Failed to fetch properties' }),
    });

    await expect(fetchProperties()).rejects.toThrow('Request failed: 500');
});

test('filters properties based on criteria', async () => {
    global.fetch.mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue({results: []}),
    });

    await fetchProperties({
        city: 'Mountain House',
        beds: '3',
        zipcode: '',
    });

    const requestedUrl = global.fetch.mock.calls[0][0];
    const queryString = requestedUrl.split('?')[1];
    const queryParams = new URLSearchParams(queryString);

    expect(queryParams.get('city')).toBe('Mountain House');
    expect(queryParams.get('beds')).toBe('3');
    expect(queryParams.has('zipcode')).toBe(false);
});