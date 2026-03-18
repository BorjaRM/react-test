"use client";

import { useProducts } from "@/hooks/useProducts";
import { ProductGrid } from "@/components/product/ProductGrid";
import { Spinner } from "@/components/ui/Spinner";

export default function Home() {
  const { products, loading, error } = useProducts();

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Productos</h1>
        <p className="mt-1 text-gray-600">
          Explora nuestro catálogo de productos.
        </p>
      </div>

      {loading && <Spinner />}

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-center">
          <p className="text-sm font-medium text-red-800">
            No se pudieron cargar los productos.
          </p>
          <p className="mt-1 text-xs text-red-600">{error}</p>
        </div>
      )}

      {!loading && !error && <ProductGrid products={products} />}
    </div>
  );
}
