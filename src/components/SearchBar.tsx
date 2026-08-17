"use client";

type SearchBarProps = {
  value: string;
  onChange: (value: string) => void;
};

export default function SearchBar({ value, onChange }: SearchBarProps) {
  return (
    <div className="relative">
      <svg
        className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-dark/60"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M21 21l-4.35-4.35M11 19a8 8 0 100-16 8 8 0 000 16z"
        />
      </svg>
      <input
        type="text"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder="Qual o seu problema? Ex: papel preso na impressora..."
        className="w-full rounded-lg border border-gray-base/30 bg-white py-3 pl-12 pr-4 text-sm text-gray-text placeholder:text-gray-dark/50 outline-none focus:border-orange-base focus:ring-1 focus:ring-orange-base transition-colors"
      />
    </div>
  );
}
