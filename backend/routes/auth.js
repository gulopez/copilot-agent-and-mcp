const express = require('express');
const jwt = require('jsonwebtoken');

const DEFAULT_ROLE = 'member';
const VALID_ROLES = new Set(['member', 'administrator']);

function getUserRole(user) {
  return VALID_ROLES.has(user.role) ? user.role : DEFAULT_ROLE;
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
    const users = readJSON(usersFile);
    const userIndex = users.findIndex(u => u.username === username && u.password === password);
    const user = userIndex >= 0 ? users[userIndex] : null;
    if (!user) return res.status(401).json({ message: 'Invalid credentials' });

    const role = getUserRole(user);
    if (user.role !== role) {
      users[userIndex] = { ...user, role };
      writeJSON(usersFile, users);
    }

    const token = jwt.sign({ username: user.username, role }, SECRET_KEY, { expiresIn: '1h' });
    res.json({ token, username: user.username, role });
  });

  return router;
}

module.exports = createAuthRouter;
