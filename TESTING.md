# Testing Documentation

## Overview

VowSwap implements a comprehensive testing strategy including:
- Unit tests for individual components and functions
- Integration tests for API endpoints and service interactions
- End-to-end tests for critical user flows
- Accessibility testing (WCAG compliance)
- Visual regression testing
- Performance and load testing

## Running Tests

### Unit & Integration Tests
```bash
# Run all unit tests
npm run test:unit

# Run all integration tests
npm run test:integration

# Run tests in watch mode during development
npm run test:watch

# Generate coverage report
npm run test:coverage
```

### End-to-End Tests
```bash
# Run all E2E tests
npm run test:e2e

# Run accessibility tests only
npm run test:a11y

# Run visual regression tests
npm run test:visual
```

### Performance Tests
```bash
# Run Lighthouse performance audits
npm run test:perf

# Run load tests (all scenarios)
npm run test:load

# Run specific load test scenarios
npm run test:load:checkout    # Test checkout flow
npm run test:load:realtime    # Test real-time features
```

### CI/CD Pipeline
```bash
# Run all tests (used in CI)
npm run test:ci
```

## Test Coverage Requirements

- Unit Tests: Minimum 70% coverage for all new code
- Integration Tests: All API endpoints must have test coverage
- E2E Tests: All critical user flows must have test coverage
- Accessibility: Must meet WCAG 2.1 AA standards
- Performance: 
  - Lighthouse score > 90
  - Page load < 3s
  - Time to Interactive < 5s

## Testing Stack

### Unit & Integration Testing
- Jest
- React Testing Library
- MSW (Mock Service Worker) for API mocking

### E2E Testing
- Cypress
- Cypress-axe for accessibility testing
- Percy for visual regression testing

### Performance Testing
- Lighthouse for performance auditing
- k6 for load testing

## Key Test Files

```
├── tests/
│   ├── unit/               # Unit tests
│   ├── integration/        # Integration tests
│   └── performance/        # Performance & load tests
│       ├── lighthouse.js   # Lighthouse performance tests
│       └── load-test.js    # k6 load tests
├── cypress/
│   ├── e2e/               # E2E test specs
│   │   ├── userFlows.spec.js
│   │   └── accessibility.spec.js
│   └── support/           # Cypress support files
└── percy.config.js        # Percy configuration
```

## Best Practices

### Writing Tests

1. **Unit Tests**
   - Test one thing per test
   - Use meaningful test descriptions
   - Follow AAA pattern (Arrange, Act, Assert)
   - Mock external dependencies

2. **Integration Tests**
   - Focus on testing service interactions
   - Use realistic test data
   - Test error cases and edge conditions

3. **E2E Tests**
   - Focus on critical user flows
   - Keep tests independent
   - Clean up test data after each run

### Accessibility Testing

- Run accessibility tests on all new components
- Fix all WCAG 2.1 AA violations
- Test with screen readers
- Ensure keyboard navigation works

### Performance Testing

- Run performance tests before and after significant changes
- Monitor trends in performance metrics
- Set performance budgets for key metrics
- Test under realistic network conditions

## Adding New Tests

### Unit Tests
```javascript
import { render, screen } from '@testing-library/react'
import YourComponent from './YourComponent'

describe('YourComponent', () => {
  it('should render correctly', () => {
    render(<YourComponent />)
    expect(screen.getByRole('button')).toBeInTheDocument()
  })
})
```

### E2E Tests
```javascript
describe('Critical Flow', () => {
  it('should complete successfully', () => {
    cy.visit('/')
    cy.get('[data-testid="start-button"]').click()
    cy.url().should('include', '/next-step')
  })
})
```

### Load Tests
```javascript
import http from 'k6/http'
import { check } from 'k6'

export const options = {
  vus: 10,
  duration: '30s',
}

export default function() {
  const res = http.get('http://localhost:3000/api/endpoint')
  check(res, {
    'status is 200': (r) => r.status === 200,
  })
}
```

## Troubleshooting

### Common Issues

1. **Flaky Tests**
   - Add retry logic for network requests
   - Increase timeouts for async operations
   - Ensure proper test isolation

2. **Performance Test Failures**
   - Check for memory leaks
   - Monitor CPU/Memory usage
   - Verify test environment resources

3. **Visual Regression Failures**
   - Review Percy snapshots
   - Check for intended UI changes
   - Update baseline if changes are approved

### Getting Help

- Check the test output and logs
- Review test documentation
- Consult with the team lead
- File an issue with reproducible steps
