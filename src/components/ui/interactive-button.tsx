import React, { useState } from 'react';

interface InteractiveButtonProps {
  initialText?: string;
  clickedText?: string;
  onClick?: () => void;
  className?: string;
  disabled?: boolean;
  type?: 'button' | 'submit' | 'reset';
  variant?: string;
  children?: React.ReactNode;
}

const InteractiveButton: React.FC<InteractiveButtonProps> = ({
  initialText = 'Click me!',
  clickedText = 'Thanks for clicking!',
  onClick,
  className = '',
  disabled = false,
  type = 'button',
  variant,
  children,
}) => {
  const [text, setText] = useState(children || initialText);
  const [clicked, setClicked] = useState(false);

  const handleClick = () => {
    if (onClick) {
      onClick();
    }
    setText(clickedText);
    setClicked(true);
    setTimeout(() => {
      setText(children || initialText);
      setClicked(false);
    }, 1000);
  };

  const buttonClassName = `inline-flex items-center justify-center text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 h-10 ${
    variant === 'outline' 
      ? 'border-2 border-blue-500 text-blue-500 hover:bg-blue-50' 
      : 'bg-blue-500 text-white hover:bg-blue-600'
  } ${clicked ? 'opacity-75' : ''} ${className}`;

  return (
    <button
      type={type}
      className={buttonClassName}
      onClick={handleClick}
      disabled={disabled || clicked}
    >
      {text}
    </button>
  );
};

export default InteractiveButton;