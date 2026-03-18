import Image from "next/image";
import Link from "next/link";
import type { Product } from "@/types/product";

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  return (
    <Link
      href={`/products/${product.id}`}
      className="group flex flex-col overflow-hidden rounded-lg border border-gray-200 bg-white transition-shadow hover:shadow-lg"
    >
      <div className="relative h-48 w-full bg-gray-50 p-4">
        <Image
          src={product.image}
          alt={product.title}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
          className="object-contain transition-transform group-hover:scale-105"
        />
      </div>
      <div className="flex flex-1 flex-col gap-2 p-4">
        <h3 className="line-clamp-2 text-sm font-medium text-gray-900">
          {product.title}
        </h3>
        <p className="text-xs text-gray-500 capitalize">{product.category}</p>
        <div className="mt-auto flex items-center justify-between pt-2">
          <span className="text-lg font-bold text-gray-900">
            {product.price.toFixed(2)} €
          </span>
          <div className="flex items-center gap-1">
            <span className="text-sm text-yellow-500">★</span>
            <span className="text-xs text-gray-600">
              {product.rating.rate} ({product.rating.count})
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
