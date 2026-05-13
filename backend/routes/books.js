const express = require('express');

function createBooksRouter({ booksFile, readJSON, writeJSON, authenticateToken }) {
  const router = express.Router();

  router.get('/', (req, res) => {
    const sortBy = req.query.sortBy;
    const sortOrder = req.query.sortOrder === 'desc' ? 'desc' : 'asc';
    const books = readJSON(booksFile);

    if (!['title', 'author'].includes(sortBy)) {
      res.json(books);
      return;
    }

    const sortedBooks = [...books].sort((a, b) => a[sortBy].localeCompare(b[sortBy], undefined, { sensitivity: 'base' }));
    if (sortOrder === 'desc') {
      sortedBooks.reverse();
    }

    res.json(sortedBooks);
  });

  // POST /books removed: adding books is not allowed

  return router;
}

module.exports = createBooksRouter;
