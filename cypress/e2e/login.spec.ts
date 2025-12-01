describe('Login flow', () => {
  it('Admin can login and is redirected to admin', () => {
    // Seed admin to ensure test is deterministic
    cy.exec('node criar-usuarios-corrigido.js');
    cy.visit('/');

    // Open auth modal
    cy.get('button').contains(/Entrar/i).click();

    // Fill credentials in modal
    cy.get('input[type="email"]').type('admin@kzstore.ao');
    cy.get('input[type="password"]').type('kzstore2024');

    // Submit form
    cy.get('button').contains(/^Entrar$/).click();

    // Wait for auth to resolve
    cy.wait(1000);

    // Expect header to show user's name
    cy.get('header').should('contain', 'Administrador KZSTORE');

    // If admin redirect to admin
    cy.location('hash').should('eq', '#admin');
  });
});
