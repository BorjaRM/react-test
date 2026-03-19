import { useState, useEffect, useCallback } from "react";
import type { Product } from "@/types/product";
import { API_BASE_URL } from "@/constants/api";

interface UseProductReturn {
  product: Product | null;
  loading: boolean;
  error: string | null;
}

export function useProduct(id: string): UseProductReturn {
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProduct = useCallback(
    async (signal: AbortSignal): Promise<void> => {
      try {
        const url = `${API_BASE_URL}/${encodeURIComponent(id)}`;
        const response = await fetch(url, { signal });

        if (!response.ok) {
          throw new Error(`Error ${response.status}: ${response.statusText}`);
        }

        const data: Product = await response.json();
        setProduct(data);
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
    [id],
  );

  useEffect(() => {
    setProduct(null);
    setLoading(true);
    setError(null);

    const controller = new AbortController();
    fetchProduct(controller.signal);
    return () => {
      controller.abort();
    };
  }, [fetchProduct]);

  return { product, loading, error };
}
