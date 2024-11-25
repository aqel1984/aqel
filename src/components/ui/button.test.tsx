import React from 'react';
import { render, screen } from '@testing-library/react';
import { Button, buttonVariants } from './button';
import { Slot } from "@radix-ui/react-slot";

// Mock Radix UI Slot
jest.mock('@radix-ui/react-slot', () => ({
  Slot: jest.fn().mockImplementation(({ children, className, ...props }) => (
    <div data-testid="slot" className={className} {...props}>
      {children}
    </div>
  )),
}));

describe('Button', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders as a button by default', () => {
    render(<Button>Click me</Button>);
    const button = screen.getByRole('button', { name: /click me/i });
    expect(button.tagName).toBe('BUTTON');
  });

  it('renders as a slot when asChild is true', () => {
    render(<Button asChild>Click me</Button>);
    expect(screen.getByTestId('slot')).toBeInTheDocument();
    expect(Slot).toHaveBeenCalled();
  });

  it('forwards ref correctly', () => {
    const ref = React.createRef<HTMLButtonElement>();
    render(<Button ref={ref}>Click me</Button>);
    expect(ref.current).toBeInstanceOf(HTMLButtonElement);
  });

  it('applies default variant and size classes', () => {
    render(<Button>Click me</Button>);
    const button = screen.getByRole('button');
    expect(button).toHaveClass(
      'bg-primary',
      'text-primary-foreground',
      'hover:bg-primary/90',
      'h-10',
      'px-4',
      'py-2'
    );
  });

  describe('variants', () => {
    const variants = [
      'default',
      'destructive',
      'outline',
      'secondary',
      'ghost',
      'link',
      'primary'
    ] as const;

    variants.forEach((variant) => {
      it(`applies correct classes for ${variant} variant`, () => {
        render(<Button variant={variant}>Click me</Button>);
        const button = screen.getByRole('button');
        const variantClasses = buttonVariants({ variant });
        expect(button).toHaveClass(...variantClasses.split(' '));
      });
    });
  });

  describe('sizes', () => {
    const sizes = ['default', 'sm', 'lg', 'icon'] as const;

    sizes.forEach((size) => {
      it(`applies correct classes for ${size} size`, () => {
        render(<Button size={size}>Click me</Button>);
        const button = screen.getByRole('button');
        const sizeClasses = buttonVariants({ size });
        expect(button).toHaveClass(...sizeClasses.split(' '));
      });
    });
  });

  it('combines variant and size classes correctly', () => {
    render(<Button variant="outline" size="lg">Click me</Button>);
    const button = screen.getByRole('button');
    const classes = buttonVariants({ variant: 'outline', size: 'lg' });
    expect(button).toHaveClass(...classes.split(' '));
  });

  it('applies additional className correctly', () => {
    render(<Button className="custom-class">Click me</Button>);
    const button = screen.getByRole('button');
    expect(button).toHaveClass('custom-class');
  });

  it('handles disabled state correctly', () => {
    render(<Button disabled>Click me</Button>);
    const button = screen.getByRole('button');
    expect(button).toBeDisabled();
    expect(button).toHaveClass('disabled:pointer-events-none', 'disabled:opacity-50');
  });

  it('spreads additional props correctly', () => {
    render(<Button data-testid="test-button" aria-label="Test Button">Click me</Button>);
    const button = screen.getByTestId('test-button');
    expect(button).toHaveAttribute('aria-label', 'Test Button');
  });
});
