import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import API from '../api/axiosInstance';
import { useToast } from '../context/ToastContext';
import { DEMO_BORROWED } from '../mocks/mockData';
import { formatDate, getDaysRemainingText } from '../utils/catalogHelpers';
import {
  BookCheck,
  Bookmark,
  Calendar,
  Clock,
  AlertCircle,
  RotateCcw,
  Sparkles,
  ArrowRight,
  BookOpen,
  History,
  CheckCircle2,
} from 'lucide-react';

const MyBooks = () => {
  const [borrowedBooks, setBorrowedBooks] = useState([]);
  const [showHistory, setShowHistory] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isDemoMode, setIsDemoMode] = useState(false);
  const { addToast } = useToast();

  const fetchMyBooks = async () => {
    setLoading(true);
    try {
      const response = await API.get('/borrow/my-books');
      if (Array.isArray(response.data) && response.data.length > 0) {
        setBorrowedBooks(response.data);
        setIsDemoMode(false);
      } else {
        setBorrowedBooks(DEMO_BORROWED);
        setIsDemoMode(true);
      }
    } catch {
      setBorrowedBooks(DEMO_BORROWED);
      setIsDemoMode(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyBooks();
  }, []);

  const handleReturn = async (recordId, bookTitle) => {
    try {
      await API.post(`/borrow/return/${recordId}`);
      addToast(`"${bookTitle || 'Book'}" returned successfully!`, 'success');
      fetchMyBooks();
    } catch {
      if (isDemoMode) {
        setBorrowedBooks((prev) =>
          prev.map((rec) =>
            rec.id === recordId
              ? {
                  ...rec,
                  status: 'RETURNED',
                  returnedAt: new Date().toISOString(),
                  overdue: false,
                }
              : rec
          )
        );
        addToast(`Returned "${bookTitle || 'Book'}" (Demo Simulation)!`, 'success');
      } else {
        addToast('Failed to return book. Please try again.', 'error');
      }
    }
  };

  const activeBooks = borrowedBooks.filter(
    (b) => b.status !== 'RETURNED' && !b.returnedAt
  );
  const returnedBooks = borrowedBooks.filter(
    (b) => b.status === 'RETURNED' || !!b.returnedAt
  );
  const overdueCount = activeBooks.filter((b) => b.overdue).length;
  const displayedBooks = showHistory ? borrowedBooks : activeBooks;

  return (
    <div className="main-content">
      <div className="container">
        {isDemoMode && (
          <div
            style={{
              background: 'var(--bg-subtle)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-md)',
              padding: '0.6rem 1rem',
              marginTop: '1.25rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              fontSize: '0.82rem',
              color: 'var(--text-main)',
              flexWrap: 'wrap',
              gap: '0.5rem',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Sparkles size={15} color="var(--primary)" />
              <span>
                <strong>Demo Loans Mode:</strong> Real data syncs automatically with Spring Boot REST endpoints.
              </span>
            </div>
            <button
              onClick={fetchMyBooks}
              style={{
                background: 'var(--bg-surface)',
                border: '1px solid var(--border-strong)',
                padding: '0.2rem 0.5rem',
                borderRadius: 'var(--radius-sm)',
                fontSize: '0.75rem',
                fontWeight: 600,
                color: 'var(--primary)',
              }}
            >
              Sync Live
            </button>
          </div>
        )}

        {/* Header & Stats Banner */}
        <section className="hero-banner">
          <div className="hero-content">
            <div className="hero-text-block">
              <div className="hero-badge-tag">
                <Bookmark size={13} />
                <span>Reader Dashboard</span>
              </div>
              <h1 className="hero-title">My Borrowed Books</h1>
              <p className="hero-desc">
                Review active loans, return deadlines, and checkout history.
              </p>
            </div>
            <div className="hero-stats-row">
              <div className="hero-stat-card">
                <div className="stat-icon-wrapper" style={{ background: 'var(--primary-light)', color: 'var(--primary)' }}>
                  <BookOpen size={16} />
                </div>
                <span className="stat-num">{activeBooks.length}</span>
                <span className="stat-label">Active Loans</span>
              </div>
              <div className="hero-stat-card">
                <div
                  className="stat-icon-wrapper"
                  style={{
                    background: overdueCount > 0 ? 'var(--danger-light)' : 'var(--bg-subtle)',
                    color: overdueCount > 0 ? 'var(--danger)' : 'var(--text-dim)',
                  }}
                >
                  <AlertCircle size={16} />
                </div>
                <span className="stat-num" style={{ color: overdueCount > 0 ? 'var(--danger)' : 'inherit' }}>
                  {overdueCount}
                </span>
                <span className="stat-label">Overdue</span>
              </div>
              <div className="hero-stat-card">
                <div className="stat-icon-wrapper" style={{ background: 'var(--success-light)', color: 'var(--success)' }}>
                  <CheckCircle2 size={16} />
                </div>
                <span className="stat-num">{returnedBooks.length}</span>
                <span className="stat-label">Returned</span>
              </div>
            </div>
          </div>
        </section>

        {/* Switcher Bar */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '1rem',
            marginBottom: '1.25rem',
          }}
        >
          <div className="filter-pills-group">
            <button
              className={`filter-pill-btn ${!showHistory ? 'active' : ''}`}
              onClick={() => setShowHistory(false)}
            >
              <Bookmark size={14} />
              <span>Active Loans</span>
              <span className="filter-count-badge">{activeBooks.length}</span>
            </button>
            <button
              className={`filter-pill-btn ${showHistory ? 'active' : ''}`}
              onClick={() => setShowHistory(true)}
            >
              <History size={14} />
              <span>Borrowing History</span>
              <span className="filter-count-badge">{borrowedBooks.length}</span>
            </button>
          </div>
          <Link to="/" className="btn-ghost-nav" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.85rem' }}>
            <span>Browse Catalog</span>
            <ArrowRight size={14} />
          </Link>
        </div>

        {/* Table Content */}
        {loading ? (
          <div className="empty-state">
            <div className="empty-state-icon">
              <BookCheck size={24} />
            </div>
            <h3 className="empty-state-title">Retrieving Loans...</h3>
            <p className="empty-state-desc">Checking borrowed items and records.</p>
          </div>
        ) : displayedBooks.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">
              <BookOpen size={24} />
            </div>
            <h3 className="empty-state-title">
              {showHistory ? 'No borrowing history found' : 'No books currently borrowed'}
            </h3>
            <p className="empty-state-desc">
              {showHistory
                ? 'You have not checked out any volumes yet.'
                : 'All borrowed items have been returned.'}
            </p>
            <Link to="/" className="btn-primary-nav" style={{ display: 'inline-flex', margin: '0 auto' }}>
              <BookOpen size={15} />
              <span>Explore Book Catalog</span>
            </Link>
          </div>
        ) : (
          <div className="table-container fade-in">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Book Details</th>
                  <th>Author</th>
                  <th>Borrowed On</th>
                  <th>Due Date</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {displayedBooks.map((record) => {
                  const isReturned = record.status === 'RETURNED' || !!record.returnedAt;
                  const daysMeta = getDaysRemainingText(record.dueDate, isReturned);
                  return (
                    <tr
                      key={record.id}
                      style={{
                        backgroundColor:
                          record.overdue && !isReturned
                            ? 'var(--danger-light)'
                            : 'transparent',
                      }}
                    >
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                          <div
                            style={{
                              width: '32px',
                              height: '32px',
                              borderRadius: 'var(--radius-sm)',
                              background: isReturned
                                ? 'var(--bg-subtle)'
                                : record.overdue
                                ? 'var(--danger-light)'
                                : 'var(--primary-light)',
                              color: isReturned
                                ? 'var(--text-muted)'
                                : record.overdue
                                ? 'var(--danger)'
                                : 'var(--primary)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                            }}
                          >
                            <BookOpen size={16} />
                          </div>
                          <div>
                            <strong style={{ fontSize: '0.9rem', color: 'var(--text-main)' }}>
                              {record.title || 'Untitled Book'}
                            </strong>
                            <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>
                              Record #{record.id}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td style={{ color: 'var(--text-muted)' }}>
                        {record.author || 'Unknown Author'}
                      </td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.85rem' }}>
                          <Calendar size={13} color="var(--text-dim)" />
                          <span>{formatDate(record.borrowedAt)}</span>
                        </div>
                      </td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.85rem' }}>
                          <Clock size={13} color="var(--text-dim)" />
                          <span>{formatDate(record.dueDate)}</span>
                        </div>
                      </td>
                      <td>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.15rem', alignItems: 'flex-start' }}>
                          <span
                            className={`status-badge ${
                              isReturned
                                ? 'returned'
                                : record.overdue
                                ? 'overdue'
                                : 'available'
                            }`}
                          >
                            {isReturned ? (
                              <>
                                <CheckCircle2 size={12} />
                                Returned
                              </>
                            ) : record.overdue ? (
                              <>
                                <AlertCircle size={12} />
                                OVERDUE
                              </>
                            ) : (
                              <>
                                <Clock size={12} />
                                Active Loan
                              </>
                            )}
                          </span>
                          {daysMeta && (
                            <span
                              style={{
                                fontSize: '0.72rem',
                                fontWeight: 600,
                                color:
                                  daysMeta.type === 'danger'
                                    ? 'var(--danger)'
                                    : daysMeta.type === 'warning'
                                    ? 'var(--warning)'
                                    : 'var(--text-dim)',
                              }}
                            >
                              {daysMeta.text}
                            </span>
                          )}
                        </div>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        {!isReturned ? (
                          <button
                            onClick={() => handleReturn(record.id, record.title)}
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '0.35rem',
                              padding: '0.35rem 0.75rem',
                              borderRadius: 'var(--radius-md)',
                              background: 'var(--primary)',
                              color: '#ffffff',
                              fontSize: '0.82rem',
                              fontWeight: 600,
                            }}
                          >
                            <RotateCcw size={13} />
                            <span>Return</span>
                          </button>
                        ) : (
                          <span
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '0.25rem',
                              color: 'var(--text-dim)',
                              fontSize: '0.8rem',
                            }}
                          >
                            Returned {formatDate(record.returnedAt)}
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyBooks;