import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest'; // 👈 import expect from Vitest

import App from './components/App';

describe('App component', () => {
  it('renders navbar', () => {
    render(<App />);
    const navElement = screen.getByRole('navigation');
    expect(navElement).toBeInTheDocument();
  });
});
