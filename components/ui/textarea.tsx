import { forwardRef, type TextareaHTMLAttributes } from "react";
import { clsx } from "clsx";

type TextAreaProps = TextareaHTMLAttributes<HTMLTextAreaElement> & {
  label?: string;
  error?: string;
};

export const TextArea = forwardRef<HTMLTextAreaElement, TextAreaProps>(
  ({ className, label, error, ...props }, ref) => (
    <label className="flex flex-col gap-1 text-sm text-slate-600">
      {label && <span className="font-medium text-slate-700">{label}</span>}
      <textarea
        ref={ref}
        className={clsx(
          "min-h-[120px] rounded-md border border-slate-200 bg-white px-3 py-2 text-slate-900 shadow-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-200",
          error && "border-red-400",
          className
        )}
        {...props}
      />
      {error && <span className="text-xs text-red-500">{error}</span>}
    </label>
  )
);

TextArea.displayName = "TextArea";
