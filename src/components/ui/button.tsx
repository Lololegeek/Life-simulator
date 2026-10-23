import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

export const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full text-sm font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-40 active:translate-y-px',
  {
    variants: {
      variant: {
        default: 'bg-foreground text-background hover:bg-foreground/85',
        primary: 'bg-primary text-primary-foreground hover:brightness-110',
        secondary: 'bg-muted text-foreground hover:bg-foreground/10',
        outline: 'border border-foreground/20 bg-transparent hover:border-foreground/50 hover:bg-foreground/5',
        ghost: 'hover:bg-foreground/5',
        danger: 'bg-danger text-danger-foreground hover:brightness-110',
        success: 'bg-success text-white hover:brightness-110',
      },
      size: {
        sm: 'h-8 px-3 text-xs',
        md: 'h-10 px-4',
        lg: 'h-12 px-6 text-base',
        xl: 'h-16 px-8 text-lg',
        icon: 'h-10 w-10',
      },
    },
    defaultVariants: { variant: 'default', size: 'md' },
  },
);

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(({ className, variant, size, ...props }, ref) => (
  <button ref={ref} className={cn(buttonVariants({ variant, size }), className)} {...props} />
));
Button.displayName = 'Button';
