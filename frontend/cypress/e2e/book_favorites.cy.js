describe('Book Favorites App', () => {
  // generate a random username and password for the e2e tests
  const username = `e2euser${Math.floor(Math.random() * 1000)}`;
  const password = `e2epass${Math.floor(Math.random() * 1000)}`;
  const user = { username, password };
  const ensureUserExists = () => {
    cy.request({
      method: 'POST',
      url: 'http://localhost:4000/api/register',
      body: user,
      failOnStatusCode: false,
    }).its('status').should('be.oneOf', [201, 409]);
  };

  beforeEach(() => {
    cy.visit('http://localhost:5173');
  });

  it('should allow a new user to register and login', () => {
    cy.contains('Create Account').click();
    cy.get('input[name="username"]').type(user.username);
    cy.get('input[name="password"]').type(user.password);
    cy.get('button#register').click();
    cy.contains('Registration successful! You can now log in.').should('exist');
    cy.url({ timeout: 5000 }).should('include', '/login');
    cy.get('input[name="username"]').type(user.username);
    cy.get('input[name="password"]').type(user.password);
    cy.get('button#login').click();
    cy.contains(`Hi, ${user.username}`).should('exist');
    cy.contains('Member').should('exist');
    cy.contains('Favorites').should('exist');
    cy.reload();
    cy.contains(`Hi, ${user.username}`).should('exist');
    cy.contains('Member').should('exist');
  });

  it('should show books and allow adding to favorites', () => {
    ensureUserExists();
    // Login first
    cy.contains('Login').click();
    cy.get('input[name="username"]').type(user.username);
    cy.get('input[name="password"]').type(user.password);
    cy.get('button#login').click();
    cy.contains('Books').click();
    cy.contains('h2', 'Books').should('exist');
    cy.get('button').contains('Add to Favorites').first().click();
    cy.get('a#favorites-link').click();
    cy.get('h2').contains('My Favorite Books').should('exist');
    cy.get('ul li').first().then($item => {
      const title = $item.find('strong').text();
      cy.wrap($item).contains('button', 'Remove from Favorites').click();
      cy.contains('strong', title).should('not.exist');
      cy.reload();
      cy.get('h2').contains('My Favorite Books').should('exist');
      cy.contains('strong', title).should('not.exist');
    });
  });

  it('should logout and protect routes', () => {
    ensureUserExists();
    // Login first
    cy.contains('Login').click();
    cy.get('input[name="username"]').type(user.username);
    cy.get('input[name="password"]').type(user.password);
    cy.get('button#login').click();
    cy.get('button#logout').click();
    cy.contains('Login').should('exist');
    cy.visit('http://localhost:5173/books');
    cy.url().should('eq', 'http://localhost:5173/');
  });
});
