import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import App from './App';
import { fetchProperties } from './api/client';

jest.mock('./api/client', () => ({
  fetchProperties: jest.fn(),
  fetchPropertyDetails: jest.fn(),
  fetchOpenHouses: jest.fn(),
}));

test('renders the listings route', async () => {
  fetchProperties.mockResolvedValue({ total: 0, results: [] });

  render(
    <MemoryRouter initialEntries={['/']}>
      <App />
    </MemoryRouter>
  );

  expect(
    await screen.findByText(/showing 0-0 of 0 properties/i)
  ).toBeInTheDocument();
});
