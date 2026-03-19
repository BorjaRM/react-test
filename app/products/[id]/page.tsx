"use client";

import { useCallback, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import { useProduct } from "@/hooks/useProduct";
import { Spinner } from "@/components/ui/Spinner";
import type { FormattedProduct } from "@/types/product";

export default function ProductDetail() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { product, loading, error } = useProduct(params.id);

  const handleGoBack = useCallback(() => {
    router.back();
  }, [router]);

  const formattedProduct: FormattedProduct | null = useMemo(() => {
    if (!product) return null;
    return {
      ...product,
      formattedTitle: product.title.replace(
        /\b\w/g,
        (char) => char.toUpperCase(),
      ),
      formattedPrice: product.price.toLocaleString("es-ES", {
        style: "currency",
        currency: "EUR",
      }),
      formattedCategory: product.category.replace(
        /\b\w/g,
        (char) => char.toUpperCase(),
      ),
    };
  }, [product]);

  if (loading) {
    return <Spinner label="Cargando producto..." />;
  }

  if (error) {
    return (
      <div className="flex flex-col items-center gap-4 py-12">
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-center">
          <p className="text-sm font-medium text-red-800">
            No se pudo cargar el producto.
          </p>
          <p className="mt-1 text-xs text-red-600">{error}</p>
        </div>
        <button
          type="button"
          onClick={handleGoBack}
          className="text-sm font-medium text-gray-600 transition-colors hover:text-gray-900"
        >
          ← Volver
        </button>
      </div>
    );
  }

  if (!formattedProduct) {
    return null;
  }

  return (
    <div className="flex flex-col gap-6">
      <button
        type="button"
        onClick={handleGoBack}
        className="self-start text-sm font-medium text-gray-600 transition-colors hover:text-gray-900"
      >
        ← Volver
      </button>

      <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
        <div className="relative aspect-square w-full rounded-lg bg-gray-50 p-8">
          <Image
            src={formattedProduct.image}
            alt={formattedProduct.formattedTitle}
            fill
            sizes="(max-width: 768px) 100vw, 50vw"
            className="object-contain"
            priority
          />
        </div>

        <div className="flex flex-col gap-4">
          <p className="text-sm font-medium text-gray-500">
            {formattedProduct.formattedCategory}
          </p>
          <h1 className="text-2xl font-bold text-gray-900">
            {formattedProduct.formattedTitle}
          </h1>
          <p className="text-3xl font-bold text-gray-900">
            {formattedProduct.formattedPrice}
          </p>
          <div className="flex items-center gap-2">
            <span className="text-lg text-yellow-500">★</span>
            <span className="text-sm font-medium text-gray-700">
              {formattedProduct.rating.rate}
            </span>
            <span className="text-sm text-gray-500">
              ({formattedProduct.rating.count} valoraciones)
            </span>
          </div>
          <hr className="border-gray-200" />
          <p className="leading-relaxed text-gray-600">
            {formattedProduct.description}
          </p>
        </div>
      </div>
    </div>
  );
}
