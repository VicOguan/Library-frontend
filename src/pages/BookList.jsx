import { useEffect, useState, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import API from '../api/axiosInstance';
import { DEMO_BOOKS } from '../mocks/mockData';
import { getBookGenre } from '../utils/catalogHelpers';
import {
  BookOpen,
  Search,
  Plus,
  Edit2,
  Trash2,
  CheckCircle,
  Clock,
  LayoutGrid,
  List,
  Sparkles,
  User,
  Library,
  BookmarkPlus,
  X,
  AlertTriangle,
  ArrowUpDown,
  BookMarked,
  Filter,
} from 'lucide-react';

const BookList = () => {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isDemoMode, setIsDemoMode] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [sortBy, setSortBy] = useState('title_asc');
  const [viewMode, setViewMode] = useState('grid');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingBook, setEditingBook] = useState(null);
  const [titleInput, setTitleInput] = useState('');
  const [authorInput, setAuthorInput] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [deleteId, setDeleteId] = useState(null);

  const { user } = useAuth();
  const { addToast } = useToast();

  const fetchBooks = async () => {
    setLoading(true);
    try {
      const response = await API.get('/books');
      if (Array.isArray(response.data) && response.data.length > 0) {
        setBooks(response.data);
        setIsDemoMode(false);
      } else {
        setBooks(DEMO_BOOKS);
        setIsDemoMode(true);
      }
    } catch {
      setBooks(DEMO_BOOKS);
      setIsDemoMode(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBooks();
  }, []);

  const handleBorrow = async (book) => {
    if (!user) {
      addToast('Please login or create an account to borrow books.', 'info');
      return;
    }
    try {
      await API.post(`/borrow/books/${book.id}`);
      addToast(`Successfully borrowed "${book.title}"!`, 'success');
      fetchBooks();
    } catch (err) {
      if (isDemoMode) {
        setBooks((prev) =>
          prev.map((b) => (b.id === book.id ? { ...b, available: false } : b))
        );
        addToast(`Borrowed "${book.title}" (Demo Simulation)!`, 'success');
      } else {
        const errorMsg =
          err.response?.data?.messages ||
          err.response?.data?.message ||
          'Failed to borrow book or already borrowed.';
        addToast(errorMsg, 'error');
      }
    }
  };

  const openAddModal = () => {
    setEditingBook(null);
    setTitleInput('');
    setAuthorInput('');
    setModalOpen(true);
  };

  const openEditModal = (book) => {
    setEditingBook(book);
    setTitleInput(book.title);
    setAuthorInput(book.author);
    setModalOpen(true);
  };

  const handleSaveBook = async (e) => {
    e.preventDefault();
    if (!titleInput.trim() || !authorInput.trim()) {
      addToast('Title and Author are required', 'error');
      return;
    }
    setSubmitting(true);
    try {
      if (editingBook) {
        await API.put(`/books/${editingBook.id}`, {
          title: titleInput,
          author: authorInput,
        });
        addToast('Book details updated successfully!', 'success');
      } else {
        await API.post('/books', {
          title: titleInput,
          author: authorInput,
        });
        addToast('New book added to catalog!', 'success');
      }
      setModalOpen(false);
      fetchBooks();
    } catch {
      if (isDemoMode) {
        if (editingBook) {
          setBooks((prev) =>
            prev.map((b) =>
              b.id === editingBook.id
                ? { ...b, title: titleInput, author: authorInput }
                : b
            )
          );
          addToast('Book updated (Demo Simulation)!', 'success');
        } else {
          const newBook = {
            id: Date.now(),
            title: titleInput,
            author: authorInput,
            available: true,
          };
          setBooks((prev) => [newBook, ...prev]);
          addToast('Book added (Demo Simulation)!', 'success');
        }
        setModalOpen(false);
      } else {
        addToast('Operation failed. Please check server.', 'error');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const confirmDelete = async () => {
    if (!deleteId) return;
    try {
      await API.delete(`/books/${deleteId}`);
      addToast('Book deleted successfully!', 'success');
      fetchBooks();
    } catch {
      if (isDemoMode) {
        setBooks((prev) => prev.filter((b) => b.id !== deleteId));
        addToast('Book deleted (Demo Simulation)!', 'success');
      } else {
        addToast('Failed to delete book.', 'error');
      }
    } finally {
      setDeleteId(null);
    }
  };

  const filteredBooks = useMemo(() => {
    return books
      .filter((book) => {
        const matchesSearch =
          book.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          book.author?.toLowerCase().includes(searchQuery.toLowerCase());
        if (!matchesSearch) return false;
        if (filterStatus === 'AVAILABLE') return book.available;
        if (filterStatus === 'BORROWED') return !book.available;
        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'title_asc') return (a.title || '').localeCompare(b.title || '');
        if (sortBy === 'title_desc') return (b.title || '').localeCompare(a.title || '');
        if (sortBy === 'author_asc') return (a.author || '').localeCompare(b.author || '');
        if (sortBy === 'id_desc') return b.id - a.id;
        return a.id - b.id;
      });
  }, [books, searchQuery, filterStatus, sortBy]);

  const totalBooks = books.length;
  const availableBooks = books.filter((b) => b.available).length;
  const borrowedBooks = totalBooks - availableBooks;

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
                <strong>Catalog Preview Mode:</strong> Displaying mock data. Start Spring Boot backend on port 8080 to sync live database items.
              </span>
            </div>
            <button
              onClick={fetchBooks}
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
              Retry Sync
            </button>
          </div>
        )}

        {/* Header Section */}
        <section className="hero-banner">
          <div className="hero-content">
            <div className="hero-text-block">
              <div className="hero-badge-tag">
                <Sparkles size={13} />
                <span>Open-Access Portal</span>
              </div>
              <h1 className="hero-title">Library Collection</h1>
              <p className="hero-desc">
                Browse software engineering, computer science, and classic literature volumes.
              </p>
            </div>
            <div className="hero-stats-row">
              <div className="hero-stat-card">
                <div className="stat-icon-wrapper" style={{ background: 'var(--primary-light)', color: 'var(--primary)' }}>
                  <Library size={16} />
                </div>
                <span className="stat-num">{totalBooks}</span>
                <span className="stat-label">Total Books</span>
              </div>
              <div className="hero-stat-card">
                <div className="stat-icon-wrapper" style={{ background: 'var(--success-light)', color: 'var(--success)' }}>
                  <CheckCircle size={16} />
                </div>
                <span className="stat-num">{availableBooks}</span>
                <span className="stat-label">Available</span>
              </div>
              <div className="hero-stat-card">
                <div className="stat-icon-wrapper" style={{ background: 'var(--warning-light)', color: 'var(--warning)' }}>
                  <Clock size={16} />
                </div>
                <span className="stat-num">{borrowedBooks}</span>
                <span className="stat-label">Checked Out</span>
              </div>
            </div>
          </div>
        </section>

        {/* Catalog Controls Toolbar */}
        <div className="catalog-toolbar">
          <div className="toolbar-primary-row">
            <div className="search-box-wrapper">
              <Search size={16} className="search-icon" />
              <input
                type="text"
                className="search-input"
                placeholder="Search by title or author..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {searchQuery && (
                <button
                  className="search-clear-btn"
                  onClick={() => setSearchQuery('')}
                  aria-label="Clear search"
                >
                  <X size={14} />
                </button>
              )}
            </div>
            <div className="toolbar-actions-group">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <ArrowUpDown size={14} color="var(--text-dim)" />
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  style={{
                    padding: '0.4rem 0.75rem',
                    borderRadius: 'var(--radius-md)',
                    fontSize: '0.82rem',
                    fontWeight: 500,
                    width: 'auto',
                  }}
                >
                  <option value="title_asc">Title (A-Z)</option>
                  <option value="title_desc">Title (Z-A)</option>
                  <option value="author_asc">Author (A-Z)</option>
                  <option value="id_desc">Newest Added</option>
                </select>
              </div>
              <div className="view-toggle-group">
                <button
                  className={`view-btn ${viewMode === 'grid' ? 'active' : ''}`}
                  onClick={() => setViewMode('grid')}
                  title="Card Grid View"
                  aria-label="Card Grid View"
                >
                  <LayoutGrid size={16} />
                </button>
                <button
                  className={`view-btn ${viewMode === 'table' ? 'active' : ''}`}
                  onClick={() => setViewMode('table')}
                  title="Table View"
                  aria-label="Table View"
                >
                  <List size={16} />
                </button>
              </div>
              {user?.role === 'ADMIN' && (
                <button className="btn-add-book" onClick={openAddModal}>
                  <Plus size={16} />
                  <span>Add Book</span>
                </button>
              )}
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
            <div className="filter-pills-group">
              <button
                className={`filter-pill-btn ${filterStatus === 'ALL' ? 'active' : ''}`}
                onClick={() => setFilterStatus('ALL')}
              >
                All
                <span className="filter-count-badge">{totalBooks}</span>
              </button>
              <button
                className={`filter-pill-btn ${filterStatus === 'AVAILABLE' ? 'active' : ''}`}
                onClick={() => setFilterStatus('AVAILABLE')}
              >
                Available
                <span className="filter-count-badge">{availableBooks}</span>
              </button>
              <button
                className={`filter-pill-btn ${filterStatus === 'BORROWED' ? 'active' : ''}`}
                onClick={() => setFilterStatus('BORROWED')}
              >
                Borrowed
                <span className="filter-count-badge">{borrowedBooks}</span>
              </button>
            </div>
            <div style={{ fontSize: '0.82rem', color: 'var(--text-dim)', fontWeight: 500 }}>
              Showing {filteredBooks.length} of {totalBooks} items
            </div>
          </div>
        </div>

        {/* Content Section */}
        {loading ? (
          <div className="empty-state">
            <div className="empty-state-icon">
              <BookOpen size={24} />
            </div>
            <h3 className="empty-state-title">Loading Catalog...</h3>
            <p className="empty-state-desc">Fetching items from the database.</p>
          </div>
        ) : filteredBooks.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">
              <Filter size={24} />
            </div>
            <h3 className="empty-state-title">No books match your criteria</h3>
            <p className="empty-state-desc">Try adjusting your query or switching filters.</p>
            <button
              className="btn-primary-nav"
              style={{ display: 'inline-flex', margin: '0 auto' }}
              onClick={() => {
                setSearchQuery('');
                setFilterStatus('ALL');
              }}
            >
              Reset Filters
            </button>
          </div>
        ) : viewMode === 'grid' ? (
          <div className="books-grid">
            {filteredBooks.map((book) => {
              const genre = getBookGenre(book.id, book.title);
              return (
                <div key={book.id} className="book-card fade-in">
                  <div className="book-cover-banner">
                    <span className="book-genre-tag">{genre}</span>
                    <span
                      className={`book-status-badge ${
                        book.available ? 'available' : 'borrowed'
                      }`}
                    >
                      {book.available ? (
                        <>
                          <span className="status-dot-pulse"></span>
                          Available
                        </>
                      ) : (
                        <>
                          <Clock size={11} />
                          Borrowed
                        </>
                      )}
                    </span>
                  </div>
                  <div className="book-card-body">
                    <span className="book-id-chip">BOOK #{book.id}</span>
                    <h3 className="book-title" title={book.title}>
                      {book.title}
                    </h3>
                    <div className="book-author-row">
                      <User size={13} />
                      <span>{book.author}</span>
                    </div>
                    <div className="book-card-actions">
                      {book.available ? (
                        <button
                          className="btn-borrow"
                          onClick={() => handleBorrow(book)}
                        >
                          <BookmarkPlus size={15} />
                          <span>Borrow</span>
                        </button>
                      ) : (
                        <button className="btn-borrow" disabled>
                          <Clock size={15} />
                          <span>Unavailable</span>
                        </button>
                      )}
                      {user?.role === 'ADMIN' && (
                        <>
                          <button
                            className="btn-action-icon"
                            onClick={() => openEditModal(book)}
                            title="Edit Book Details"
                            aria-label="Edit book"
                          >
                            <Edit2 size={14} />
                          </button>
                          <button
                            className="btn-action-icon danger"
                            onClick={() => setDeleteId(book.id)}
                            title="Delete Book"
                            aria-label="Delete book"
                          >
                            <Trash2 size={14} />
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="table-container fade-in">
            <table className="custom-table">
              <thead>
                <tr>
                  <th style={{ width: '70px' }}>ID</th>
                  <th>Title</th>
                  <th>Author</th>
                  <th>Category</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredBooks.map((book) => {
                  const genre = getBookGenre(book.id, book.title);
                  return (
                    <tr key={book.id}>
                      <td style={{ fontWeight: 600, color: 'var(--text-dim)' }}>
                        #{book.id}
                      </td>
                      <td>
                        <strong style={{ color: 'var(--text-main)', fontSize: '0.9rem' }}>
                          {book.title}
                        </strong>
                      </td>
                      <td style={{ color: 'var(--text-muted)' }}>{book.author}</td>
                      <td>
                        <span
                          style={{
                            background: 'var(--bg-subtle)',
                            padding: '0.15rem 0.5rem',
                            borderRadius: 'var(--radius-sm)',
                            fontSize: '0.75rem',
                            fontWeight: 500,
                            color: 'var(--text-muted)',
                          }}
                        >
                          {genre}
                        </span>
                      </td>
                      <td>
                        <span
                          className={`status-badge ${
                            book.available ? 'available' : 'borrowed'
                          }`}
                        >
                          {book.available ? (
                            <>
                              <CheckCircle size={13} />
                              Available
                            </>
                          ) : (
                            <>
                              <Clock size={13} />
                              Borrowed
                            </>
                          )}
                        </span>
                      </td>
                      <td>
                        <div
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'flex-end',
                            gap: '0.4rem',
                          }}
                        >
                          {book.available && (
                            <button
                              onClick={() => handleBorrow(book)}
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '0.3rem',
                                background: 'var(--primary)',
                                color: '#fff',
                                padding: '0.35rem 0.75rem',
                                borderRadius: 'var(--radius-md)',
                                fontSize: '0.8rem',
                                fontWeight: 600,
                              }}
                            >
                              <BookmarkPlus size={13} />
                              Borrow
                            </button>
                          )}
                          {user?.role === 'ADMIN' && (
                            <>
                              <button
                                className="btn-action-icon"
                                onClick={() => openEditModal(book)}
                                title="Edit"
                              >
                                <Edit2 size={13} />
                              </button>
                              <button
                                className="btn-action-icon danger"
                                onClick={() => setDeleteId(book.id)}
                                title="Delete"
                              >
                                <Trash2 size={13} />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Admin Add/Edit Modal */}
      {modalOpen && (
        <div className="modal-overlay" onClick={() => setModalOpen(false)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title-box">
                <div className="modal-icon-badge">
                  {editingBook ? <Edit2 size={18} /> : <BookMarked size={18} />}
                </div>
                <div>
                  <h3 className="modal-title">
                    {editingBook ? 'Edit Book Information' : 'Add New Book'}
                  </h3>
                </div>
              </div>
              <button
                className="modal-close-btn"
                onClick={() => setModalOpen(false)}
                aria-label="Close modal"
              >
                <X size={16} />
              </button>
            </div>
            <form onSubmit={handleSaveBook}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Book Title</label>
                  <div className="input-with-icon">
                    <BookOpen size={16} className="input-icon" />
                    <input
                      type="text"
                      placeholder="e.g. Designing Data-Intensive Applications"
                      value={titleInput}
                      onChange={(e) => setTitleInput(e.target.value)}
                      required
                      autoFocus
                    />
                  </div>
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Author Name</label>
                  <div className="input-with-icon">
                    <User size={16} className="input-icon" />
                    <input
                      type="text"
                      placeholder="e.g. Martin Kleppmann"
                      value={authorInput}
                      onChange={(e) => setAuthorInput(e.target.value)}
                      required
                    />
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="btn-ghost-nav"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="btn-submit-auth"
                  style={{ width: 'auto', marginTop: 0, padding: '0.45rem 1.25rem' }}
                >
                  {submitting
                    ? 'Saving...'
                    : editingBook
                    ? 'Save Changes'
                    : 'Add to Library'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteId && (
        <div className="modal-overlay" onClick={() => setDeleteId(null)}>
          <div className="modal-card" style={{ maxWidth: '380px' }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-body" style={{ textAlign: 'center', padding: '1.75rem 1.25rem 1.25rem' }}>
              <div
                style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: '50%',
                  background: 'var(--danger-light)',
                  color: 'var(--danger)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 1rem',
                }}
              >
                <AlertTriangle size={22} />
              </div>
              <h3 style={{ fontSize: '1.15rem', marginBottom: '0.4rem' }}>
                Delete this book?
              </h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
                Are you sure you want to remove Book #{deleteId}? This action cannot be undone.
              </p>
              <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
                <button
                  type="button"
                  className="btn-ghost-nav"
                  onClick={() => setDeleteId(null)}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={confirmDelete}
                  style={{
                    background: 'var(--danger)',
                    color: '#ffffff',
                    padding: '0.45rem 1.25rem',
                    borderRadius: 'var(--radius-md)',
                    fontWeight: 600,
                    fontSize: '0.85rem',
                  }}
                >
                  Yes, Delete Book
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BookList;