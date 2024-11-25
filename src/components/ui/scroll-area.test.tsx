import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ScrollArea, ScrollBar } from './scroll-area';

jest.mock('@radix-ui/react-scroll-area', () => ({
  Root: React.forwardRef(({ children, className }: any, ref: any) => (
    <div ref={ref} data-testid="scroll-area-root" className={className}>
      {children}
    </div>
  )),
  Viewport: React.forwardRef(({ children, className }: any, ref: any) => (
    <div ref={ref} data-testid="scroll-area-viewport" className={className}>
      {children}
    </div>
  )),
  ScrollAreaScrollbar: React.forwardRef(({ children, className, orientation }: any, ref: any) => (
    <div ref={ref} data-testid="scroll-area-scrollbar" className={className} data-orientation={orientation}>
      {children}
    </div>
  )),
  ScrollAreaThumb: React.forwardRef(({ className }: any, ref: any) => (
    <div ref={ref} data-testid="scroll-area-thumb" className={className} />
  )),
  Corner: () => <div data-testid="scroll-area-corner" />,
}));

describe('ScrollArea', () => {
  it('renders with default props', () => {
    render(
      <ScrollArea>
        <div>Content</div>
      </ScrollArea>
    );

    expect(screen.getByTestId('scroll-area-root')).toHaveClass('relative overflow-hidden');
    expect(screen.getByTestId('scroll-area-viewport')).toHaveClass('h-full w-full rounded-[inherit]');
    expect(screen.getByText('Content')).toBeInTheDocument();
    expect(screen.getByTestId('scroll-area-corner')).toBeInTheDocument();
  });

  it('applies custom className', () => {
    render(
      <ScrollArea className="custom-class">
        <div>Content</div>
      </ScrollArea>
    );

    expect(screen.getByTestId('scroll-area-root')).toHaveClass('custom-class');
  });

  it('forwards ref', () => {
    const ref = React.createRef<HTMLDivElement>();
    render(
      <ScrollArea ref={ref}>
        <div>Content</div>
      </ScrollArea>
    );

    expect(ref.current).toBeTruthy();
  });
});

describe('ScrollBar', () => {
  it('renders vertical scrollbar by default', () => {
    render(<ScrollBar />);

    const scrollbar = screen.getByTestId('scroll-area-scrollbar');
    expect(scrollbar).toHaveClass('flex touch-none select-none transition-colors');
    expect(scrollbar).toHaveClass('h-full w-2.5 border-l border-l-transparent p-[1px]');
    expect(scrollbar).toHaveAttribute('data-orientation', 'vertical');
  });

  it('renders horizontal scrollbar', () => {
    render(<ScrollBar orientation="horizontal" />);

    const scrollbar = screen.getByTestId('scroll-area-scrollbar');
    expect(scrollbar).toHaveClass('flex touch-none select-none transition-colors');
    expect(scrollbar).toHaveClass('h-2.5 border-t border-t-transparent p-[1px]');
    expect(scrollbar).toHaveAttribute('data-orientation', 'horizontal');
  });

  it('applies custom className', () => {
    render(<ScrollBar className="custom-class" />);

    expect(screen.getByTestId('scroll-area-scrollbar')).toHaveClass('custom-class');
  });

  it('renders thumb with correct styles', () => {
    render(<ScrollBar />);

    expect(screen.getByTestId('scroll-area-thumb')).toHaveClass('relative flex-1 rounded-full bg-border');
  });

  it('forwards ref', () => {
    const ref = React.createRef<HTMLDivElement>();
    render(<ScrollBar ref={ref} />);

    expect(ref.current).toBeTruthy();
  });
});
