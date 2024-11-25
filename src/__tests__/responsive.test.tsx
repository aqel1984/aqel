import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { useMediaQuery } from 'react-responsive';

jest.mock('react-responsive', () => ({
  useMediaQuery: jest.fn()
}));

const ResponsiveComponent = () => {
  const isDesktop = useMediaQuery({ minWidth: 768 });

  return (
    <>
      {isDesktop ? (
        <div className="hidden md:block">Desktop View</div>
      ) : (
        <div className="md:hidden">Mobile View</div>
      )}
    </>
  );
};

describe('Responsive Component', () => {
  it('renders correctly for desktop', () => {
    (useMediaQuery as jest.Mock).mockReturnValue(true);
    render(<ResponsiveComponent />);
    expect(screen.getByText('Desktop View')).toBeInTheDocument();
    expect(screen.queryByText('Mobile View')).not.toBeInTheDocument();
  });

  it('renders correctly for mobile', () => {
    (useMediaQuery as jest.Mock).mockReturnValue(false);
    render(<ResponsiveComponent />);
    expect(screen.getByText('Mobile View')).toBeInTheDocument();
    expect(screen.queryByText('Desktop View')).not.toBeInTheDocument();
  });
});