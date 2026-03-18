"use client";

import { useState, useCallback } from "react";
import { useProducts } from "@/hooks/useProducts";
import { useCategories } from "@/hooks/useCategories";
import { ProductGrid } from "@/components/product/ProductGrid";
import { CategoryFilter } from "@/components/layout/CategoryFilter";
import { Spinner } from "@/components/ui/Spinner";

export default function Home() {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const handleSelectCategory = useCallback(
    (category: string | null) => {
      setSelectedCategory(category);
    },
    [],
  );

  const { products, loading, error } = useProducts(
    selectedCategory ?? undefined,
  );
  const {
    categories,
    loading: categoriesLoading,
    error: categoriesError,
  } = useCategories();

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Productos</h1>
        <p className="mt-1 text-gray-600">
          Explora nuestro catálogo de productos.
        </p>
      </div>

      {!categoriesLoading && !categoriesError && (
        <CategoryFilter
          categories={categories}
          selectedCategory={selectedCategory}
          onSelectCategory={handleSelectCategory}
        />
      )}

      {loading && <Spinner />}

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-center">
          <p className="text-sm font-medium text-red-800">
            No se pudieron cargar los productos.
          </p>
          <p className="mt-1 text-xs text-red-600">{error}</p>
        </div>
      )}

      {!loading && !error && products.length === 0 && (
        <p className="py-12 text-center text-sm text-gray-500">
          No se encontraron productos en esta categoría.
        </p>
      )}

      {!loading && !error && products.length > 0 && (
        <ProductGrid products={products} />
      )}
    </div>
  );
}
