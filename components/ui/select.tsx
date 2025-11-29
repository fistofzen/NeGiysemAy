import { forwardRef, type SelectHTMLAttributes } from "react";
import { clsx } from "clsx";

type Option = { label: string; value: string };

type SelectProps = SelectHTMLAttributes<HTMLSelectElement> & {
  label?: string;
  error?: string;
  options: Option[];
};

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, options, className, ...props }, ref) => (
    <label className="flex flex-col gap-1 text-sm text-slate-600">
      {label && <span className="font-medium text-slate-700">{label}</span>}
      <select
        ref={ref}
        className={clsx(
          "rounded-md border border-slate-200 bg-white px-3 py-2 text-slate-900 shadow-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-200",
          error && "border-red-400",
          className
        )}
        {...props}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error && <span className="text-xs text-red-500">{error}</span>}
    </label>
  )
);

Select.displayName = "Select";
