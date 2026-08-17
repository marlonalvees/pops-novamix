type CategoryFilterProps = {
  categorias: string[];
  selecionada: string | null;
  onSelect: (categoria: string | null) => void;
};

export default function CategoryFilter({
  categorias,
  selecionada,
  onSelect,
}: CategoryFilterProps) {
  return (
    <div className="flex flex-wrap gap-2">
      <button
        type="button"
        onClick={() => onSelect(null)}
        className={`rounded-full px-3 py-1.5 text-sm font-medium transition-colors ${
          selecionada === null
            ? "bg-orange-base text-white"
            : "bg-white text-gray-dark border border-gray-base/30 hover:border-orange-base"
        }`}
      >
        Todos
      </button>

      {categorias.map((categoria) => (
        <button
          key={categoria}
          type="button"
          onClick={() => onSelect(categoria)}
          className={`rounded-full px-3 py-1.5 text-sm font-medium transition-colors ${
            selecionada === categoria
              ? "bg-orange-base text-white"
              : "bg-white text-gray-dark border border-gray-base/30 hover:border-orange-base"
          }`}
        >
          {categoria}
        </button>
      ))}
    </div>
  );
}
