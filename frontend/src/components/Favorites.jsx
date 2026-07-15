import React, { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { fetchFavorites, updateFavoriteComment } from '../store/favoritesSlice';
import { useNavigate } from 'react-router-dom';

const Favorites = () => {
  const dispatch = useAppDispatch();
  const favorites = useAppSelector(state => state.favorites.items);
  const status = useAppSelector(state => state.favorites.status);
  const token = useAppSelector(state => state.user.token);
  const navigate = useNavigate();

  const [editingId, setEditingId] = useState(null);
  const [commentDraft, setCommentDraft] = useState('');
  const [saveError, setSaveError] = useState(null);

  useEffect(() => {
    if (!token) {
      navigate('/');
      return;
    }
    dispatch(fetchFavorites(token));
  }, [dispatch, token, navigate]);

  const handleEditComment = (book) => {
    setEditingId(book.id);
    setCommentDraft(book.comment || '');
    setSaveError(null);
  };

  const handleSaveComment = (bookId) => {
    setSaveError(null);
    dispatch(updateFavoriteComment({ token, bookId, comment: commentDraft }))
      .unwrap()
      .then(() => {
        setEditingId(null);
        setCommentDraft('');
      })
      .catch(() => {
        setSaveError('Failed to save comment. Please try again.');
      });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setCommentDraft('');
    setSaveError(null);
  };

  if (status === 'loading') return <div>Loading...</div>;
  if (status === 'failed') return <div>Failed to load favorites.</div>;

  return (
    <div>
      <h2>My Favorite Books</h2>
      {favorites.length === 0 ? (
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
          <p>No favorite books yet.</p>
          <p>
            Go to the <a href="/books" onClick={e => { e.preventDefault(); navigate('/books'); }}>book list</a> to add some!
          </p>
        </div>
      ) : (
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {favorites.map(book => (
            <li key={book.id} style={{
              background: '#fff',
              borderRadius: '8px',
              padding: '1rem 1.5rem',
              marginBottom: '1rem',
              boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
            }}>
              <strong>{book.title}</strong> by {book.author}
              <div style={{ marginTop: '0.5rem' }}>
                {editingId === book.id ? (
                  <div>
                    <textarea
                      value={commentDraft}
                      onChange={e => setCommentDraft(e.target.value)}
                      placeholder="Add your comment..."
                      rows={3}
                      style={{
                        width: '100%',
                        borderRadius: '4px',
                        border: '1px solid #ccc',
                        padding: '0.4rem',
                        fontSize: '0.95rem',
                        resize: 'vertical',
                        boxSizing: 'border-box',
                      }}
                    />
                    {saveError && (
                      <p style={{ color: '#c0392b', fontSize: '0.85rem', margin: '0.3rem 0' }}>{saveError}</p>
                    )}
                    <div style={{ marginTop: '0.4rem', display: 'flex', gap: '0.5rem' }}>
                      <button
                        onClick={() => handleSaveComment(book.id)}
                        style={{
                          background: '#20b2aa',
                          color: '#fff',
                          border: 'none',
                          borderRadius: '4px',
                          padding: '0.3rem 1rem',
                          cursor: 'pointer',
                          fontWeight: 600,
                        }}
                      >
                        Save
                      </button>
                      <button
                        onClick={handleCancelEdit}
                        style={{
                          background: '#eee',
                          color: '#333',
                          border: 'none',
                          borderRadius: '4px',
                          padding: '0.3rem 1rem',
                          cursor: 'pointer',
                        }}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div>
                    {book.comment ? (
                      <p style={{ color: '#555', fontStyle: 'italic', margin: '0.3rem 0' }}>
                        &ldquo;{book.comment}&rdquo;
                      </p>
                    ) : (
                      <p style={{ color: '#aaa', margin: '0.3rem 0', fontSize: '0.9rem' }}>
                        No comment yet.
                      </p>
                    )}
                    <button
                      onClick={() => handleEditComment(book)}
                      style={{
                        background: 'none',
                        color: '#20b2aa',
                        border: '1px solid #20b2aa',
                        borderRadius: '4px',
                        padding: '0.2rem 0.8rem',
                        cursor: 'pointer',
                        fontSize: '0.85rem',
                        marginTop: '0.3rem',
                      }}
                    >
                      {book.comment ? 'Edit comment' : 'Add comment'}
                    </button>
                  </div>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default Favorites;
