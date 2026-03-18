export function Spinner() {
  return (
    <div role="status" className="flex items-center justify-center py-12">
      <div className="h-10 w-10 animate-spin rounded-full border-4 border-gray-200 border-t-gray-900" />
      <span className="sr-only">Cargando productos...</span>
    </div>
  );
}
