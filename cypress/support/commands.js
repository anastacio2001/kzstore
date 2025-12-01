// custom commands

// Command to seed admin user using the backend seed script
Cypress.Commands.add('seedAdmin', () => {
  cy.exec('node criar-usuarios-corrigido.js')
})
