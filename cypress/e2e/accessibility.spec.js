describe('Accessibility Tests', () => {
  beforeEach(() => {
    // Inject axe-core before each test
    cy.visit('/')
    cy.injectAxe()
  })

  it('Homepage should pass accessibility checks', () => {
    cy.checkA11y(null, {
      runOnly: {
        type: 'tag',
        values: ['wcag2a', 'wcag2aa']
      }
    })
  })

  it('Checkout page should pass accessibility checks', () => {
    cy.visit('/checkout')
    cy.injectAxe()
    cy.checkA11y()
  })

  it('Registry page should pass accessibility checks', () => {
    cy.visit('/registry')
    cy.injectAxe()
    cy.checkA11y()
  })

  it('Product listing should pass accessibility checks', () => {
    cy.visit('/products')
    cy.injectAxe()
    cy.checkA11y()
  })

  it('Seller dashboard should pass accessibility checks', () => {
    // TODO: Add login step
    cy.visit('/seller/dashboard')
    cy.injectAxe()
    cy.checkA11y()
  })
})
