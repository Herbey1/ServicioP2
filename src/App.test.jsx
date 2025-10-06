import { render, screen } from '@testing-library/react';
import App from './App';

test('renders login header', () => {
  render(<App />);
  const heading = screen.getByText(/sistema de gestión de comisiones académicas/i);
  expect(heading).toBeInTheDocument();
});
