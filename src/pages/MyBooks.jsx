import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import API from '../api/axiosInstance';
import { useToast } from '../context/ToastContext';
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

const DEMO_BORROWED = [
  {
    id: 101,
    bookId: 3,
    title: 'The Pragmatic Programmer',
    author: 'David Thomas & Andrew Hunt',
    borrowedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    dueDate: new Date(Date.now() + 9 * 24 * 60 * 60 * 1000).toISOString(),
    returnedAt: null,
    status: 'ACTIVE',
    overdue: false,
  },
  {
    id: 102,
    bookId: 5,
    title: 'Dune',
    author: 'Frank Herbert',
    borrowedAt: new Date(Date.now() - 18 * 24 * 60 * 60 * 1000).toISOString(),
    dueDate: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
    returnedAt: null,
    status: 'OVERDUE',
    overdue: true,
  },
  {
    id: 103,
    bookId: 1,
    title: 'Clean Code: A Handbook of Agile Software',
    author: 'Robert C. Martin',
    borrowedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    dueDate: new Date(Date.now() - 16 * 24 * 60 * 60 * 1000).toISOString(),
    returnedAt: new Date(Date.now() - 17 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'RETURNED',
    overdue: false,
  },
];

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

  const formatDate = (dateString) => {
    if (!dateString) return '—';
    return new Date(dateString).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getDaysRemainingText = (dueDateStr, isReturned) => {
    if (isReturned) return null;
    if (!dueDateStr) return null;

    const due = new Date(dueDateStr).getTime();
    const now = Date.now();
    const diffDays = Math.ceil((due - now) / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      return {
        text: `Overdue by ${Math.abs(diffDays)} day${Math.abs(diffDays) === 1 ? '' : 's'}`,
        type: 'danger',
      };
    }
    if (diffDays === 0) {
      return { text: 'Due today!', type: 'warning' };
    }
    if (diffDays === 1) {
      return { text: 'Due tomorrow', type: 'warning' };
    }
    return { text: `${diffDays} days left`, type: 'info' };
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
              background: 'rgba(99, 102, 241, 0.1)',
              border: '1px solid rgba(99, 102, 241, 0.25)',
              borderRadius: 'var(--radius-md)',
              padding: '0.75rem 1.25rem',
              marginTop: '1.5rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              fontSize: '0.85rem',
              color: 'var(--text-main)',
              flexWrap: 'wrap',
              gap: '0.5rem',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Sparkles size={16} color="var(--primary)" />
              <span>
                <strong>Demo Loans:</strong> Displaying sample borrowing history. Real data syncs automatically with your Spring Boot service.
              </span>
            </div>
            <button
              onClick={fetchMyBooks}
              style={{
                background: 'var(--bg-surface)',
                border: '1px solid var(--border-subtle)',
                padding: '0.25rem 0.65rem',
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
        <section className="hero-banner" style={{ marginTop: '1.5rem', marginBottom: '2rem', padding: '2rem' }}>
          <div className="hero-glow-blob"></div>
          <div className="hero-content">
            <div className="hero-text-block">
              <div className="hero-badge-tag">
                <Bookmark size={14} />
                <span>Reader Dashboard</span>
              </div>
              <h1 className="hero-title" style={{ fontSize: '2.2rem' }}>
                My Borrowed Books
              </h1>
              <p className="hero-desc">
                Review your current book loans, monitor upcoming return deadlines, and check your complete borrowing record.
              </p>
            </div>

            <div className="hero-stats-row">
              <div className="hero-stat-card">
                <div className="stat-icon-wrapper" style={{ background: 'var(--primary-light)', color: 'var(--primary)' }}>
                  <BookOpen size={18} />
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
                  <AlertCircle size={18} />
                </div>
                <span className="stat-num" style={{ color: overdueCount > 0 ? 'var(--danger)' : 'inherit' }}>
                  {overdueCount}
                </span>
                <span className="stat-label">Overdue</span>
              </div>

              <div className="hero-stat-card">
                <div className="stat-icon-wrapper" style={{ background: 'var(--success-light)', color: 'var(--success)' }}>
                  <CheckCircle2 size={18} />
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
            marginBottom: '1.5rem',
          }}
        >
          <div className="filter-pills-group">
            <button
              className={`filter-pill-btn ${!showHistory ? 'active' : ''}`}
              onClick={() => setShowHistory(false)}
            >
              <Bookmark size={15} />
              <span>Active Loans</span>
              <span className="filter-count-badge">{activeBooks.length}</span>
            </button>
            <button
              className={`filter-pill-btn ${showHistory ? 'active' : ''}`}
              onClick={() => setShowHistory(true)}
            >
              <History size={15} />
              <span>Full Borrowing History</span>
              <span className="filter-count-badge">{borrowedBooks.length}</span>
            </button>
          </div>

          <Link to="/" className="btn-ghost-nav" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.88rem' }}>
            <span>Browse More Books</span>
            <ArrowRight size={15} />
          </Link>
        </div>

        {/* List Content */}
        {loading ? (
          <div className="empty-state">
            <div className="empty-state-icon" style={{ animation: 'pulseGlow 1.5s infinite' }}>
              <BookCheck size={28} />
            </div>
            <h3 className="empty-state-title">Retrieving Your Loans...</h3>
            <p className="empty-state-desc">Checking your borrowed items and records.</p>
          </div>
        ) : displayedBooks.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">
              <BookOpen size={28} />
            </div>
            <h3 className="empty-state-title">
              {showHistory
                ? 'No borrowing history found'
                : 'No books currently borrowed'}
            </h3>
            <p className="empty-state-desc">
              {showHistory
                ? 'You have not borrowed any books from the catalog yet.'
                : 'You have returned all your borrowed volumes, or have not checked out any books.'}
            </p>
            <Link to="/" className="btn-primary-nav" style={{ display: 'inline-flex', margin: '0 auto' }}>
              <BookOpen size={16} />
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
                  <th>Status & Deadline</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {displayedBooks.map((record) => {
                  const isReturned =
                    record.status === 'RETURNED' || !!record.returnedAt;
                  const daysMeta = getDaysRemainingText(record.dueDate, isReturned);

                  return (
                    <tr
                      key={record.id}
                      style={{
                        backgroundColor:
                          record.overdue && !isReturned
                            ? 'rgba(239, 68, 68, 0.05)'
                            : 'transparent',
                      }}
                    >
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                          <div
                            style={{
                              width: '36px',
                              height: '36px',
                              borderRadius: 'var(--radius-md)',
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
                            <BookOpen size={18} />
                          </div>
                          <div>
                            <strong style={{ fontSize: '0.98rem', color: 'var(--text-main)' }}>
                              {record.title || 'Untitled Book'}
                            </strong>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>
                              Record ID #{record.id}
                            </div>
                          </div>
                        </div>
                      </td>

                      <td style={{ color: 'var(--text-muted)' }}>
                        {record.author || 'Unknown Author'}
                      </td>

                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.88rem' }}>
                          <Calendar size={14} color="var(--text-dim)" />
                          <span>{formatDate(record.borrowedAt)}</span>
                        </div>
                      </td>

                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.88rem' }}>
                          <Clock size={14} color="var(--text-dim)" />
                          <span>{formatDate(record.dueDate)}</span>
                        </div>
                      </td>

                      <td>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', alignItems: 'flex-start' }}>
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
                                <CheckCircle2 size={13} />
                                Returned
                              </>
                            ) : record.overdue ? (
                              <>
                                <AlertCircle size={13} />
                                OVERDUE
                              </>
                            ) : (
                              <>
                                <Clock size={13} />
                                Active Loan
                              </>
                            )}
                          </span>

                          {daysMeta && (
                            <span
                              style={{
                                fontSize: '0.75rem',
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
                              gap: '0.4rem',
                              padding: '0.45rem 0.95rem',
                              borderRadius: 'var(--radius-md)',
                              background: 'var(--primary)',
                              color: '#ffffff',
                              fontSize: '0.85rem',
                              fontWeight: 600,
                              boxShadow: 'var(--shadow-sm)',
                            }}
                          >
                            <RotateCcw size={14} />
                            <span>Return Book</span>
                          </button>
                        ) : (
                          <span
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '0.3rem',
                              color: 'var(--text-dim)',
                              fontSize: '0.82rem',
                            }}
                          >
                            Returned on {formatDate(record.returnedAt)}
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