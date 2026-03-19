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

---

## Tarea 4 — Página de detalle ✅

### Cambios realizados

| Archivo | Cambio | Justificación |
|---------|--------|---------------|
| `hooks/useProduct.ts` | Creación del hook `useProduct(id: string)` con `useState`, `useEffect`, `useCallback` y `AbortController`. Retorno tipado con interfaz `UseProductReturn`. Importa `API_BASE_URL` desde `@/constants/api` | Encapsula el fetch de un producto individual en un hook dedicado, separando la obtención de datos de la presentación. Reutiliza la constante centralizada evitando duplicación |
| `app/products/[id]/page.tsx` | Página de detalle con `"use client"`, `useParams` para leer el `id`, `useRouter` para navegación de vuelta, `useMemo` para construir `FormattedProduct` con title case y precio formateado, `useCallback` en `handleGoBack` | Orquesta los hooks de Next.js y React para cumplir la tarea: lee el `id` de la URL, obtiene datos vía `useProduct`, transforma con `useMemo`, y navega de vuelta con botón |
| `constants/api.ts` | Creación del módulo con `API_BASE_URL` y `CATEGORIES_URL` exportadas | Centraliza las URLs de la API en un único archivo, eliminando la duplicación que existía entre `useProduct.ts`, `useProducts.ts` y `useCategories.ts` (principio DRY) |
| `hooks/useProducts.ts` | Reemplazada constante local `API_BASE_URL` por import desde `@/constants/api` | Eliminación de duplicación; la URL base se gestiona desde un único punto |
| `hooks/useCategories.ts` | Reemplazada constante local `CATEGORIES_URL` por import desde `@/constants/api` | Eliminación de duplicación; consistencia con el resto de hooks |
| `components/ui/Spinner.tsx` | Añadida prop opcional `label?: string` con valor por defecto `"Cargando..."`. Interfaz `SpinnerProps` tipada | Permite que el texto accesible (`sr-only`) sea contextual: la página de detalle pasa `"Cargando producto..."` mientras que la página principal usa el valor por defecto. Mejora la accesibilidad sin romper usos existentes |

### Explicación técnica

- **`useProduct` con el mismo patrón que `useProducts`:** El hook sigue la misma arquitectura establecida en la Tarea 2 (`useCallback` + `AbortController` + filtro de `AbortError` + `response.ok`), garantizando consistencia en el manejo de estados y cleanup. La diferencia es que retorna `Product | null` en lugar de `Product[]`, y su dependencia de `useCallback` es `[id]` en lugar de `[category]`.
- **`useParams<{ id: string }>()` de Next.js:** Lee el parámetro dinámico `[id]` de la URL. El genérico `<{ id: string }>` proporciona tipado en el consumidor. En una ruta `[id]` (no catch-all `[...id]`), Next.js siempre devuelve `string`, por lo que el cast es seguro.
- **`useMemo` con transformación multi-campo sobre el objeto completo:** Construye un `FormattedProduct` que incluye `formattedTitle` (title case vía regex `/\b\w/g`), `formattedPrice` (`toLocaleString("es-ES", { style: "currency", currency: "EUR" })`) y `formattedCategory` (title case). La dependencia `[product]` asegura que solo se recalcula cuando cambia el producto. La transformación de tres campos justifica el uso de `useMemo` frente a hacerlo inline en cada render.
- **Title case con `.replace(/\b\w/g, char => char.toUpperCase())`:** Capitaliza la primera letra de cada palabra. Se eligió este enfoque sobre `charAt(0).toUpperCase() + slice(1)` que solo capitalizaba la primera letra del string completo, cumpliendo mejor el requisito de *"título capitalizado"* y *"categoría legible"*.
- **`useCallback` en `handleGoBack`:** Envuelve `router.back()` con dependencia `[router]`, estabilizando la referencia del callback. Ambos botones "← Volver" (estado de error y estado normal) referencian `handleGoBack` en lugar de crear arrow functions inline, evitando recreaciones innecesarias.
- **`Spinner` con prop `label` configurable:** La prop tiene un valor por defecto `"Cargando..."` para no romper los usos existentes (retrocompatible). La página de detalle pasa `label="Cargando producto..."` para que el texto accesible sea semánticamente correcto en el contexto de carga de un único producto.
- **`constants/api.ts` como módulo centralizado:** `CATEGORIES_URL` se construye como template literal de `API_BASE_URL`, garantizando que cualquier cambio en la URL base se propague automáticamente. Los tres hooks importan desde este módulo, eliminando la duplicación detectada en la auditoría.
- **`priority` en `<Image>` de detalle:** Indica a Next.js que la imagen del producto es el Largest Contentful Paint (LCP) de la página, precargándola con prioridad alta para mejorar el rendimiento percibido.
- **Renderizado condicional con early returns:** `loading` → Spinner, `error` → mensaje + botón volver, `!formattedProduct` → null. Este patrón de guards evita anidación excesiva y hace explícito cada estado posible de la página.

### Checklist de requisitos

- [x] Hook `useProduct` en `hooks/useProduct.ts` con named export
- [x] `useProduct` maneja `loading`, `error` y `product` con tipado explícito (sin `any`)
- [x] `useProduct` usa `AbortController` para cancelar fetch al desmontar
- [x] `useProduct` filtra `AbortError` para no mostrar cancelaciones como error
- [x] `useProduct` verifica `response.ok` antes de parsear JSON
- [x] Página `/products/[id]/page.tsx` creada con `"use client"`
- [x] `id` leído con `useParams` de `next/navigation`
- [x] `useMemo` aplicado sobre el objeto producto completo, retornando `FormattedProduct`
- [x] `useMemo` transforma múltiples campos: título en title case, precio con moneda (EUR), categoría en title case
- [x] Dependencia de `useMemo` es `[product]` — solo se recalcula cuando cambia el producto
- [x] Botón de navegación de vuelta al grid con `useRouter().back()` envuelto en `useCallback`
- [x] Estados de carga (`Spinner` con label contextual) y error correctamente manejados
- [x] `Spinner` mejorado con prop `label` configurable (retrocompatible con usos existentes)
- [x] Constantes de API centralizadas en `constants/api.ts` (DRY)
- [x] Hooks `useProducts` y `useCategories` refactorizados para importar de `@/constants/api`
- [x] Sin fetch ni lógica de datos dentro de componentes
- [x] Sin `any` en TypeScript — todos los tipos explícitos
- [x] Sin `console.log` en el código
- [x] Named exports en componentes y hooks
- [x] Imports con path alias `@/`
- [x] ESLint limpio (`pnpm lint` sin errores ni warnings)
- [x] TypeScript limpio (`npx tsc --noEmit` sin errores)