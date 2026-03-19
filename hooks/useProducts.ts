import { useState, useEffect, useCallback } from "react";
import type { Product } from "@/types/product";
import { API_BASE_URL } from "@/constants/api";

interface UseProductsReturn {
  products: Product[];
  loading: boolean;
  error: string | null;
}

export function useProducts(category?: string): UseProductsReturn {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProducts = useCallback(
    async (signal: AbortSignal): Promise<void> => {
      try {
        const url = category
          ? `${API_BASE_URL}/category/${encodeURIComponent(category)}`
          : API_BASE_URL;

        const response = await fetch(url, { signal });

        if (!response.ok) {
          throw new Error(`Error ${response.status}: ${response.statusText}`);
        }

        const data: Product[] = await response.json();
        setProducts(data);
      } catch (err: unknown) {
        if (err instanceof DOMException && err.name === "AbortError") {
          return;
        }
        const message =
          err instanceof Error ? err.message : "Error desconocido";
        setError(message);
      } finally {
        setLoading(false);
      }
    },
    [category],
  );

  useEffect(() => {
    setProducts([]);
    setLoading(true);
    setError(null);

    const controller = new AbortController();
    fetchProducts(controller.signal);
    return () => {
      controller.abort();
    };
  }, [fetchProducts]);

  return { products, loading, error };
}
