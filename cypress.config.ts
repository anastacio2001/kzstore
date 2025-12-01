import { defineConfig } from 'cypress'

export default defineConfig({
  e2e: {
    baseUrl: 'http://localhost:3000',
    supportFile: 'cypress/support/e2e.js',
    specPattern: 'cypress/e2e/**/*.{spec.js,spec.ts,cy.js,cy.ts,js,ts}',
    video: false,
  },
})
