const test = require('node:test');
const assert = require('node:assert/strict');
const express = require('express');

async function startPropertiesApp(t, query) {
    const dbPath = require.resolve('../db');
    const routerPath = require.resolve('../api/properties');
    const originalDbModule = require.cache[dbPath];

    require.cache[dbPath] = {
        id: dbPath,
        filename: dbPath,
        loaded: true,
        exports: { query }
    };

    delete require.cache[routerPath];

    const app = express();
    app.use('/api/properties', require('../api/properties'));
    const server = app.listen(0);

    await new Promise((resolve) => server.once('listening', resolve));

    t.after(async () => {
        await new Promise((resolve) => server.close(resolve));
        delete require.cache[routerPath];

        if (originalDbModule) {
            require.cache[dbPath] = originalDbModule;
        } else {
            delete require.cache[dbPath];
        }
    });

    return `http://127.0.0.1:${server.address().port}`;
}

test('GET /api/properties keeps minPrice and beds aligned in the count query', async (t) => {
    const calls = [];
    const baseUrl = await startPropertiesApp(t, async (sql, values) => {
        calls.push({ sql, values: [...values] });

        if (sql.startsWith('SELECT COUNT(*)')) {
            return [[{ total: 1 }]];
        }

        return [[{ L_ListingID: 'TEST123' }]];
    });

    const response = await fetch(
        `${baseUrl}/api/properties?minPrice=500000&beds=3`
    );
    const body = await response.json();

    assert.equal(response.status, 200);
    assert.equal(body.total, 1);
    assert.match(calls[0].sql, /L_SystemPrice >= \?.*L_Keyword2 = \?/s);
    assert.deepEqual(calls[0].values, ['500000', '3']);
    assert.deepEqual(calls[1].values, ['500000', '3', 20, 0]);
});

test('GET /api/properties/:id returns the full property or 404', async (t) => {
    const property = {
        L_ListingID: '1234567890',
        L_Address: '1 Test Street',
        L_City: 'Irvine',
        L_SystemPrice: 500000
    };
    const baseUrl = await startPropertiesApp(t, async (sql, values) => {
        assert.match(sql, /SELECT \* FROM rets_property/);
        return values[0] === property.L_ListingID ? [[property]] : [[]];
    });

    const foundResponse = await fetch(`${baseUrl}/api/properties/${property.L_ListingID}`);
    assert.equal(foundResponse.status, 200);
    assert.deepEqual(await foundResponse.json(), property);

    const missingResponse = await fetch(`${baseUrl}/api/properties/9999999999`);
    assert.equal(missingResponse.status, 404);
    assert.match((await missingResponse.json()).message, /not found/i);
});

test('property ID validation returns 400 on both endpoints', async (t) => {
    const baseUrl = await startPropertiesApp(t, async () => {
        throw new Error('The database should not be queried for an invalid ID');
    });
    const oversizedId = '1'.repeat(51);

    for (const path of [
        '/api/properties/notanid',
        '/api/properties/notanid/openhouses',
        '/api/properties/bad$id',
        '/api/properties/bad$id/openhouses',
        `/api/properties/${oversizedId}`,
        `/api/properties/${oversizedId}/openhouses`
    ]) {
        const response = await fetch(`${baseUrl}${path}`);
        assert.equal(response.status, 400);
    }
});

test('GET /api/properties/:id/openhouses returns an ordered array', async (t) => {
    const calls = [];
    const baseUrl = await startPropertiesApp(t, async (sql, values) => {
        calls.push({ sql, values: [...values] });

        if (sql.includes('FROM rets_property')) {
            return [[{ L_ListingID: values[0] }]];
        }

        return [[]];
    });

    const response = await fetch(`${baseUrl}/api/properties/1234567890/openhouses`);

    assert.equal(response.status, 200);
    assert.deepEqual(await response.json(), []);
    assert.equal(calls.length, 2);
    assert.match(calls[1].sql, /WHERE L_ListingID = \?/);
    assert.match(calls[1].sql, /ORDER BY OpenHouseDate ASC, OH_StartTime ASC/);
});

test('openhouses returns 404 for an unknown property', async (t) => {
    let queryCount = 0;
    const baseUrl = await startPropertiesApp(t, async () => {
        queryCount += 1;
        return [[]];
    });

    const response = await fetch(`${baseUrl}/api/properties/9999999999/openhouses`);

    assert.equal(response.status, 404);
    assert.match((await response.json()).message, /not found/i);
    assert.equal(queryCount, 1);
});

test('openhouses handles a rejected database query', async (t) => {
    t.mock.method(console, 'error', () => {});
    const baseUrl = await startPropertiesApp(t, async () => {
        throw new Error('Database failure');
    });

    const response = await fetch(`${baseUrl}/api/properties/1234567890/openhouses`);

    assert.equal(response.status, 500);
    assert.deepEqual(await response.json(), {
        status: 'error',
        message: 'Could not retrieve open houses'
    });
});
