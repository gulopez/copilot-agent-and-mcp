
import React, { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { fetchBooks, setSort } from '../store/booksSlice';
import { addFavorite, fetchFavorites } from '../store/favoritesSlice';
import { useNavigate, useSearchParams } from 'react-router-dom';
import styles from '../styles/BookList.module.css';

const BookList = () => {
  const dispatch = useAppDispatch();
  const books = useAppSelector(state => state.books.items);
  const status = useAppSelector(state => state.books.status);
  const sortBy = useAppSelector(state => state.books.sortBy);
  const sortOrder = useAppSelector(state => state.books.sortOrder);
  const token = useAppSelector(state => state.user.token);
  const navigate = useNavigate();
  const favorites = useAppSelector(state => state.favorites.items);
  const [searchParams, setSearchParams] = useSearchParams();
  const sortByParam = searchParams.get('sortBy');
  const sortOrderParam = searchParams.get('sortOrder');
  const currentSortBy = ['title', 'author'].includes(sortByParam) ? sortByParam : sortBy;
  const currentSortOrder = ['asc', 'desc'].includes(sortOrderParam) ? sortOrderParam : sortOrder;

  useEffect(() => {
    if (!sortByParam || !sortOrderParam) {
      setSearchParams({ sortBy: currentSortBy, sortOrder: currentSortOrder }, { replace: true });
    }
  }, [sortByParam, sortOrderParam, currentSortBy, currentSortOrder, setSearchParams]);

  useEffect(() => {
    if (!token) {
      navigate('/');
      return;
    }
    dispatch(setSort({ sortBy: currentSortBy, sortOrder: currentSortOrder }));
    dispatch(fetchBooks({ sortBy: currentSortBy, sortOrder: currentSortOrder }));
    dispatch(fetchFavorites(token));
  }, [dispatch, token, navigate, currentSortBy, currentSortOrder]);

  const handleAddFavorite = async (bookId) => {
    if (!token) {
      navigate('/');
      return;
    }
    await dispatch(addFavorite({ token, bookId }));
    dispatch(fetchFavorites(token));
  };

  const handleSortChange = (event) => {
    const [nextSortBy, nextSortOrder] = event.target.value.split('-');
    dispatch(setSort({ sortBy: nextSortBy, sortOrder: nextSortOrder }));
    setSearchParams({ sortBy: nextSortBy, sortOrder: nextSortOrder });
  };

  const currentSortLabel = currentSortBy === 'title'
    ? `Title (${currentSortOrder === 'asc' ? 'A-Z' : 'Z-A'})`
    : `Author (${currentSortOrder === 'asc' ? 'A-Z' : 'Z-A'})`;

  if (status === 'loading') return <div>Loading...</div>;
  if (status === 'failed') return <div>Failed to load books.</div>;

  return (
    <div>
      <h2>Books</h2>
      <div className={styles.sortControls}>
        <label htmlFor="book-sort">Sort by:</label>
        <select
          id="book-sort"
          className={styles.sortSelect}
          value={`${currentSortBy}-${currentSortOrder}`}
          onChange={handleSortChange}
        >
          <option value="title-asc">Title (A-Z)</option>
          <option value="title-desc">Title (Z-A)</option>
          <option value="author-asc">Author (A-Z)</option>
          <option value="author-desc">Author (Z-A)</option>
        </select>
        <span id="current-sort-indicator" className={styles.sortStatus}>
          Current sort: {currentSortLabel}
        </span>
      </div>
      {books.length === 0 ? (
        <div style={{
          background: '#fff',
          padding: '2rem',
          borderRadius: '8px',
          maxWidth: '400px',
          margin: '2rem auto',
          boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
          textAlign: 'center',
          color: '#888',
        }}>
          <p>No books available.</p>
          <p>Check back later or add a new book if you have permission.</p>
        </div>
      ) : (
        <div className={styles.bookGrid}>
          {books.map(book => {
            const isFavorite = favorites.some(fav => fav.id === book.id);
            return (
              <div className={styles.bookCard + ' ' + styles.bookCardWithHeart} key={book.id}>
                {isFavorite && (
                  <span className={styles.favoriteHeart} title="In Favorites">
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="#e25555" stroke="#e25555" strokeWidth="1.5">
                      <path d="M12 21s-6.2-5.2-8.4-7.4C1.2 11.2 1.2 8.1 3.1 6.2c1.9-1.9 5-1.9 6.9 0l2 2 2-2c1.9-1.9 5-1.9 6.9 0 1.9 1.9 1.9 5 0 6.9C18.2 15.8 12 21 12 21z"/>
                    </svg>
                  </span>
                )}
                <div className={styles.bookTitle} data-book-title>{book.title}</div>
                <div className={styles.bookAuthor} data-book-author>by {book.author}</div>
                <button
                  className={styles.simpleBtn}
                  onClick={() => handleAddFavorite(book.id)}
                >
                  {isFavorite ? 'In Favorites' : 'Add to Favorites'}
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default BookList;
