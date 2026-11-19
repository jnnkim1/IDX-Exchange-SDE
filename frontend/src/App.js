import './App.css';
import ListingsPage from './pages/ListingsPage';
import PropertyDetailPage from './pages/PropertyDetailPage';
import { Routes, Route, Link } from 'react-router-dom';

function App() {
  return (
    <div className="App">
      <header className="site-header">
        <Link className="site-brand" to="/">IDX Exchange</Link>
        <p>Find your next home</p>
      </header>

      <main>
        <Routes>
          <Route path="/" element={<ListingsPage />} />
          <Route path="/property/:id" element={<PropertyDetailPage />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
