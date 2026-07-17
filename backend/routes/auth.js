const express = require('express');
const jwt = require('jsonwebtoken');

const DEFAULT_ROLE = 'member';
const VALID_ROLES = new Set(['member', 'administrator']);

function getUserRole(user) {
  return VALID_ROLES.has(user.role) ? user.role : DEFAULT_ROLE;
}

function normalizeUsers(users) {
  const needsNormalization = users.some(user => user.role !== getUserRole(user));
  if (!needsNormalization) {
    return { changed: false, normalizedUsers: users };
  }

  const normalizedUsers = users.map(user => ({ ...user, role: getUserRole(user) }));

  return { changed: true, normalizedUsers };
}

function createAuthRouter({ usersFile, readJSON, writeJSON, SECRET_KEY }) {
  const router = express.Router();

  router.post('/register', (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) return res.status(400).json({ message: 'Username and password required' });
    const users = readJSON(usersFile);
    if (users.find(u => u.username === username)) {
      return res.status(409).json({ message: 'User already exists' });
    }
    users.push({ username, password, favorites: [], role: DEFAULT_ROLE });
    writeJSON(usersFile, users);
    res.status(201).json({ message: 'User registered' });
  });

  router.post('/login', (req, res) => {
    const { username, password } = req.body;
    const { changed, normalizedUsers } = normalizeUsers(readJSON(usersFile));
    if (changed) {
      writeJSON(usersFile, normalizedUsers);
    }
    const user = normalizedUsers.find(u => u.username === username && u.password === password);
    if (!user) return res.status(401).json({ message: 'Invalid credentials' });
    const token = jwt.sign({ username: user.username, role: user.role }, SECRET_KEY, { expiresIn: '1h' });
    res.json({ token, username: user.username, role: user.role });
  });

  return router;
}

module.exports = createAuthRouter;
