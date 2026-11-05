import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import ListingsPage from './ListingsPage';
import { fetchProperties } from '../api/client';

jest.mock('../api/client', () => ({
    fetchProperties: jest.fn()
}));

beforeEach(() => {
    fetchProperties.mockReset();
});

test('pagination is hidden when there is only one page', async () => {
    const mockFetchProperties = require('../api/client').fetchProperties;
    mockFetchProperties.mockResolvedValue({
        total: 1,
        results: [{
            L_ListingID: 1,
            L_Photos: '[]'
        }]
    });

    render(<ListingsPage />);
    await screen.findByText(/showing 1-1 of 1 properties/i);

    expect(screen.queryByRole('button', { name: /previous/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /next/i })).not.toBeInTheDocument();
});

test('previous button is disabled on the first page', async () => {
    const mockFetchProperties = require('../api/client').fetchProperties;
    mockFetchProperties.mockResolvedValue({
        total: 24,
        results: Array.from({ length: 10 }, (_, index) => ({
            L_ListingID: index + 1,
            L_Photos: '[]'
        }))
    });

    render(<ListingsPage />);
    await screen.findByText(/showing 1-10 of 24 properties/i);

    expect(screen.queryByRole('button', { name: /previous/i })).toBeDisabled();
    expect(screen.queryByRole('button', { name: /next/i })).not.toBeDisabled();
});

test('clicking page 2 fetches correct offset', async () => {
    const mockFetchProperties = require('../api/client').fetchProperties;
    mockFetchProperties.mockResolvedValue({
        total: 24,
        results: Array.from({ length: 10 }, (_, index) => ({
            L_ListingID: index + 11,
            L_Photos: '[]'
        })),
        limit: 10,
        offset: 10
    });

    render(<ListingsPage />);
    fireEvent.click(await screen.findByRole('button', { name: /2/i }));
    await waitFor(() => expect(mockFetchProperties).toHaveBeenCalledWith(expect.objectContaining({
        limit: 10,
        offset: 10
    })));

    expect(
        await screen.findByText(/showing 11-20 of 24 properties/i)
    ).toBeInTheDocument();
})


test('next button is disabled on the last page', async () => {
    const mockFetchProperties = require('../api/client').fetchProperties;
    mockFetchProperties.mockResolvedValue({
        total: 24,
        results: Array.from({ length: 4 }, (_, index) => ({
            L_ListingID: index + 21,
            L_Photos: '[]'
        }))
    });

    render(<ListingsPage />);
    fireEvent.click(await screen.findByRole('button', { name: /3/i }));

    await screen.findByText(/showing 21-24 of 24 properties/i);

    expect(screen.queryByRole('button', { name: /previous/i })).not.toBeDisabled();
    expect(screen.queryByRole('button', { name: /next/i })).toBeDisabled();
});

test('ellipses appear correctly when there are many pages', async () => {
    const mockFetchProperties = require('../api/client').fetchProperties;
    mockFetchProperties.mockResolvedValue({
        total: 240,
        results: Array.from({ length: 10 }, (_, index) => ({
            L_ListingID: index + 1,
            L_Photos: '[]'
        }))
    });

    render(<ListingsPage />);

    fireEvent.click(await screen.findByRole('button', { name: '2' }));
    fireEvent.click(await screen.findByRole('button', { name: '3' }));
    fireEvent.click(await screen.findByRole('button', { name: '4' }));
    fireEvent.click(await screen.findByRole('button', { name: '5' }));

    expect(
        await screen.findByText(/showing 41-50 of 240 properties/i)
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
        total: 24,
        results: Array.from({ length: 10 }, (_, index) => ({
            L_ListingID: index + 1,
            L_Photos: '[]'
        }))
    });
    render(<ListingsPage />);

    fireEvent.click(await screen.findByRole('button', { name: /2/i }));
    fireEvent.click(await screen.findByRole('button', { name: /show filters/i }));
    const cityInput = screen.getByLabelText(/city/i);
    fireEvent.change(cityInput, { target: { value: 'Irvine' } });
    fireEvent.click(screen.getByRole('button', { name: /apply filters/i }));

    await waitFor(() => expect(mockFetchProperties).toHaveBeenCalledWith(expect.objectContaining({
        city: 'Irvine',
        limit: 10,
        offset: 0
    })));
})

