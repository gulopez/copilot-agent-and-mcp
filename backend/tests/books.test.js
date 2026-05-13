const request = require('supertest');
const express = require('express');
const createApiRouter = require('../routes');
const path = require('path');

const app = express();
app.use(express.json());
app.use('/api', createApiRouter({
  usersFile: path.join(__dirname, '../data/test-users.json'),
  booksFile: path.join(__dirname, '../data/test-books.json'),
  readJSON: (file) => require('fs').existsSync(file) ? JSON.parse(require('fs').readFileSync(file, 'utf-8')) : [],
  writeJSON: (file, data) => require('fs').writeFileSync(file, JSON.stringify(data, null, 2)),
  authenticateToken: (req, res, next) => next(), // No auth for books
  SECRET_KEY: 'test_secret',
}));

describe('Books API', () => {
  it('GET /api/books should return a list of books', async () => {
    const res = await request(app).get('/api/books');
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThan(0);
  });

  it('POST /api/books should not be allowed', async () => {
    const res = await request(app)
      .post('/api/books')
      .send({ title: 'Test Book', author: 'Test Author' });
    expect([404, 405]).toContain(res.statusCode);
  });

  it('GET /api/books should sort books by title in ascending order', async () => {
    const res = await request(app).get('/api/books?sortBy=title&sortOrder=asc');
    expect(res.statusCode).toBe(200);
    const titles = res.body.map(book => book.title);
    expect(titles).toEqual([...titles].sort((a, b) => a.localeCompare(b, undefined, { sensitivity: 'base' })));
  });

  it('GET /api/books should sort books by author in descending order', async () => {
    const res = await request(app).get('/api/books?sortBy=author&sortOrder=desc');
    expect(res.statusCode).toBe(200);
    const authors = res.body.map(book => book.author);
    expect(authors).toEqual([...authors].sort((a, b) => b.localeCompare(a, undefined, { sensitivity: 'base' })));
  });
});
