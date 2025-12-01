// custom commands
import '@testing-library/cypress/add-commands'

// Command to seed admin user using the backend seed script
Cypress.Commands.add('seedAdmin', () => {
  cy.task('node', 'node criar-usuarios-corrigido.js')
})
