import { fireEvent, render, screen } from '@testing-library/react';
import Pagination from './Pagination';

test('is hidden when there is only one page', () => {
  render(
    <Pagination
      currentPage={1}
      totalPages={1}
      onPageChange={jest.fn()}
    />
  );

  expect(
    screen.queryByRole('navigation', { name: /property results pages/i })
  ).not.toBeInTheDocument();
});

test('disables Previous on the first page', () => {
  render(
    <Pagination
      currentPage={1}
      totalPages={3}
      onPageChange={jest.fn()}
    />
  );

  expect(screen.getByRole('button', { name: /previous/i })).toBeDisabled();
  expect(screen.getByRole('button', { name: /next/i })).toBeEnabled();
});

test('disables Next on the last page', () => {
  render(
    <Pagination
      currentPage={3}
      totalPages={3}
      onPageChange={jest.fn()}
    />
  );

  expect(screen.getByRole('button', { name: /previous/i })).toBeEnabled();
  expect(screen.getByRole('button', { name: /next/i })).toBeDisabled();
});

test('reports page-number, Previous, and Next clicks', () => {
  const onPageChange = jest.fn();

  render(
    <Pagination
      currentPage={3}
      totalPages={5}
      onPageChange={onPageChange}
    />
  );

  fireEvent.click(screen.getByRole('button', { name: '4' }));
  fireEvent.click(screen.getByRole('button', { name: /previous/i }));
  fireEvent.click(screen.getByRole('button', { name: /next/i }));

  expect(onPageChange).toHaveBeenNthCalledWith(1, 4);
  expect(onPageChange).toHaveBeenNthCalledWith(2, 2);
  expect(onPageChange).toHaveBeenNthCalledWith(3, 4);
});

test('uses ellipses for distant page ranges', () => {
  render(
    <Pagination
      currentPage={5}
      totalPages={24}
      onPageChange={jest.fn()}
    />
  );

  expect(screen.getByRole('button', { name: '1' })).toBeInTheDocument();
  expect(screen.getByRole('button', { name: '4' })).toBeInTheDocument();
  expect(screen.getByRole('button', { name: '5' })).toHaveAttribute(
    'aria-current',
    'page'
  );
  expect(screen.getByRole('button', { name: '6' })).toBeInTheDocument();
  expect(screen.getByRole('button', { name: '24' })).toBeInTheDocument();
  expect(screen.getAllByText('...')).toHaveLength(2);
});
