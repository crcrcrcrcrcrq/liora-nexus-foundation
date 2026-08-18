import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2.5 whitespace-nowrap rounded-sm text-xs font-normal uppercase cursor-pointer select-none transition-[color,background-color,border-color,box-shadow,transform,opacity] duration-500 ease-[var(--ease-luxe)] outline-none focus-visible:ring-1 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background hover:-translate-y-px active:translate-y-0 active:duration-150 motion-reduce:transform-none disabled:pointer-events-none disabled:opacity-40 disabled:cursor-not-allowed [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-gold text-gold-foreground hover:bg-gold-soft active:bg-gold",
        gold: "bg-gold text-gold-foreground shadow-[var(--shadow-gold)] hover:bg-gold-soft hover:shadow-[0_26px_70px_-28px_oklch(0.742_0.072_83/45%)] active:bg-gold active:shadow-[var(--shadow-gold)]",
        outline:
          "border border-gold/40 text-gold hover:border-gold hover:bg-accent active:bg-accent/70",
        ghost: "text-foreground/70 hover:text-gold hover:bg-accent/40 active:bg-accent/60",
        secondary: "bg-secondary text-secondary-foreground hover:bg-accent active:bg-accent/80",
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        link: "text-gold underline-offset-8 hover:underline normal-case tracking-normal hover:translate-y-0",
      },
      size: {
        default: "h-11 px-7 tracking-[var(--tracking-luxe)]",
        sm: "h-9 px-5 tracking-[var(--tracking-luxe)]",
        lg: "h-14 min-h-11 px-9 text-[0.7rem] tracking-[var(--tracking-wide-luxe)] sm:px-11",
        icon: "h-11 w-11",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />
    );
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
