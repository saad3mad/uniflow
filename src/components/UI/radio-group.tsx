"use client";
import * as React from "react";

type RadioGroupContextType = {
  value?: string;
  onValueChange?: (v: string) => void;
  name: string;
};

const RadioGroupContext = React.createContext<RadioGroupContextType | null>(null);

export type RadioGroupProps = {
  value?: string;
  defaultValue?: string;
  onValueChange?: (v: string) => void;
  name?: string;
  className?: string;
  children: React.ReactNode;
};

export function RadioGroup({
  value,
  defaultValue,
  onValueChange,
  name,
  className = "",
  children,
}: RadioGroupProps) {
  const [internal, setInternal] = React.useState<string | undefined>(defaultValue);
  const isControlled = value !== undefined;
  const current = isControlled ? value : internal;

  const handleChange = (v: string) => {
    if (!isControlled) setInternal(v);
    onValueChange?.(v);
  };

  const contextValue = React.useMemo(
    () => ({ value: current, onValueChange: handleChange, name: name || `rg-${Math.random().toString(36).slice(2)}` }),
    [current, name]
  );

  return (
    <RadioGroupContext.Provider value={contextValue}>
      <div className={className} role="radiogroup">{children}</div>
    </RadioGroupContext.Provider>
  );
}

export type RadioGroupItemProps = Omit<React.InputHTMLAttributes<HTMLInputElement>, "type" | "onChange"> & {
  value: string;
};

export const RadioGroupItem = React.forwardRef<HTMLInputElement, RadioGroupItemProps>(
  ({ className = "", value, id, ...props }, ref) => {
    const ctx = React.useContext(RadioGroupContext);
    const checked = ctx?.value === value;
    const base = "h-4 w-4 rounded-full border border-border text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50";

    return (
      <input
        ref={ref}
        id={id}
        type="radio"
        name={ctx?.name}
        value={value}
        checked={checked}
        onChange={() => ctx?.onValueChange?.(value)}
        className={`${base} ${className}`}
        {...props}
      />
    );
  }
);
RadioGroupItem.displayName = "RadioGroupItem";
