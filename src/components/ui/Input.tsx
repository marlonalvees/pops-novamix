import type { InputHTMLAttributes } from "react";

type InputProps = InputHTMLAttributes<HTMLInputElement>;

export default function Input({ className = "", ...props }: InputProps) {
  return (
    <input
      className={`w-full rounded-md border border-gray-base bg-white px-3 py-2 text-sm text-gray-text outline-none focus:border-orange-base focus:ring-1 focus:ring-orange-base ${className}`}
      {...props}
    />
  );
}
