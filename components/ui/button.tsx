import { forwardRef, type ButtonHTMLAttributes } from "react";
import { clsx } from "clsx";

const buttonVariants = {
  primary: "bg-brand-500 text-white hover:bg-brand-400",
  secondary: "border border-slate-200 text-slate-700 hover:bg-slate-100",
  subtle: "text-slate-600 hover:text-slate-900",
};

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: keyof typeof buttonVariants;
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", ...props }, ref) => (
    <button
      ref={ref}
      className={clsx(
        "inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-semibold transition focus:outline-none focus:ring-2 focus:ring-brand-400 focus:ring-offset-2",
        buttonVariants[variant],
        className
      )}
      {...props}
    />
  )
);

Button.displayName = "Button";
