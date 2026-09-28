import { Routes, Route, Link } from 'react-router-dom';
import Navbar from './components/NavBar';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/login';
import Register from './pages/Register';
import BookList from './pages/BookList';
import MyBooks from './pages/MyBooks';
import { BookOpen } from 'lucide-react';

function App() {
  return (
    <div className="app-layout">
      <Navbar />

      <main style={{ flex: 1 }}>
        <Routes>
          <Route path="/" element={<BookList />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route element={<ProtectedRoute />}>
            <Route path="/my-books" element={<MyBooks />} />
          </Route>
        </Routes>
      </main>

      {/* Modern Footer */}
      <footer
        style={{
          borderTop: '1px solid var(--border-subtle)',
          background: 'var(--bg-surface)',
          padding: '2.5rem 0 2rem',
          marginTop: 'auto',
        }}
      >
        <div className="container">
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '1.5rem',
              paddingBottom: '1.5rem',
              borderBottom: '1px solid var(--border-subtle)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div className="brand-icon-box" style={{ width: '36px', height: '36px' }}>
                <BookOpen size={18} strokeWidth={2.5} />
              </div>
              <div>
                <strong style={{ fontFamily: 'var(--font-display)', fontSize: '1.1rem' }}>
                  Ohara Library
                </strong>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-dim)', margin: 0 }}>
                  Modern Open-Access Digital Library Portal
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '1.5rem', fontSize: '0.9rem' }}>
              <Link to="/" style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>
                Catalog
              </Link>
              <Link to="/my-books" style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>
                My Loans
              </Link>
              <Link to="/login" style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>
                Account
              </Link>
            </div>
          </div>

          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '1rem',
              paddingTop: '1.25rem',
              fontSize: '0.82rem',
              color: 'var(--text-dim)',
            }}
          >
            <div>
              &copy; {new Date().getFullYear()} Ohara Library System. Designed with passion for avid readers.
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span
                style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  background: 'var(--success)',
                  display: 'inline-block',
                }}
              ></span>
              <span>All Systems Operational</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;