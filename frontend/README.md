# IDX Exchange

A full-stack property search application inspired by Zillow and Redfin. It uses real MLS property data and allows users to search, filter, sort, and explore detailed property listings.

## Features

- Search properties by city and ZIP code
- Filter by price, bedrooms, and bathrooms
- Sort by price, listing date, and square footage
- Paginated property results
- Responsive property cards with image carousels
- Property detail pages
- Image gallery with thumbnails and a lightbox
- Google Maps property locations and directions
- Open-house dates, times, and remarks
- Loading, empty, API error, and render error states

## Technology

### Frontend

- React
- Create React App
- React Router
- PropTypes
- Jest
- React Testing Library
- CSS

### Backend

- Node.js
- Express
- MySQL
- Docker

## Project Structure

```text
frontend/src/
|-- api/          API request functions
|-- components/   Reusable interface components
|-- hooks/        Reusable React hooks
|-- pages/        Route-level page components
|-- utils/        Shared helper functions
|-- App.js        Application routes and layout
`-- index.js      React application entry point
```

Important frontend files include:

- `api/client.js`: Sends property requests to the Express API
- `components/PropertyCard.jsx`: Displays property summary information
- `components/PropertyImageCarousel.jsx`: Displays listing-card photos
- `components/PropertyImageGallery.jsx`: Displays detail-page photos and the lightbox
- `components/PropertyMap.jsx`: Embeds the property location with Google Maps
- `components/ErrorBoundary.jsx`: Displays recovery UI for React render failures
- `pages/ListingsPage.jsx`: Displays filters, sorting, listings, and pagination
- `pages/PropertyDetailPage.jsx`: Displays complete property information

## Requirements

Before starting the application, install:

- Node.js
- npm
- Docker
- MySQL 8, running locally or inside Docker

The Express API expects the MySQL database to be available before it starts.

## Installation

Install backend dependencies from the repository root:

```bash
npm install
```

Install frontend dependencies:

```bash
cd frontend
npm install
```

## Environment Variables

Create a `.env` file in the repository root:

```env
PORT=5000
MYSQL_HOST=127.0.0.1
MYSQL_PORT=3306
MYSQL_USER=your_mysql_user
MYSQL_PASSWORD=your_mysql_password
MYSQL_DATABASE=rets
```

Create `frontend/.env.local` to enable Google Maps:

```env
REACT_APP_GOOGLE_MAPS_API_KEY=your_google_maps_api_key
```

Do not commit either environment file or expose real credentials. Restart the React development server after changing frontend environment variables.

## Running the Application

The backend and frontend run in separate terminals.

### Start the backend

From the repository root:

```bash
npm run dev
```

The Express API runs at `http://localhost:5000`.

### Start the frontend

From the `frontend` directory:

```bash
npm start
```

The React application runs at `http://localhost:3000`.

The frontend proxy forwards requests beginning with `/api` to the Express server on port 5000.

## Frontend Scripts

Run these commands from the `frontend` directory.

### Start the development server

```bash
npm start
```

### Run tests once

```bash
npm test -- --watchAll=false
```

### Run the linter

```bash
npm run lint
```

### Create a production build

```bash
npm run build
```

The optimized application is created in `frontend/build`.

## Backend Tests

Run backend tests from the repository root:

```bash
npm test
```

## Routes

| Route | Description |
| --- | --- |
| `/` | Property listings, filters, sorting, and pagination |
| `/property/:id` | Property details, photos, map, and open houses |

## API Endpoints

| Method | Endpoint | Description |
| --- | --- | --- |
| `GET` | `/api/health` | Checks API and database availability |
| `GET` | `/api/properties` | Returns filtered, sorted, and paginated properties |
| `GET` | `/api/properties/:id` | Returns one property's details |
| `GET` | `/api/properties/:id/openhouses` | Returns open houses for a property |

## Quality Checks

Before committing frontend changes, run:

```bash
npm run lint
npm test -- --watchAll=false
npm run build
```

Also run the backend tests from the repository root:

```bash
npm test
```

## Git Workflow

Development uses the following branch structure:

```text
main
`-- develop
    |-- feature/frontend-organization
    |-- feature/lint-cleanup
    `-- feature/project-documentation
```

Commit messages follow Conventional Commit format:

```text
type(scope): short description
```

Example:

```text
fix(pagination): reset to first page when filters change
```
