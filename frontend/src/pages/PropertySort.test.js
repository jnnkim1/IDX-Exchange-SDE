import { fireEvent, render, screen } from '@testing-library/react';
import PropertySort from './PropertySort';

test('applies a new sort immediately when an option is selected', () => {
  const mockOnSubmit = jest.fn();

  render(<PropertySort onSubmit={mockOnSubmit} />);

  fireEvent.change(screen.getByLabelText(/sort by/i), {
  target: {
    value: 'OriginalEntryTimestamp:DESC',
  },
  });

  expect(mockOnSubmit).toHaveBeenCalledWith({ sortBy: 'OriginalEntryTimestamp', sortOrder: 'DESC' });
});

test('displays the active sort supplied by the listings page', () => {
  render(
    <PropertySort
      onSubmit={jest.fn()}
      value={{ sortBy: 'OriginalEntryTimestamp', sortOrder: 'DESC' }}
    />
  );

  expect(screen.getByLabelText(/sort by/i)).toHaveValue(
    'OriginalEntryTimestamp:DESC'
  );
});
