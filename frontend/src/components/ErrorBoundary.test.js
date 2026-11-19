import { render, screen } from '@testing-library/react';
import ErrorBoundary from './ErrorBoundary';

function BrokenComponent() {
  throw new Error('Intentional render error');
}

test('shows recovery UI when a child fails during rendering', () => {
  const consoleError = jest
    .spyOn(console, 'error')
    .mockImplementation(() => {});

  render(
    <ErrorBoundary>
      <BrokenComponent />
    </ErrorBoundary>
  );

  expect(screen.getByRole('alert')).toBeInTheDocument();

  expect(
    screen.getByRole('heading', { name: /something went wrong/i })
  ).toBeInTheDocument();

  expect(
    screen.getByRole('button', { name: /reload page/i })
  ).toBeInTheDocument();

  expect(
    screen.getByRole('link', { name: /return to listings/i })
  ).toHaveAttribute('href', '/');

  consoleError.mockRestore();
});