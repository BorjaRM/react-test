# Tareas — FakeStore

---

## Tarea 1 — Setup ✅

### Cambios realizados

| Archivo | Cambio | Justificación |
|---------|--------|---------------|
| `components/layout/Header.tsx` | Creación del componente `Header` con `<Link>` de `next/link`, navegación `sticky` y enlace a productos | Estructura visual persistente; usa `next/link` para navegación declarativa sin recargas |
| `components/layout/Footer.tsx` | Creación del componente `Footer` con año dinámico (`new Date().getFullYear()`) | Pie de página reutilizable que se actualiza automáticamente cada año |
| `app/layout.tsx` | Layout raíz con `Header` + `<main>` + `Footer`, fuentes Geist vía `next/font/google`, `lang="es"` | Composición del layout base; las fuentes se cargan como CSS variables evitando FOUT; `lang="es"` mejora accesibilidad y SEO |
| `app/globals.css` | Definición de variables de tema en `@theme inline` y `:root`, importación de Tailwind CSS | Centraliza los tokens de diseño (fuentes, colores) en un único archivo, compatible con Tailwind v4 |
| `next.config.ts` | Configuración de `remotePatterns` para `fakestoreapi.com` | Permite que `next/image` optimice imágenes externas de la FakeStore API |
| `types/product.ts` | Definición de interfaces `Product` y `FormattedProduct` | Tipado estricto para los datos de la API; `FormattedProduct` extiende `Product` para la vista de detalle |
| `types/cart.ts` | Definición de interfaces `CartItem` y `Cart` | Tipado del carrito preparado para tareas futuras; `CartItem` referencia `Product` evitando duplicación |

### Explicación técnica

- **Fuentes con `next/font/google`:** Se cargan Geist Sans y Geist Mono como variables CSS (`--font-geist-sans`, `--font-geist-mono`) inyectadas en `<html>`. Esto evita el Flash of Unstyled Text (FOUT) y permite que Tailwind las consuma vía `@theme inline`.
- **Layout con `flex min-h-screen flex-col`:** Garantiza que el `Footer` siempre quede al fondo de la pantalla incluso con poco contenido, usando flexbox con `flex-1` en el `<main>`.
- **`Header` sticky:** `sticky top-0 z-50` mantiene la navegación visible durante el scroll sin ocupar espacio fijo en el DOM.
- **`FormattedProduct` como extensión de `Product`:** Usa herencia de interfaces (`extends Product`) en lugar de un tipo independiente, evitando duplicación de campos y facilitando la transformación con `useMemo` en la tarea 4.
- **`remotePatterns` en lugar de `domains`:** La propiedad `remotePatterns` es la recomendada en Next.js 16, permitiendo control granular sobre protocolo y hostname de imágenes externas.

### Checklist de requisitos

- [x] Estructura de carpetas creada (`components/ui/`, `components/product/`, `components/layout/`, `hooks/`, `types/`, `app/products/[id]/`)
- [x] `Header` como componente en `components/layout/Header.tsx`
- [x] `Footer` como componente en `components/layout/Footer.tsx`
- [x] Layout base aplicado en `app/layout.tsx` (Header + main + Footer)
- [x] Fuentes definidas en CSS (`@theme inline` en `globals.css`)
- [x] `next.config.ts` con `remotePatterns` para `fakestoreapi.com`
- [x] `types/product.ts` y `types/cart.ts` creados con tipado estricto (sin `any`)
- [x] ESLint limpio (`pnpm lint` sin errores ni warnings)

---

## Tarea 2 — Listado de productos ✅

### Cambios realizados

| Archivo | Cambio | Justificación |
|---------|--------|---------------|
| `hooks/useProducts.ts` | Creación del hook `useProducts` con `useState`, `useEffect`, `useCallback` y `AbortController`. Endpoint extraído como constante `API_URL`. Retorno tipado con interfaz `UseProductsReturn` | Encapsula toda la lógica de fetch en un hook dedicado, separando datos de presentación. El tipado explícito del retorno facilita el autocompletado y previene errores en los consumidores |
| `components/ui/Spinner.tsx` | Componente de carga con animación CSS (`animate-spin`), `role="status"` y `<span className="sr-only">` | Feedback visual durante la carga; `role="status"` y texto oculto accesible permiten que lectores de pantalla anuncien el estado |
| `components/product/ProductCard.tsx` | Tarjeta de producto con `next/image` (prop `fill` + `sizes`), `next/link`, y props tipadas con `ProductCardProps` | Componente puramente presentacional que muestra imagen, título, precio, categoría y rating. `sizes` optimiza la carga de imágenes según viewport. `<Link>` proporciona navegación SPA a `/products/[id]` |
| `components/product/ProductGrid.tsx` | Grid responsivo con `<ul>`/`<li>` y CSS Grid de Tailwind (`grid-cols-1` → `xl:grid-cols-4`). Props tipadas con `ProductGridProps` | Semántica HTML correcta para colecciones; grid responsivo sin media queries manuales |
| `app/page.tsx` | Página principal con `"use client"`, composición de `useProducts` + `Spinner` + `ProductGrid`. Renderizado condicional para estados de carga/error/datos | Orquesta hook y componentes presentacionales; `"use client"` requerido por el uso de hooks de React |

### Explicación técnica

- **`useCallback` en `fetchProducts`:** Envuelve la función de fetch para estabilizar su referencia entre renders. Esto satisface la regla `exhaustive-deps` de ESLint al incluirla como dependencia del `useEffect`, y evita ejecuciones duplicadas del efecto.
- **`AbortController` en el cleanup de `useEffect`:** Cancela peticiones HTTP pendientes cuando el componente se desmonta. Sin esto, un fetch que resuelve tras el desmontaje intentaría llamar a `setProducts`/`setError` sobre un componente que ya no existe, provocando memory leaks y warnings de React.
- **Filtro de `AbortError` en el `catch`:** Cuando el `AbortController` cancela el fetch, se lanza un `DOMException` con `name === "AbortError"`. El hook lo detecta y hace `return` sin actualizar el estado de error, evitando que una cancelación intencionada se muestre como error al usuario.
- **`response.ok` antes de parsear:** Verifica que el status HTTP sea 2xx antes de llamar a `.json()`. Si la API devuelve un 404 o 500, se lanza un error descriptivo con el código de estado en lugar de intentar parsear un body inesperado.
- **`ProductGrid` con `<ul>`/`<li>`:** Se usa una lista semántica HTML en lugar de `<div>` para que lectores de pantalla identifiquen correctamente que se trata de una colección de items. `list-none` oculta los bullets visuales sin afectar la semántica.
- **`Spinner` con `role="status"`:** El atributo ARIA permite que tecnologías asistivas anuncien automáticamente el estado de carga. El `<span className="sr-only">` proporciona texto descriptivo solo para lectores de pantalla.
- **`next/image` con `fill` + `sizes`:** `fill` permite que la imagen ocupe su contenedor sin especificar dimensiones fijas. `sizes` indica al navegador qué ancho tendrá la imagen en cada breakpoint, permitiendo a Next.js servir el tamaño óptimo y reducir el peso de la página.
- **Renderizado condicional con guards (`!loading && !error`):** Evita que `ProductGrid` se renderice con un array vacío durante la carga o cuando hay error, previniendo un flash de contenido vacío.

### Checklist de requisitos

- [x] `useProducts` hook en `hooks/useProducts.ts`
- [x] Maneja `loading`, `error`, `products` con tipado explícito
- [x] `ProductCard` puramente presentacional (sin `useState`, `useEffect` ni fetch)
- [x] `ProductGrid` puramente presentacional (sin `useState`, `useEffect` ni fetch)
- [x] Spinner durante carga con accesibilidad (`role="status"`)
- [x] Mensaje de error visible si falla el fetch
- [x] `AbortController` para cancelar fetch al desmontar
- [x] Sin `any` en TypeScript — todos los tipos explícitos
- [x] Named exports en componentes y hooks
- [x] Imports con path alias `@/`
- [x] ESLint limpio (`pnpm lint` sin errores ni warnings)
- [x] TypeScript limpio (`npx tsc --noEmit` sin errores)

---

## Tarea 3 — Filtrado por categoría ✅

### Cambios realizados

| Archivo | Cambio | Justificación |
|---------|--------|---------------|
| `hooks/useCategories.ts` | Creación del hook `useCategories` con `useState`, `useEffect`, `useCallback` y `AbortController`. Endpoint extraído como constante `CATEGORIES_URL`. Retorno tipado con interfaz `UseCategoriesReturn` | Encapsula la obtención de categorías de la API en un hook dedicado, separando esta responsabilidad del hook de productos y del componente de filtro |
| `hooks/useProducts.ts` | Añadido parámetro opcional `category?: string`. URL dinámica con `encodeURIComponent`. Constante renombrada de `API_URL` a `API_BASE_URL`. Dependencia `[category]` en `useCallback`. Reset de estado (`setProducts([])`, `setLoading(true)`, `setError(null)`) al inicio del `useEffect` | Permite filtrar productos por categoría vía la API; el reset de estado previene que aparezcan datos de la categoría anterior mientras carga la nueva |
| `components/layout/CategoryFilter.tsx` | Componente presentacional con `<nav aria-label>`, botón "Todas" + botones por categoría, `aria-pressed` para accesibilidad, clases CSS extraídas a constantes (`BASE_BUTTON_CLASSES`, `ACTIVE_CLASSES`, `INACTIVE_CLASSES`) | Componente sin estado propio que delega toda la lógica al padre vía callbacks; `aria-pressed` comunica el estado activo a lectores de pantalla; constantes de clases eliminan duplicación |
| `app/page.tsx` | Integración de `useCategories`, `CategoryFilter`, `useState<string \| null>` para categoría seleccionada, `useCallback` en `handleSelectCategory`. Conversión `selectedCategory ?? undefined` para la firma del hook. Empty state cuando `products.length === 0` | Orquesta el filtrado sin mezclar lógica de datos en componentes; `useCallback` evita recrear el handler en cada render; empty state mejora la UX cuando una categoría no tiene productos |

### Explicación técnica

- **Parámetro `category` en `useCallback` de `fetchProducts`:** Al incluir `category` en el array de dependencias de `useCallback`, React genera una nueva referencia de `fetchProducts` cada vez que cambia la categoría. Como el `useEffect` depende de `[fetchProducts]`, esto dispara automáticamente un nuevo fetch con la URL correcta. La cadena reactiva es: `category` cambia → `fetchProducts` se recrea → `useEffect` se re-ejecuta → nuevo fetch.
- **Reset de estado al inicio del `useEffect`:** Antes de iniciar el fetch, se ejecutan `setProducts([])`, `setLoading(true)` y `setError(null)`. Esto garantiza que al cambiar de categoría: (1) no se muestran productos de la categoría anterior durante la carga, (2) el spinner aparece inmediatamente, y (3) un error previo no persiste visualmente. Cumple el requisito evaluado de *"no aparecen datos de la categoría anterior mientras carga la nueva"*.
- **`AbortController` en `useCategories`:** Aunque las categorías solo se cargan una vez, el `AbortController` previene memory leaks si el componente se desmonta antes de que el fetch resuelva (ej: navegación rápida del usuario).
- **`encodeURIComponent` en la URL de categoría:** La API de FakeStore tiene categorías con caracteres especiales (ej: `"men's clothing"`). Sin encoding, la comilla simple rompería la URL. `encodeURIComponent` produce `men%27s%20clothing`, que la API procesa correctamente.
- **`CategoryFilter` sin estado propio:** Recibe `categories`, `selectedCategory` y `onSelectCategory` como props. No contiene `useState`, `useEffect` ni fetch. El estado de selección se gestiona exclusivamente en `page.tsx`, cumpliendo el requisito de *"componente de filtro sin estado propio"*.
- **`aria-pressed` en botones de categoría:** Los botones actúan como toggles de selección. `aria-pressed={true|false}` comunica a lectores de pantalla cuál es la categoría activa, mejorando la accesibilidad sin afectar el comportamiento visual.
- **`useCallback` en `handleSelectCategory`:** Envuelve el setter `setSelectedCategory` con dependencias vacías `[]`, estabilizando la referencia del callback. Esto evita que `CategoryFilter` reciba una prop nueva en cada render del padre, cumpliendo el requisito de *"optimizar la función de selección de categoría para que no se recree en cada render"*.
- **Conversión `selectedCategory ?? undefined`:** El estado de React usa `null` como valor "sin selección", pero la firma del hook `useProducts(category?: string)` espera `undefined` para cargar todos los productos. El nullish coalescing `??` convierte `null` a `undefined` manteniendo ambas interfaces limpias y semánticamente correctas.
- **Empty state en `page.tsx`:** Cuando `products.length === 0` sin loading ni error, se muestra un mensaje descriptivo en lugar de un grid vacío. La lógica se gestiona en la página (orquestador), no en `ProductGrid` (presentacional), respetando la separación de responsabilidades.

### Checklist de requisitos

- [x] `useCategories` hook en `hooks/useCategories.ts` con `loading`, `error`, `categories` tipados
- [x] `useCategories` usa `AbortController` para cleanup
- [x] `useProducts` acepta parámetro opcional `category`
- [x] `useProducts` llama a `/products/category/{name}` cuando hay categoría seleccionada
- [x] `useProducts` limpia productos anteriores al cambiar de categoría (no datos fantasma)
- [x] `CategoryFilter` es puramente presentacional (sin `useState`, `useEffect` ni fetch)
- [x] `CategoryFilter` muestra todas las categorías + opción "Todas"
- [x] `CategoryFilter` indica visualmente la categoría seleccionada
- [x] `CategoryFilter` usa `aria-pressed` para accesibilidad
- [x] Handler de selección de categoría envuelto en `useCallback` (no se recrea en cada render)
- [x] Dependencias de `useCallback` y `useEffect` correctas en todos los hooks
- [x] Empty state cuando no hay productos para la categoría seleccionada
- [x] Sin `any` en TypeScript — todos los tipos explícitos
- [x] Named exports en componentes y hooks
- [x] Imports con path alias `@/`
- [x] ESLint limpio (`pnpm lint` sin errores ni warnings)
- [x] TypeScript limpio (`npx tsc --noEmit` sin errores)
