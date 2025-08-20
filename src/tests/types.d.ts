declare module 'jest-axe' {
  import { AxeResults } from 'axe-core';
  // Using unknown for generic options to avoid any
  export function axe(
    container: Element | DocumentFragment,
    options?: Record<string, unknown>
  ): Promise<AxeResults>;
  export const toHaveNoViolations: () => void;
}
