import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import ListingsPage from './ListingsPage';
import { fetchProperties } from '../api/client';

jest.mock('../api/client', () => ({
    fetchProperties: jest.fn()
}));

beforeEach(() => {
    fetchProperties.mockReset();
});

function renderListingsPage() {
    return render(
        <MemoryRouter
            future={{
                v7_startTransition: true,
                v7_relativeSplatPath: true,
            }}
        >
            <ListingsPage />
        </MemoryRouter>
    );
}

test('pagination is hidden when there is only one page', async () => {
    const mockFetchProperties = require('../api/client').fetchProperties;
    mockFetchProperties.mockResolvedValue({
        total: 1,
        results: [{
            L_ListingID: 1,
            L_Photos: '[]'
        }]
    });

    renderListingsPage();
    await screen.findByText(/showing 1-1 of 1 properties/i);

    expect(screen.queryByRole('button', { name: /previous/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /next/i })).not.toBeInTheDocument();
});

test('previous button is disabled on the first page', async () => {
    const mockFetchProperties = require('../api/client').fetchProperties;
    mockFetchProperties.mockResolvedValue({
        total: 44,
        results: Array.from({ length: 20 }, (_, index) => ({
            L_ListingID: index + 1,
            L_Photos: '[]'
        }))
    });

    renderListingsPage();
    await screen.findByText(/showing 1-20 of 44 properties/i);

    expect(screen.queryByRole('button', { name: /previous/i })).toBeDisabled();
    expect(screen.queryByRole('button', { name: /next/i })).not.toBeDisabled();
});

test('clicking page 2 fetches correct offset', async () => {
    const mockFetchProperties = require('../api/client').fetchProperties;
    mockFetchProperties.mockResolvedValue({
        total: 44,
        results: Array.from({ length: 20 }, (_, index) => ({
            L_ListingID: index + 21,
            L_Photos: '[]'
        })),
        limit: 20,
        offset: 20
    });

    renderListingsPage();
    fireEvent.click(await screen.findByRole('button', { name: /2/i }));
    await waitFor(() => expect(mockFetchProperties).toHaveBeenCalledWith(expect.objectContaining({
        limit: 20,
        offset: 20
    })));

    expect(
        await screen.findByText(/showing 21-40 of 44 properties/i)
    ).toBeInTheDocument();
})


test('next button is disabled on the last page', async () => {
    const mockFetchProperties = require('../api/client').fetchProperties;
    mockFetchProperties.mockResolvedValue({
        total: 44,
        results: Array.from({ length: 4 }, (_, index) => ({
            L_ListingID: index + 41,
            L_Photos: '[]'
        }))
    });

    renderListingsPage();
    fireEvent.click(await screen.findByRole('button', { name: /3/i }));

    await screen.findByText(/showing 41-44 of 44 properties/i);

    expect(screen.queryByRole('button', { name: /previous/i })).not.toBeDisabled();
    expect(screen.queryByRole('button', { name: /next/i })).toBeDisabled();
});

test('ellipses appear correctly when there are many pages', async () => {
    const mockFetchProperties = require('../api/client').fetchProperties;
    mockFetchProperties.mockResolvedValue({
        total: 480,
        results: Array.from({ length: 20 }, (_, index) => ({
            L_ListingID: index + 1,
            L_Photos: '[]'
        }))
    });

    renderListingsPage();

    fireEvent.click(await screen.findByRole('button', { name: '2' }));
    fireEvent.click(await screen.findByRole('button', { name: '3' }));
    fireEvent.click(await screen.findByRole('button', { name: '4' }));
    fireEvent.click(await screen.findByRole('button', { name: '5' }));

    expect(
        await screen.findByText(/showing 81-100 of 480 properties/i)
    ).toBeInTheDocument();

    expect(screen.getByRole('button', { name: '1' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '4' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '5' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '6' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '24' })).toBeInTheDocument();

    expect(screen.getAllByText('...')).toHaveLength(2);
})

test('apply filters resets to page 1', async () => {
    const mockFetchProperties = require('../api/client').fetchProperties;
    mockFetchProperties.mockResolvedValue({
        total: 44,
        results: Array.from({ length: 20 }, (_, index) => ({
            L_ListingID: index + 1,
            L_Photos: '[]'
        }))
    });
    renderListingsPage();

    fireEvent.click(await screen.findByRole('button', { name: /2/i }));
    const cityInput = screen.getByLabelText(/city/i);
    fireEvent.change(cityInput, { target: { value: 'Irvine' } });
    fireEvent.click(screen.getByRole('button', { name: /^apply$/i }));

    await waitFor(() => expect(mockFetchProperties).toHaveBeenCalledWith(expect.objectContaining({
        city: 'Irvine',
        limit: 20,
        offset: 0
    })));
})

test('sort persists when navigating to another page', async () => {
    fetchProperties.mockResolvedValue({
        total: 44,
        results: Array.from({ length: 20 }, (_, index) => ({
            L_ListingID: index + 1,
            L_Photos: '[]'
        }))
    });

    renderListingsPage();

    fireEvent.change(await screen.findByLabelText(/sort by/i), {
        target: { value: 'L_SystemPrice:DESC' }
    });

    await waitFor(() => expect(fetchProperties).toHaveBeenCalledWith(
        expect.objectContaining({
            sortBy: 'L_SystemPrice',
            sortOrder: 'DESC',
            offset: 0
        })
    ));

    fireEvent.click(await screen.findByRole('button', { name: '2' }));

    await waitFor(() => expect(fetchProperties).toHaveBeenCalledWith(
        expect.objectContaining({
            sortBy: 'L_SystemPrice',
            sortOrder: 'DESC',
            offset: 20
        })
    ));
});

test('applying filters resets sorting and pagination', async () => {
    fetchProperties.mockResolvedValue({
        total: 44,
        results: Array.from({ length: 20 }, (_, index) => ({
            L_ListingID: index + 1,
            L_Photos: '[]'
        }))
    });

    renderListingsPage();

    fireEvent.change(await screen.findByLabelText(/sort by/i), {
        target: { value: 'L_SystemPrice:DESC' }
    });

    await waitFor(() => expect(fetchProperties).toHaveBeenCalledWith(
        expect.objectContaining({
            sortBy: 'L_SystemPrice',
            sortOrder: 'DESC'
        })
    ));

    fireEvent.change(screen.getByLabelText(/city/i), {
        target: { value: 'Irvine' }
    });
    fireEvent.click(screen.getByRole('button', { name: /^apply$/i }));

    await waitFor(() => expect(fetchProperties).toHaveBeenCalledWith(
        expect.objectContaining({
            city: 'Irvine',
            sortBy: 'id',
            sortOrder: 'ASC',
            offset: 0
        })
    ));

    expect(await screen.findByLabelText(/sort by/i)).toHaveValue('id:ASC');
});

test('clicking a property card navigates to its detail page', async () => {
    fetchProperties.mockResolvedValue({
        total: 1,
        results: [{
            L_ListingID: '123',
            L_Photos: '[]',
            L_SystemPrice: 450000,
            L_Address: '1 Test Street',
            L_City: 'Denver',
            L_State: 'CO',
            L_Keyword2: 3,
            LM_Dec_3: 2,
            LM_Int2_3: 1800,
        }],
    });

    render(
        <MemoryRouter
            initialEntries={['/']}
            future={{
                v7_startTransition: true,
                v7_relativeSplatPath: true,
            }}
        >
            <Routes>
                <Route path="/" element={<ListingsPage />} />
                <Route
                    path="/property/:id"
                    element={<p>Property detail route</p>}
                />
            </Routes>
        </MemoryRouter>
    );

    fireEvent.click(
        await screen.findByRole('link', {
            name: /view property at 1 test street/i,
        })
    );

    expect(
        await screen.findByText('Property detail route')
    ).toBeInTheDocument();
});

