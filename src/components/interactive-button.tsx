import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';

interface InteractiveButtonProps {
  initialText?: string;
  clickedText?: string;
  onClick?: () => void;
  className?: string;
  disabled?: boolean;
}

export const InteractiveButton: React.FC<InteractiveButtonProps> = ({
  initialText = 'Click me!',
  clickedText = 'Thanks for clicking!',
  onClick,
  className = '',
  disabled = false,
}) => {
  const [isClicked, setIsClicked] = useState(false);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isClicked) {
      timer = setTimeout(() => {
        setIsClicked(false);
      }, 1000);
    }
    return () => clearTimeout(timer);
  }, [isClicked]);

  const handleClick = () => {
    if (disabled) return;
    setIsClicked(true);
    onClick?.();
  };

  return (
    <Button
      onClick={handleClick}
      className={`transition-all duration-300 ease-in-out ${
        isClicked ? 'bg-primary text-primary-foreground' : ''
      } ${className}`}
      disabled={disabled || isClicked}
    >
      {isClicked ? clickedText : initialText}
    </Button>
  );
};