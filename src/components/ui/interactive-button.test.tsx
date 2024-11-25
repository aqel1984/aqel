import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import { InteractiveButton } from '../interactive-button';

jest.useFakeTimers();

describe('InteractiveButton', () => {
  afterEach(() => {
    jest.clearAllTimers();
  });

  it('renders with default text', () => {
    render(<InteractiveButton />);
    const button = screen.getByRole('button');
    expect(button).toHaveTextContent('Click me!');
  });

  it('changes text on click and reverts back', () => {
    render(<InteractiveButton />);
    const button = screen.getByRole('button');
    
    fireEvent.click(button);
    expect(button).toHaveTextContent('Thanks for clicking!');
    
    act(() => {
      jest.advanceTimersByTime(1000);
    });
    expect(button).toHaveTextContent('Click me!');
  });

  it('calls onClick handler when clicked', () => {
    const handleClick = jest.fn();
    render(<InteractiveButton onClick={handleClick} />);
    const button = screen.getByRole('button');
    
    fireEvent.click(button);
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('is disabled when clicked', () => {
    render(<InteractiveButton />);
    const button = screen.getByRole('button');
    
    fireEvent.click(button);
    expect(button).toBeDisabled();
    
    act(() => {
      jest.advanceTimersByTime(1000);
    });
    expect(button).not.toBeDisabled();
  });

  it('uses custom initial and clicked text', () => {
    render(<InteractiveButton initialText="Custom Initial" clickedText="Custom Clicked" />);
    const button = screen.getByRole('button');
    
    expect(button).toHaveTextContent('Custom Initial');
    
    fireEvent.click(button);
    expect(button).toHaveTextContent('Custom Clicked');
  });
});