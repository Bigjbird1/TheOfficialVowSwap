describe('Authentication Flows', () => {
  beforeEach(() => {
    // Clear local storage and cookies before each test
    cy.clearLocalStorage();
    cy.clearCookies();
    cy.visit('/');
  });

  describe('Sign Up Flow', () => {
    it('should allow a user to sign up successfully', () => {
      // Generate unique email for test
      const testEmail = `test${Date.now()}@example.com`;
      
      // Navigate to sign-up page
      cy.get('a[href*="signup"]').click();
      
      // Fill in the sign-up form
      cy.get('input[name="firstName"]').type('Test');
      cy.get('input[name="lastName"]').type('User');
      cy.get('input[name="email"]').type(testEmail);
      cy.get('input[name="password"]').type('Test123!');
      
      // Submit form
      cy.get('form').submit();
      
      // Verify redirect to email verification page
      cy.url().should('include', '/auth/verify-email');
      cy.contains('verification email').should('exist');
    });

    it('should show validation errors for invalid inputs', () => {
      cy.get('a[href*="signup"]').click();
      
      // Submit empty form
      cy.get('form').submit();
      
      // Check validation messages
      cy.contains('First name must be at least 2 characters').should('exist');
      cy.contains('Last name must be at least 2 characters').should('exist');
      cy.contains('Please enter a valid email').should('exist');
      cy.contains('Password must be 8+ characters').should('exist');
    });

    it('should handle duplicate email registration', () => {
      const testEmail = `test${Date.now()}@example.com`;
      
      // First registration
      cy.get('a[href*="signup"]').click();
      cy.get('input[name="firstName"]').type('Test');
      cy.get('input[name="lastName"]').type('User');
      cy.get('input[name="email"]').type(testEmail);
      cy.get('input[name="password"]').type('Test123!');
      cy.get('form').submit();
      
      // Try registering again with same email
      cy.clearLocalStorage();
      cy.clearCookies();
      cy.visit('/');
      cy.get('a[href*="signup"]').click();
      cy.get('input[name="firstName"]').type('Test');
      cy.get('input[name="lastName"]').type('User');
      cy.get('input[name="email"]').type(testEmail);
      cy.get('input[name="password"]').type('Test123!');
      cy.get('form').submit();
      
      // Verify error message
      cy.contains('account with this email already exists').should('exist');
    });
  });

  describe('Sign In Flow', () => {
    const testEmail = `test${Date.now()}@example.com`;
    const testPassword = 'Test123!';

    beforeEach(() => {
      // Create test account before each test
      cy.get('a[href*="signup"]').click();
      cy.get('input[name="firstName"]').type('Test');
      cy.get('input[name="lastName"]').type('User');
      cy.get('input[name="email"]').type(testEmail);
      cy.get('input[name="password"]').type(testPassword);
      cy.get('form').submit();
      cy.clearLocalStorage();
      cy.clearCookies();
      cy.visit('/');
    });

    it('should allow user to sign in with correct credentials', () => {
      cy.get('a[href*="signin"]').click();
      cy.get('input[name="email"]').type(testEmail);
      cy.get('input[name="password"]').type(testPassword);
      cy.get('form').submit();
      
      // Verify successful login
      cy.url().should('include', '/dashboard');
    });

    it('should show error for incorrect password', () => {
      cy.get('a[href*="signin"]').click();
      cy.get('input[name="email"]').type(testEmail);
      cy.get('input[name="password"]').type('wrongpassword');
      cy.get('form').submit();
      
      // Verify error message
      cy.contains('Invalid credentials').should('exist');
    });

    it('should implement lockout after multiple failed attempts', () => {
      cy.get('a[href*="signin"]').click();
      
      // Attempt multiple failed logins
      for (let i = 0; i < 5; i++) {
        cy.get('input[name="email"]').type(testEmail);
        cy.get('input[name="password"]').type('wrongpassword');
        cy.get('form').submit();
        cy.get('input[name="email"]').clear();
        cy.get('input[name="password"]').clear();
      }
      
      // Verify lockout message
      cy.contains('Account locked').should('exist');
    });
  });

  describe('Protected Routes', () => {
    it('should redirect to login when accessing protected routes', () => {
      // Try accessing protected routes without auth
      cy.visit('/dashboard');
      cy.url().should('include', '/auth/signin');
      
      cy.visit('/orders');
      cy.url().should('include', '/auth/signin');
      
      cy.visit('/seller/dashboard');
      cy.url().should('include', '/auth/signin');
    });
  });

  describe('Session Management', () => {
    const testEmail = `test${Date.now()}@example.com`;
    const testPassword = 'Test123!';

    beforeEach(() => {
      // Create and sign in as test user
      cy.get('a[href*="signup"]').click();
      cy.get('input[name="firstName"]').type('Test');
      cy.get('input[name="lastName"]').type('User');
      cy.get('input[name="email"]').type(testEmail);
      cy.get('input[name="password"]').type(testPassword);
      cy.get('form').submit();
      
      cy.get('a[href*="signin"]').click();
      cy.get('input[name="email"]').type(testEmail);
      cy.get('input[name="password"]').type(testPassword);
      cy.get('form').submit();
    });

    it('should maintain session across page refreshes', () => {
      cy.visit('/dashboard');
      cy.reload();
      cy.url().should('include', '/dashboard');
    });

    it('should clear session on logout', () => {
      cy.get('[data-testid="logout-button"]').click();
      cy.url().should('eq', Cypress.config().baseUrl + '/');
      
      // Verify protected route access is blocked
      cy.visit('/dashboard');
      cy.url().should('include', '/auth/signin');
    });
  });
});
