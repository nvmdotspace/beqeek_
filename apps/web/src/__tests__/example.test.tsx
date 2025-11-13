import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';

// Simple component for testing
function TestComponent() {
  return <div>Hello Vitest</div>;
}

describe('Example Test Suite', () => {
  it('should render correctly', () => {
    render(<TestComponent />);
    expect(screen.getByText('Hello Vitest')).toBeInTheDocument();
  });

  it('should perform basic assertions', () => {
    expect(1 + 1).toBe(2);
    expect('vitest').toContain('test');
  });
});
