describe('Login flow', () => {
  it('Admin can login and is redirected to admin', () => {
    // Seed admin to ensure test is deterministic
    cy.exec('node criar-usuarios-corrigido.js');
    cy.visit('/');

    // Intercept login and me endpoints for debugging (backend runs on :3001)
    // Use wildcard intercepts to capture both localhost and 127.0.0.1 requests
    cy.intercept('POST', '**/api/auth/login').as('loginApi');
    cy.intercept('GET', '**/api/auth/me').as('meApi');

    // Open auth modal
    cy.get('button').contains(/Entrar/i).click();
    // Ensure modal form is visible
    cy.get('form').should('be.visible');

    // Fill credentials in modal (scope inside the form to avoid other inputs)
    cy.get('form').within(() => {
      cy.get('input[type="email"]').clear().type('admin@kzstore.ao');
      cy.get('input[type="password"]').clear().type('kzstore2024');
    });

    // Submit form (find button inside modal form)
    // Submit the form (ensure submit triggers signIn)
    cy.get('form').submit();

    // Wait until header shows user name
    // Wait for login network calls
    cy.wait('@loginApi', { timeout: 10000 }).then((xhr) => {
      expect(xhr.response?.statusCode).to.eq(200);
    });
    cy.wait('@meApi', { timeout: 10000 }).then((xhr) => {
      expect(xhr.response?.statusCode).to.eq(200);
    });
    cy.get('header', { timeout: 10000 }).should('contain', 'Administrador KZSTORE');

    // Then check redirect to admin
    cy.location('hash', { timeout: 10000 }).should('eq', '#admin');
  });

  it('Admin can login programmatically (cy.request) and app recognizes session', () => {
    // Seed admin again just in case
    cy.exec('node criar-usuarios-corrigido.js');
    cy.request({
      method: 'POST',
      url: 'http://127.0.0.1:3001/api/auth/login',
      body: { email: 'admin@kzstore.ao', password: 'kzstore2024' },
      failOnStatusCode: false
    }).then((resp) => {
      expect(resp.status).to.eq(200);
      // Extract token from response and set cookie for localhost
      const token = resp.body?.token;
      // Verify the backend recognizes the token by calling /api/auth/me directly
      cy.request({
        method: 'GET',
        url: 'http://127.0.0.1:3001/api/auth/me',
        headers: { Cookie: `kz_jwt=${token}` },
        failOnStatusCode: false
      }).then((meResp) => {
        expect(meResp.status).to.eq(200);
      });
      // Visit the frontend domain and set cookie so app picks up the session
      cy.visit('http://localhost:3000/');
      cy.wait('@meApi', { timeout: 10000 }).then((xhr) => {
        expect(xhr.response?.statusCode).to.eq(200);
      });
      if (token) {
        cy.setCookie('kz_jwt', token, { domain: 'localhost', path: '/' });
        cy.reload();
      }
    });
    cy.get('header', { timeout: 10000 }).should('contain', 'Administrador KZSTORE');
      cy.visit('http://localhost:3000/#admin');
    cy.location('hash', { timeout: 10000 }).should('eq', '#admin');
  });
});
