import { createSlice } from '@reduxjs/toolkit';

const VALID_ROLES = new Set(['member', 'administrator']);

function normalizeRole(role) {
  return VALID_ROLES.has(role) ? role : null;
}

function getInitialRole() {
  const storedRole = normalizeRole(localStorage.getItem('role'));
  if (storedRole) {
    return storedRole;
  }

  const token = localStorage.getItem('token');
  if (!token) {
    return null;
  }

  try {
    const [, payload] = token.split('.');
    if (!payload) {
      return null;
    }

    const parsedPayload = JSON.parse(atob(payload));
    return normalizeRole(parsedPayload.role) || 'member';
  } catch {
    return null;
  }
}

const initialState = {
  token: localStorage.getItem('token') || null,
  username: localStorage.getItem('username') || null,
  role: getInitialRole(),
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setUser(state, action) {
      state.token = action.payload.token;
      state.username = action.payload.username;
      state.role = action.payload.role;
      localStorage.setItem('token', action.payload.token);
      localStorage.setItem('username', action.payload.username);
      localStorage.setItem('role', action.payload.role);
    },
    logout(state) {
      state.token = null;
      state.username = null;
      state.role = null;
      localStorage.removeItem('token');
      localStorage.removeItem('username');
      localStorage.removeItem('role');
    },
  },
});

export const { setUser, logout } = userSlice.actions;
export default userSlice.reducer;
