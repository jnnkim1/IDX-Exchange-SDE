const request = require('supertest');

jest.mock('../db', () => ({
    query: jest.fn(),
}));

const pool = require('../db');
const app = require('../index');

const sampleProperty = {
    L_ListingID: '1234567890',
    L_Address: '1 Test Street',
    L_City: 'Denver',
    L_State: 'CO',
    L_SystemPrice: 500000,
};

let infoSpy;
let errorSpy;

beforeAll(() => {
    infoSpy = jest.spyOn(console, 'info').mockImplementation(() => {});
    errorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
});

afterAll(() => {
    infoSpy.mockRestore();
    errorSpy.mockRestore();
});

beforeEach(() => {
    pool.query.mockReset();
});

function mockPropertyList({ total = 1, rows = [sampleProperty] } = {}) {
    pool.query
        .mockResolvedValueOnce([[{ total }]])
        .mockResolvedValueOnce([rows]);
}

describe('GET /api/properties', () => {
    test('returns the default first page', async () => {
        mockPropertyList();

        const response = await request(app).get('/api/properties');

        expect(response.status).toBe(200);
        expect(response.body).toEqual({
            total: 1,
            limit: 20,
            offset: 0,
            results: [sampleProperty],
        });
        expect(pool.query).toHaveBeenCalledTimes(2);
        expect(pool.query.mock.calls[0][1]).toEqual([]);
        expect(pool.query.mock.calls[1][1]).toEqual([1, 0]);
    });

    test('applies limit and offset pagination', async () => {
        mockPropertyList({ total: 100, rows: [] });

        const response = await request(app)
            .get('/api/properties')
            .query({ limit: 10, offset: 20 });

        expect(response.status).toBe(200);
        expect(response.body.limit).toBe(10);
        expect(response.body.offset).toBe(20);
        expect(pool.query.mock.calls[1][1]).toEqual([10, 20]);
    });

    test.each([
        ['city', 'Denver', 'L_City = ?'],
        ['zipcode', '80202', 'L_Zip = ?'],
        ['minPrice', '200000', 'L_SystemPrice >= ?'],
        ['maxPrice', '900000', 'L_SystemPrice <= ?'],
        ['beds', '3', 'L_Keyword2 = ?'],
        ['baths', '2.5', 'LM_Dec_3 = ?'],
    ])('applies the %s filter', async (name, value, sqlFragment) => {
        mockPropertyList();

        const response = await request(app)
            .get('/api/properties')
            .query({ [name]: value });

        expect(response.status).toBe(200);
        expect(pool.query.mock.calls[0][0]).toContain(sqlFragment);
        expect(pool.query.mock.calls[0][1]).toEqual([value]);
        expect(pool.query.mock.calls[1][1]).toEqual([value, 1, 0]);
    });

    test('combines filters in the count and results queries', async () => {
        mockPropertyList();

        const filters = {
            city: 'Denver',
            zipcode: '80202',
            minPrice: '200000',
            maxPrice: '900000',
            beds: '3',
            baths: '2.5',
        };
        const expectedValues = Object.values(filters);

        const response = await request(app)
            .get('/api/properties')
            .query(filters);

        expect(response.status).toBe(200);
        expect(pool.query.mock.calls[0][1]).toEqual(expectedValues);
        expect(pool.query.mock.calls[1][1]).toEqual([
            ...expectedValues,
            1,
            0,
        ]);
    });

    test.each([
        [{ limit: 0 }, /limit/i],
        [{ limit: 101 }, /limit/i],
        [{ limit: 1.5 }, /limit/i],
        [{ offset: -1 }, /offset/i],
        [{ offset: 1.5 }, /offset/i],
        [{ minPrice: 'invalid' }, /minPrice/i],
        [{ minPrice: -1 }, /minPrice/i],
        [{ maxPrice: 'invalid' }, /maxPrice/i],
        [{ maxPrice: -1 }, /maxPrice/i],
        [{ beds: 'invalid' }, /beds/i],
        [{ beds: 2.5 }, /beds/i],
        [{ baths: 'invalid' }, /baths/i],
        [{ baths: -1 }, /baths/i],
        [{ minPrice: 900000, maxPrice: 200000 }, /minPrice/i],
        [{ sortBy: 'ListPrice' }, /sortBy/i],
        [{ sortOrder: 'SIDEWAYS' }, /sortOrder/i],
    ])('rejects invalid query input %#', async (query, messagePattern) => {
        const response = await request(app)
            .get('/api/properties')
            .query(query);

        expect(response.status).toBe(400);
        expect(response.body.message).toMatch(messagePattern);
        expect(pool.query).not.toHaveBeenCalled();
    });

    test.each([
        ['L_SystemPrice', 'DESC'],
        ['OriginalEntryTimestamp', 'ASC'],
        ['LM_Int2_3', 'DESC'],
    ])('uses validated %s sorting', async (sortBy, sortOrder) => {
        mockPropertyList({ total: 20, rows: [] });

        const response = await request(app)
            .get('/api/properties')
            .query({ sortBy, sortOrder });

        expect(response.status).toBe(200);
        expect(pool.query.mock.calls[1][0]).toContain(
            `ORDER BY ${sortBy} ${sortOrder}, id ${sortOrder}`
        );
    });

    test('loads late pages from the nearest end and restores row order', async () => {
        const descendingRows = [45, 44, 43, 42, 41].map((id) => ({ id }));
        mockPropertyList({ total: 50, rows: descendingRows });

        const response = await request(app)
            .get('/api/properties')
            .query({ limit: 5, offset: 40 });

        expect(response.status).toBe(200);
        expect(pool.query.mock.calls[1][0]).toContain('ORDER BY id DESC');
        expect(pool.query.mock.calls[1][1]).toEqual([5, 5]);
        expect(response.body.results.map((row) => row.id)).toEqual([
            41, 42, 43, 44, 45,
        ]);
    });

    test('returns 500 when the database rejects the query', async () => {
        pool.query.mockRejectedValueOnce(new Error('Database failure'));

        const response = await request(app).get('/api/properties');

        expect(response.status).toBe(500);
        expect(response.body.message).toBe('Could not retrieve properties');
    });
});

describe('GET /api/properties/:id', () => {
    test('returns a property', async () => {
        pool.query.mockResolvedValueOnce([[sampleProperty]]);

        const response = await request(app).get(
            `/api/properties/${sampleProperty.L_ListingID}`
        );

        expect(response.status).toBe(200);
        expect(response.body).toEqual(sampleProperty);
        expect(pool.query).toHaveBeenCalledWith(
            expect.stringContaining('WHERE L_ListingID = ?'),
            [sampleProperty.L_ListingID]
        );
    });

    test('returns 404 when the property does not exist', async () => {
        pool.query.mockResolvedValueOnce([[]]);

        const response = await request(app).get('/api/properties/999');

        expect(response.status).toBe(404);
        expect(response.body.message).toMatch(/not found/i);
    });

    test('rejects an invalid listing ID without querying the database', async () => {
        const response = await request(app).get('/api/properties/not-an-id');

        expect(response.status).toBe(400);
        expect(pool.query).not.toHaveBeenCalled();
    });

    test('returns 500 when the database rejects the query', async () => {
        pool.query.mockRejectedValueOnce(new Error('Database failure'));

        const response = await request(app).get('/api/properties/123');

        expect(response.status).toBe(500);
        expect(response.body.message).toBe('Could not retrieve property');
    });
});

describe('GET /api/properties/:id/openhouses', () => {
    const openHouse = {
        id: 1,
        L_ListingID: '1234567890',
        OpenHouseDate: '2026-11-30',
        OH_StartTime: '10:00:00',
    };

    test('returns the property open houses in API order', async () => {
        pool.query
            .mockResolvedValueOnce([[sampleProperty]])
            .mockResolvedValueOnce([[openHouse]]);

        const response = await request(app).get(
            `/api/properties/${sampleProperty.L_ListingID}/openhouses`
        );

        expect(response.status).toBe(200);
        expect(response.body).toEqual([openHouse]);
        expect(pool.query.mock.calls[1][0]).toContain(
            'ORDER BY OpenHouseDate ASC, OH_StartTime ASC'
        );
    });

    test('returns an empty array when no open houses are scheduled', async () => {
        pool.query
            .mockResolvedValueOnce([[sampleProperty]])
            .mockResolvedValueOnce([[]]);

        const response = await request(app).get(
            `/api/properties/${sampleProperty.L_ListingID}/openhouses`
        );

        expect(response.status).toBe(200);
        expect(response.body).toEqual([]);
    });

    test('returns 404 when the property does not exist', async () => {
        pool.query.mockResolvedValueOnce([[]]);

        const response = await request(app).get(
            '/api/properties/999/openhouses'
        );

        expect(response.status).toBe(404);
        expect(response.body.message).toMatch(/not found/i);
        expect(pool.query).toHaveBeenCalledTimes(1);
    });

    test('rejects an invalid listing ID without querying the database', async () => {
        const response = await request(app).get(
            '/api/properties/not-an-id/openhouses'
        );

        expect(response.status).toBe(400);
        expect(pool.query).not.toHaveBeenCalled();
    });

    test('returns 500 when the database rejects the query', async () => {
        pool.query.mockRejectedValueOnce(new Error('Database failure'));

        const response = await request(app).get(
            '/api/properties/123/openhouses'
        );

        expect(response.status).toBe(500);
        expect(response.body.message).toBe('Could not retrieve open houses');
    });
});
