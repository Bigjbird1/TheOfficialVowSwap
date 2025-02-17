import React from 'react';
import { render, RenderOptions, RenderResult } from '@testing-library/react';
import { screen, fireEvent, waitFor } from '@testing-library/dom';
import '@testing-library/jest-dom';
import type { queries, Queries } from '@testing-library/dom';

// Add custom render function if needed for providers
const customRender = <
  Q extends Queries = typeof queries,
  Container extends Element | DocumentFragment = HTMLElement
>(
  ui: React.ReactElement,
  options: Omit<RenderOptions<Q, Container>, 'wrapper'> = {}
): RenderResult<Q, Container> => {
  return render(ui, {
    // wrap provider(s) here if needed
    ...options,
  });
};

// Re-export everything
export * from '@testing-library/react';
export { customRender as render, screen, fireEvent, waitFor };
