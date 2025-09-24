"use client";
import * as React from "react";

export interface LabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {}

export const Label = React.forwardRef<HTMLLabelElement, LabelProps>(
  ({ className = "", ...props }, ref) => {
    const base = "text-sm font-medium text-text-secondary";
    return <label ref={ref} className={`${base} ${className}`} {...props} />;
  }
);
Label.displayName = "Label";

export default Label;
