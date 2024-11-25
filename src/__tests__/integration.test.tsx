import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';

interface TestComponentProps {
  text: string;
}

const TestComponent: React.FC<TestComponentProps> = ({ text }) => <div>{text}</div>;

describe('Integration Test', () => {
  it('renders TestComponent with correct text', () => {
    render(<TestComponent text="Hello, World!" />);
    expect(screen.getByText('Hello, World!')).toBeInTheDocument();
  });
});