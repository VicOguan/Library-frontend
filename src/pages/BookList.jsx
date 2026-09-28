import { useEffect, useState, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import API from '../api/axiosInstance';
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

const COVER_GRADIENTS = [
  'linear-gradient(135deg, #4f46e5 0%, #3b82f6 100%)',
  'linear-gradient(135deg, #7c3aed 0%, #c026d3 100%)',
  'linear-gradient(135deg, #059669 0%, #10b981 100%)',
  'linear-gradient(135deg, #d97706 0%, #f59e0b 100%)',
  'linear-gradient(135deg, #e11d48 0%, #f43f5e 100%)',
  'linear-gradient(135deg, #0284c7 0%, #06b6d4 100%)',
  'linear-gradient(135deg, #475569 0%, #64748b 100%)',
  'linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%)',
];

const GENRES = [
  'Technology',
  'Classic Fiction',
  'Software Architecture',
  'Science',
  'Productivity',
  'Philosophy',
  'Design',
];

const DEMO_BOOKS = [
  { id: 1, title: 'Clean Code: A Handbook of Agile Software', author: 'Robert C. Martin', available: true },
  { id: 2, title: 'Designing Data-Intensive Applications', author: 'Martin Kleppmann', available: true },
  { id: 3, title: 'The Pragmatic Programmer', author: 'David Thomas & Andrew Hunt', available: false },
  { id: 4, title: 'Atomic Habits', author: 'James Clear', available: true },
  { id: 5, title: 'Dune', author: 'Frank Herbert', available: false },
  { id: 6, title: 'To Kill a Mockingbird', author: 'Harper Lee', available: true },
  { id: 7, title: 'Refactoring: Improving Existing Code', author: 'Martin Fowler', available: true },
  { id: 8, title: '1984', author: 'George Orwell', available: true },
];

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

  const getBookCoverGradient = (id) => {
    const index = Math.abs(id || 0) % COVER_GRADIENTS.length;
    return COVER_GRADIENTS[index];
  };

  const getBookGenre = (id, title) => {
    const hash = (id || 0) + (title ? title.length : 0);
    return GENRES[hash % GENRES.length];
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
                <strong>Catalog Preview:</strong> Displaying interactive collection. Start your Spring Boot backend on port 8080 to sync live database items!
              </span>
            </div>
            <button
              onClick={fetchBooks}
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
              Retry Sync
            </button>
          </div>
        )}

        {/* Hero Section */}
        <section className="hero-banner">
          <div className="hero-glow-blob"></div>
          <div className="hero-glow-blob-2"></div>
          <div className="hero-content">
            <div className="hero-text-block">
              <div className="hero-badge-tag">
                <Sparkles size={14} />
                <span>Next-Generation Library</span>
              </div>
              <h1 className="hero-title">
                Discover Knowledge. <br />
                Ignite Your Imagination.
              </h1>
              <p className="hero-desc">
                Browse our curated collection of software engineering, classic literature, and science volumes. Borrow with a single click and track your reading journey.
              </p>
            </div>

            <div className="hero-stats-row">
              <div className="hero-stat-card">
                <div className="stat-icon-wrapper" style={{ background: 'var(--primary-light)', color: 'var(--primary)' }}>
                  <Library size={18} />
                </div>
                <span className="stat-num">{totalBooks}</span>
                <span className="stat-label">Total Books</span>
              </div>

              <div className="hero-stat-card">
                <div className="stat-icon-wrapper" style={{ background: 'var(--success-light)', color: 'var(--success)' }}>
                  <CheckCircle size={18} />
                </div>
                <span className="stat-num">{availableBooks}</span>
                <span className="stat-label">Available Now</span>
              </div>

              <div className="hero-stat-card">
                <div className="stat-icon-wrapper" style={{ background: 'var(--warning-light)', color: 'var(--warning)' }}>
                  <Clock size={18} />
                </div>
                <span className="stat-num">{borrowedBooks}</span>
                <span className="stat-label">Borrowed</span>
              </div>
            </div>
          </div>
        </section>

        {/* Controls Toolbar */}
        <div className="catalog-toolbar">
          <div className="toolbar-primary-row">
            <div className="search-box-wrapper">
              <Search size={18} className="search-icon" />
              <input
                type="text"
                className="search-input"
                placeholder="Search by title or author name..."
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
                <ArrowUpDown size={15} color="var(--text-dim)" />
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  style={{
                    padding: '0.45rem 0.85rem',
                    borderRadius: 'var(--radius-md)',
                    fontSize: '0.85rem',
                    fontWeight: 600,
                    width: 'auto',
                    minWidth: '130px',
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
                  <LayoutGrid size={18} />
                </button>
                <button
                  className={`view-btn ${viewMode === 'table' ? 'active' : ''}`}
                  onClick={() => setViewMode('table')}
                  title="Table View"
                  aria-label="Table View"
                >
                  <List size={18} />
                </button>
              </div>

              {user?.role === 'ADMIN' && (
                <button className="btn-add-book" onClick={openAddModal}>
                  <Plus size={18} />
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
                All Volumes
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

            <div style={{ fontSize: '0.85rem', color: 'var(--text-dim)', fontWeight: 500 }}>
              Showing {filteredBooks.length} of {totalBooks} items
            </div>
          </div>
        </div>

        {/* Content Body */}
        {loading ? (
          <div className="empty-state">
            <div className="empty-state-icon" style={{ animation: 'pulseGlow 1.5s infinite' }}>
              <BookOpen size={28} />
            </div>
            <h3 className="empty-state-title">Loading Catalog...</h3>
            <p className="empty-state-desc">Fetching the library collection for you.</p>
          </div>
        ) : filteredBooks.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">
              <Filter size={28} />
            </div>
            <h3 className="empty-state-title">No books match your criteria</h3>
            <p className="empty-state-desc">
              Try adjusting your search query or switching availability filter.
            </p>
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
              const bgGradient = getBookCoverGradient(book.id);
              const genre = getBookGenre(book.id, book.title);

              return (
                <div key={book.id} className="book-card fade-in">
                  <div className="book-cover-banner" style={{ background: bgGradient }}>
                    <div className="book-cover-spine"></div>
                    <div className="book-cover-pattern"></div>
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
                          <Clock size={12} />
                          Checked Out
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
                      <User size={14} />
                      <span>{book.author}</span>
                    </div>

                    <div className="book-card-actions">
                      {book.available ? (
                        <button
                          className="btn-borrow"
                          onClick={() => handleBorrow(book)}
                        >
                          <BookmarkPlus size={16} />
                          <span>Borrow Book</span>
                        </button>
                      ) : (
                        <button className="btn-borrow" disabled>
                          <Clock size={16} />
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
                            <Edit2 size={15} />
                          </button>
                          <button
                            className="btn-action-icon danger"
                            onClick={() => setDeleteId(book.id)}
                            title="Delete Book"
                            aria-label="Delete book"
                          >
                            <Trash2 size={15} />
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
                  <th style={{ width: '80px' }}>ID</th>
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
                      <td style={{ fontWeight: 700, color: 'var(--text-dim)' }}>
                        #{book.id}
                      </td>
                      <td>
                        <strong style={{ color: 'var(--text-main)', fontSize: '0.98rem' }}>
                          {book.title}
                        </strong>
                      </td>
                      <td style={{ color: 'var(--text-muted)' }}>{book.author}</td>
                      <td>
                        <span
                          style={{
                            background: 'var(--bg-subtle)',
                            padding: '0.2rem 0.6rem',
                            borderRadius: 'var(--radius-sm)',
                            fontSize: '0.78rem',
                            fontWeight: 600,
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
                              <CheckCircle size={14} />
                              Available
                            </>
                          ) : (
                            <>
                              <Clock size={14} />
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
                            gap: '0.5rem',
                          }}
                        >
                          {book.available && (
                            <button
                              onClick={() => handleBorrow(book)}
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '0.35rem',
                                background: 'var(--brand-gradient)',
                                color: '#fff',
                                padding: '0.4rem 0.8rem',
                                borderRadius: 'var(--radius-md)',
                                fontSize: '0.82rem',
                                fontWeight: 600,
                              }}
                            >
                              <BookmarkPlus size={14} />
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
                                <Edit2 size={14} />
                              </button>
                              <button
                                className="btn-action-icon danger"
                                onClick={() => setDeleteId(book.id)}
                                title="Delete"
                              >
                                <Trash2 size={14} />
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
                  {editingBook ? <Edit2 size={20} /> : <BookMarked size={20} />}
                </div>
                <div>
                  <h3 className="modal-title">
                    {editingBook ? 'Edit Book Information' : 'Add New Book to Collection'}
                  </h3>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    {editingBook
                      ? 'Update the volume specifications below'
                      : 'Provide book metadata to enrich the catalog'}
                  </p>
                </div>
              </div>
              <button
                className="modal-close-btn"
                onClick={() => setModalOpen(false)}
                aria-label="Close modal"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveBook}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Book Title</label>
                  <div className="input-with-icon">
                    <BookOpen size={18} className="input-icon" />
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
                    <User size={18} className="input-icon" />
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
                  style={{ width: 'auto', marginTop: 0, padding: '0.65rem 1.5rem' }}
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
          <div className="modal-card" style={{ maxWidth: '420px' }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-body" style={{ textAlign: 'center', padding: '2.25rem 1.5rem 1.5rem' }}>
              <div
                style={{
                  width: '56px',
                  height: '56px',
                  borderRadius: '50%',
                  background: 'var(--danger-light)',
                  color: 'var(--danger)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 1.25rem',
                }}
              >
                <AlertTriangle size={28} />
              </div>
              <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>
                Delete this book?
              </h3>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
                Are you sure you want to remove Book #{deleteId} from the catalog? This action cannot be undone.
              </p>

              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
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
                    padding: '0.65rem 1.5rem',
                    borderRadius: 'var(--radius-md)',
                    fontWeight: 600,
                    fontSize: '0.9rem',
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