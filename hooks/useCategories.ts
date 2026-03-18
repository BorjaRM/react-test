import { useState, useEffect, useCallback } from "react";

const CATEGORIES_URL = "https://fakestoreapi.com/products/categories";

interface UseCategoriesReturn {
  categories: string[];
  loading: boolean;
  error: string | null;
}

export function useCategories(): UseCategoriesReturn {
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCategories = useCallback(
    async (signal: AbortSignal): Promise<void> => {
      try {
        const response = await fetch(CATEGORIES_URL, { signal });

        if (!response.ok) {
          throw new Error(`Error ${response.status}: ${response.statusText}`);
        }

        const data: string[] = await response.json();
        setCategories(data);
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
    [],
  );

  useEffect(() => {
    const controller = new AbortController();
    fetchCategories(controller.signal);
    return () => {
      controller.abort();
    };
  }, [fetchCategories]);

  return { categories, loading, error };
}
