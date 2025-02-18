/// <reference types="cypress" />
/// <reference types="cypress-axe" />

import 'cypress-axe'

Cypress.Commands.add('checkA11y', (
  context?: string | Node,
  options?: Partial<CypressAxe.Options>,
  violationCallback?: (violations: CypressAxe.Result[]) => void,
  skipFailures?: boolean
): void => {
  cy.injectAxe()
  cy.checkA11y(
    context,
    {
      runOnly: {
        type: 'tag',
        values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'best-practice']
      },
      ...options
    },
    violationCallback,
    skipFailures
  )
})

// Log accessibility violations to console
function terminalLog(violations: CypressAxe.Result[]): void {
  cy.task('log', `${violations.length} accessibility violation${
    violations.length === 1 ? '' : 's'
  } ${violations.length === 1 ? 'was' : 'were'} detected`)

  const violationData = violations.map(
    ({ id, impact, description, nodes }: CypressAxe.Result) => ({
      id,
      impact,
      description,
      nodes: nodes.length
    })
  )

  cy.task('table', violationData)
}

// Add command to check accessibility and log violations
Cypress.Commands.add('checkAccessibility', () => {
  cy.checkA11y(null, null, terminalLog)
})
