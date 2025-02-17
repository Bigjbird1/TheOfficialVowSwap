// cypress/e2e/userFlows.spec.js
describe('Critical User Flows', () => {
  beforeEach(() => {
    // Assuming the app is running at http://localhost:3000
    cy.visit('/');
  });

  it('should allow a user to sign up successfully', () => {
    // Navigate to the sign-up page
    cy.get('a[href*="signup"]').click();
    // Fill in the sign-up form (adjust selectors as needed)
    cy.get('input[name="email"]').type('testuser@example.com');
    cy.get('input[name="password"]').type('password123');
    cy.get('form').submit();
    // Verify sign-up success (text may change based on implementation)
    cy.contains('Welcome').should('exist');
  });

  it('should allow a user to place an order', () => {
    // Navigate to products page, add a product to the cart, and complete checkout
    cy.get('a[href*="products"]').first().click();
    // Click on the "Add to Cart" button (adjust selector as needed)
    cy.contains('Add to Cart').click();
    // Go to the checkout page
    cy.get('a[href*="checkout"]').click();
    // Submit the checkout form to place the order
    cy.contains('Place Order').click();
    // Verify order confirmation
    cy.contains('Order Confirmed').should('exist');
  });

  it('should allow a seller to complete the onboarding process', () => {
    // Navigate directly to the seller onboarding page
    cy.visit('/seller/onboarding');
    // Fill in onboarding details (adjust selectors based on actual fields)
    cy.get('input[name="storeName"]').type('Test Store');
    // Submit the seller onboarding form
    cy.get('form').submit();
    // Verify that the onboarding succeeded (for example, dashboard is shown)
    cy.contains('Dashboard').should('exist');
  });
});
