import { fireEvent, render, screen } from '@testing-library/react';
import PropertyCard from './PropertyCard';


jest.mock(
  './PropertyImageCarousel',
  () =>
    function MockPropertyImageCarousel() {
      return <div>Property image</div>;
    }
);

const propertyProps = {
  image: '[]',
  price: 450000,
  address: '1 Test Street',
  city: 'Denver',
  state: 'CO',
  bedrooms: 3,
  bathrooms: 2.5,
  squareFeet: 1800,
};

test('renders property information', () => {
  render(<PropertyCard {...propertyProps} />);

  expect(screen.getByText('$450,000')).toBeInTheDocument();
  expect(screen.getByText('1 Test Street')).toBeInTheDocument();
  expect(screen.getByText('Denver, CO')).toBeInTheDocument();
  expect(
    screen.getByText('3 beds | 2.5 baths | 1800 sqft')
  ).toBeInTheDocument();
});

test('clicking the card calls its navigation handler', () => {
  const onClick = jest.fn();

  render(
    <PropertyCard
      {...propertyProps}
      onClick={onClick}
    />
  );

  fireEvent.click(
    screen.getByRole('link', {
      name: /view property at 1 test street/i,
    })
  );

  expect(onClick).toHaveBeenCalledTimes(1);
});

test('heart click does not trigger card navigation', () => {
  const onClick = jest.fn();
  const onFavoriteToggle = jest.fn();

  render(
    <PropertyCard
      {...propertyProps}
      onClick={onClick}
      onFavoriteToggle={onFavoriteToggle}
    />
  );

  fireEvent.click(
    screen.getByRole('button', {
      name: /add 1 test street to favorites/i,
    })
  );

  expect(onFavoriteToggle).toHaveBeenCalledTimes(1);
  expect(onClick).not.toHaveBeenCalled();
});

test('shows the filled favorite state', () => {
  render(
    <PropertyCard
      {...propertyProps}
      isFavorite
    />
  );

  expect(
    screen.getByRole('button', {
      name: /remove 1 test street from favorites/i,
    })
  ).toHaveAttribute('aria-pressed', 'true');
});