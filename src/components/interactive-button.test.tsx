import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import { InteractiveButton } from './interactive-button';

jest.useFakeTimers();

describe('InteractiveButton', () => {
  afterEach(() => {
    jest.clearAllTimers();
  });

  it('renders with initial text', () => {
    render(<InteractiveButton />);
    expect(screen.getByRole('button')).toHaveTextContent('Click me!');
  });

  it('changes text when clicked', () => {
    render(<InteractiveButton />);
    const button = screen.getByRole('button');
    fireEvent.click(button);
    expect(button).toHaveTextContent('Thanks for clicking!');
  });

  it('changes style when clicked', () => {
    render(<InteractiveButton />);
    const button = screen.getByRole('button');
    
    fireEvent.click(button);
    expect(button).toHaveClass('bg-primary');
    expect(button).toHaveClass('text-primary-foreground');
    
    act(() => {
      jest.advanceTimersByTime(1000);
    });
    
    expect(button).not.toHaveClass('bg-primary');
    expect(button).not.toHaveClass('text-primary-foreground');
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

  it('calls onClick prop when clicked', () => {
    const onClickMock = jest.fn();
    render(<InteractiveButton onClick={onClickMock} />);
    const button = screen.getByRole('button');
    
    fireEvent.click(button);
    expect(onClickMock).toHaveBeenCalledTimes(1);
  });

  it('uses custom initial and clicked text', () => {
    render(<InteractiveButton initialText="Start" clickedText="Processing..." />);
    const button = screen.getByRole('button');
    
    expect(button).toHaveTextContent('Start');
    fireEvent.click(button);
    expect(button).toHaveTextContent('Processing...');
  });

  it('respects disabled prop', () => {
    render(<InteractiveButton disabled />);
    const button = screen.getByRole('button');
    expect(button).toBeDisabled();
  });

  it('applies custom className', () => {
    const customClass = 'custom-button';
    render(<InteractiveButton className={customClass} />);
    const button = screen.getByRole('button');
    expect(button).toHaveClass(customClass);
  });
});