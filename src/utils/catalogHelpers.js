/**
 * Catalog item categorization and date helpers
 */

const GENRES = [
  'Technology',
  'Classic Fiction',
  'Software Architecture',
  'Science',
  'Productivity',
  'Philosophy',
  'Design',
];

export const getBookGenre = (id, title) => {
  const hash = (id || 0) + (title ? title.length : 0);
  return GENRES[hash % GENRES.length];
};

export const formatDate = (dateString) => {
  if (!dateString) return '—';
  return new Date(dateString).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

export const getDaysRemainingText = (dueDateStr, isReturned) => {
  if (isReturned || !dueDateStr) return null;
  const due = new Date(dueDateStr).getTime();
  const now = Date.now();
  const diffDays = Math.ceil((due - now) / (1000 * 60 * 60 * 24));

  if (diffDays < 0) {
    return {
      text: `Overdue by ${Math.abs(diffDays)} day${Math.abs(diffDays) === 1 ? '' : 's'}`,
      type: 'danger',
    };
  }
  if (diffDays === 0) return { text: 'Due today!', type: 'warning' };
  if (diffDays === 1) return { text: 'Due tomorrow', type: 'warning' };
  return { text: `${diffDays} days left`, type: 'info' };
};