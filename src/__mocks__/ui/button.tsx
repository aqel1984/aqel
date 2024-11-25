import React from 'react';

interface ButtonProps {
  children: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
  type?: 'button' | 'submit' | 'reset';
}

export const Button: React.FC<ButtonProps> = ({ children, onClick, disabled = false, type = 'button' }) => (
  <button onClick={onClick} disabled={disabled} type={type} aria-disabled={disabled}>
    {children}
  </button>
);