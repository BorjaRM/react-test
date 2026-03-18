interface CategoryFilterProps {
  categories: string[];
  selectedCategory: string | null;
  onSelectCategory: (category: string | null) => void;
}

const BASE_BUTTON_CLASSES =
  "rounded-full px-4 py-2 text-sm font-medium transition-colors";
const ACTIVE_CLASSES = "bg-gray-900 text-white";
const INACTIVE_CLASSES = "bg-gray-100 text-gray-700 hover:bg-gray-200";

export function CategoryFilter({
  categories,
  selectedCategory,
  onSelectCategory,
}: CategoryFilterProps) {
  return (
    <nav aria-label="Filtro de categorías" className="flex flex-wrap gap-2">
      <button
        type="button"
        aria-pressed={selectedCategory === null}
        onClick={() => onSelectCategory(null)}
        className={`${BASE_BUTTON_CLASSES} ${
          selectedCategory === null ? ACTIVE_CLASSES : INACTIVE_CLASSES
        }`}
      >
        Todas
      </button>
      {categories.map((category) => (
        <button
          key={category}
          type="button"
          aria-pressed={selectedCategory === category}
          onClick={() => onSelectCategory(category)}
          className={`${BASE_BUTTON_CLASSES} capitalize ${
            selectedCategory === category ? ACTIVE_CLASSES : INACTIVE_CLASSES
          }`}
        >
          {category}
        </button>
      ))}
    </nav>
  );
}
