import React from 'react'
import { Button as ShadcnButton, ButtonProps as ShadcnButtonProps } from '@/components/ui/button'

export interface ButtonProps extends ShadcnButtonProps {
  children: React.ReactNode;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ children, ...props }, ref) => {
    return (
      <ShadcnButton ref={ref} {...props}>
        {children}
      </ShadcnButton>
    )
  }
)

Button.displayName = 'Button'

export default Button