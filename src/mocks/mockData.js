/**
 * Mock fallback fixtures for offline catalog demonstration
 */

export const DEMO_BOOKS = [
  { id: 1, title: 'Clean Code: A Handbook of Agile Software', author: 'Robert C. Martin', available: true },
  { id: 2, title: 'Designing Data-Intensive Applications', author: 'Martin Kleppmann', available: true },
  { id: 3, title: 'The Pragmatic Programmer', author: 'David Thomas & Andrew Hunt', available: false },
  { id: 4, title: 'Atomic Habits', author: 'James Clear', available: true },
  { id: 5, title: 'Dune', author: 'Frank Herbert', available: false },
  { id: 6, title: 'To Kill a Mockingbird', author: 'Harper Lee', available: true },
  { id: 7, title: 'Refactoring: Improving Existing Code', author: 'Martin Fowler', available: true },
  { id: 8, title: '1984', author: 'George Orwell', available: true },
];

export const DEMO_BORROWED = [
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