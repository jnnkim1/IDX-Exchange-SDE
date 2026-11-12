import { render, screen, fireEvent } from '@testing-library/react';
import PropertyFilters from './PropertyFilters';

test('displays all six filter inputs with empty initial values', async () => {
    const mockOnSubmit = jest.fn();

    render(<PropertyFilters onSubmit={mockOnSubmit} />);
    fireEvent.click(screen.getByRole('button', { name: /show filters/i }));

    const cityInput = screen.getByLabelText(/city/i);
    const zipcodeInput = screen.getByLabelText(/zipcode/i);
    const minPriceInput = screen.getByLabelText(/min price/i);
    const maxPriceInput = screen.getByLabelText(/max price/i);
    const bedsInput = screen.getByLabelText(/beds/i);
    const bathsInput = screen.getByLabelText(/baths/i);

    expect(cityInput.value).toBe('');
    expect(zipcodeInput.value).toBe('');
    expect(minPriceInput.value).toBe('');
    expect(maxPriceInput.value).toBe('');
    expect(bedsInput.value).toBe('');
    expect(bathsInput.value).toBe('');
});


test('submits selected filter criteria', () => {
    const mockOnSubmit = jest.fn();

    render(<PropertyFilters onSubmit={mockOnSubmit} />);

    fireEvent.click(
        screen.getByRole('button', { name: /show filters/i })
    );

    const cityInput = screen.getByLabelText(/city/i);
    const bedsInput = screen.getByLabelText(/beds/i);

    fireEvent.change(cityInput, {
        target: { value: 'Mountain House' },
    });

    fireEvent.change(bedsInput, {
        target: { value: '3' },
    });

    fireEvent.click(
        screen.getByRole('button', { name: /apply filters/i })
    );

    expect(mockOnSubmit).toHaveBeenCalledWith(
        expect.objectContaining({
            city: 'Mountain House',
            beds: '3',
        })
    );
});

test('clears entered filter values', () => {
  const mockOnSubmit = jest.fn();

  render(<PropertyFilters onSubmit={mockOnSubmit} />);

  fireEvent.click(
    screen.getByRole('button', { name: /show filters/i })
  );

  const cityInput = screen.getByLabelText(/city/i);
  const bedsInput = screen.getByLabelText(/beds/i);

  fireEvent.change(cityInput, {
    target: { value: 'Denver' },
  });

  fireEvent.change(bedsInput, {
    target: { value: '3' },
  });

  // Confirm values changed before clearing
  expect(cityInput.value).toBe('Denver');
  expect(bedsInput.value).toBe('3');

  fireEvent.click(
    screen.getByRole('button', { name: /^clear$/i })
  );

  expect(cityInput.value).toBe('');
  expect(bedsInput.value).toBe('');
});