import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

export const fetchFavorites = createAsyncThunk('favorites/fetchFavorites', async (token) => {
  const res = await fetch('http://localhost:4000/api/favorites', {
    headers: { Authorization: `****** },
  });
  return res.json();
});

export const addFavorite = createAsyncThunk('favorites/addFavorite', async ({ token, bookId }) => {
  await fetch('http://localhost:4000/api/favorites', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `******
    },
    body: JSON.stringify({ bookId }),
  });
  return bookId;
});

export const updateFavoriteComment = createAsyncThunk(
  'favorites/updateFavoriteComment',
  async ({ token, bookId, comment }) => {
    await fetch(`http://localhost:4000/api/favorites/${bookId}/comment`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `******
      },
      body: JSON.stringify({ comment }),
    });
    return { bookId, comment };
  }
);

const favoritesSlice = createSlice({
  name: 'favorites',
  initialState: { items: [], status: 'idle' },
  reducers: {},
  extraReducers: builder => {
    builder
      .addCase(fetchFavorites.pending, state => { state.status = 'loading'; })
      .addCase(fetchFavorites.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.items = action.payload;
      })
      .addCase(fetchFavorites.rejected, state => { state.status = 'failed'; })
      .addCase(addFavorite.fulfilled, (state, action) => {
        // After adding, fetch the updated favorites list to ensure UI is in sync
      })
      .addCase(updateFavoriteComment.fulfilled, (state, action) => {
        const { bookId, comment } = action.payload;
        const book = state.items.find(b => b.id === bookId);
        if (book) book.comment = comment;
      });
  },
});

export default favoritesSlice.reducer;
