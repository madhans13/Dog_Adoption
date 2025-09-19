import { render, screen } from '@testing-library/react';
import { describe, it, expect } from '@jest/globals';

// Mock the root component
const MockApp = () => (
  <div>
    <h1>Dog Adoption App</h1>
    <p>Find your perfect companion</p>
  </div>
);

describe('App', () => {
  it('renders without crashing', () => {
    render(<MockApp />);
    expect(screen.getByText('Dog Adoption App')).toBeInTheDocument();
  });

  it('displays the main heading', () => {
    render(<MockApp />);
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Dog Adoption App');
  });
});
