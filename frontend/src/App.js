import './App.css';
import ListingsPage from './pages/ListingsPage';
import PropertyDetailPage from './pages/PropertyDetailPage';
import { Routes, Route, Link } from 'react-router-dom';
import useFavorites from './hooks/useFavorites';
import FavoritesPage from './pages/FavoritesPage';

function App() {
  const { favorites, favoriteCount, isFavorite, toggleFavorite } = useFavorites();

  return (
    <div className="App">
      <header className="site-header">
        <Link className="site-brand" to="/">IDX Exchange</Link>
        <p>Find your next home</p>
        <Link className="favorites-link" to="/favorites">
          Favorites ({favoriteCount})
        </Link>
      </header>

      <main>
        <Routes>
          <Route path="/" element={<ListingsPage isFavorite={isFavorite} toggleFavorite={toggleFavorite} />} />
          <Route path="/favorites" element={<FavoritesPage favorites={favorites} isFavorite={isFavorite} toggleFavorite={toggleFavorite} />} />
          <Route path="/property/:id" element={<PropertyDetailPage />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
