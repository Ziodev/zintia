# Premium Adult Web Application - Architecture & Development Rules

Este documento establece las reglas técnicas, de arquitectura, diseño y optimización que deben seguirse estrictamente durante todo el ciclo de vida del proyecto. El objetivo es construir una plataforma de adultos ultra-rápida, escalable, segura y diseñada para maximizar la retención y la conversión (CTR).

---

## 1. Stack Tecnológico y Arquitectura Core

*   **Framework**: Next.js (Última versión con App Router).
    *   **Renderizado**: Server Components (RSC) por defecto para optimizar SEO y FCP (First Contentful Paint). Client Components (`"use client"`) únicamente para elementos interactivos.
    *   **Estrategia de Renderizado**: Pre-renderizado estático (SSG) o Regeneración Estática Incremental (ISR) para páginas principales y de categorías.
*   **Lenguaje**: TypeScript en modo estricto (`strict: true`). Sin uso de `any` para garantizar robustez y autocompletado en el desarrollo.
*   **Estilos**: Tailwind CSS. Estilos utilitarios con bundle mínimo, Dark Mode nativo y soporte para Glassmorphism.
*   **Componentes**: shadcn/ui + Radix UI para elementos interactivos accesibles (modales, desplegables, selectores) personalizados con clases utilitarias de Tailwind.
*   **Micro-interacciones y Animaciones**: Framer Motion para transiciones suaves y físicas de resorte en UI crítica. Embla Carousel para sliders optimizados y táctiles.
*   **Gestión de Estado**:
    *   Filtros y paginación sincronizados en URL de forma type-safe usando `nuqs` (next-usequerystate) para optimizar SEO programático.
    *   Estado de UI global ligero (ej. estado de reproducción del video o preferencias de usuario) usando `Zustand`.
*   **Estructura del Proyecto**:
    ```text
    /src
      /app            # Rutas y páginas (App Router)
      /components     # Componentes de UI y de negocio
        /ui           # Componentes base (shadcn/ui/Radix UI)
        /cards        # Tarjetas de video, publicidad nativa, etc.
        /filters      # Barras de filtrado y ordenación
      /hooks          # Custom hooks (useIntersectionObserver, useVideoState)
      /lib            # Utilidades compartidas (Zustand store, utils.ts para tailwind-merge)
      /types          # Definiciones y schemas de TypeScript
    ```

---

## 2. UI: Sistema de Diseño y Estética Premium

Para diferenciarnos de sitios genéricos y transmitir máxima seguridad, el sistema visual debe ser impecable y moderno.

### 2.1 Paleta de Colores (Deep Dark Mode)
*   **Background principal**: `#0a0a0c` o `#0f172a` (Negro profundo / Slate oscuro) para mitigar la fatiga visual y resaltar las miniaturas.
*   **Superposiciones/Cards**: `#16161e` (Gris oscuro elevado).
*   **Textos**:
    *   Primario: `#f8fafc` (Slate 50) o `#f4f4f5` (Zinc 100).
    *   Secundario: `#94a3b8` (Slate 400).
*   **Acentos/CTAs**:
    *   Rosa/Rojo Vibrante: `#f43f5e` (Rose 500) para llamadas a la acción críticas y marcadores activos.
    *   Púrpura/Magenta: `#d946ef` (Fuchsia 500) para elementos destacados secundarios.

### 2.2 Glassmorphism y Elevación Visual
*   **Barras de navegación, menús y modales**: Utilizar `backdrop-blur` con fondos semi-transparentes (ej. `bg-background/70 backdrop-blur-md`).
*   **Bordes**: Bordes delgados (`border border-white/8`) para dar sensación de profundidad y delimitar elementos sin añadir ruido visual.
*   **Sombras**: Sombras suaves y difusas para dar volumen a las tarjetas elevadas.

### 2.3 Mobile-First Estricto
*   **Grilla de Video**: En dispositivos móviles (`max-width: 768px`), usar una distribución estricta de **2 columnas de miniaturas** (`grid grid-cols-2 gap-2 md:grid-cols-3 lg:grid-cols-4`). Esto duplica la densidad de opciones sin saturar la vista.
*   **Optimización del espacio**: Reducir márgenes (paddings/gaps) a un máximo de `8px` o `12px` en móvil para aprovechar al máximo el área de pantalla útil.

---

## 3. UX y WPO (Web Performance Optimization)

El rendimiento extremo es el factor clave para retener usuarios. La página debe responder en milisegundos.

### 3.1 Carga Diferida (Lazy-Loading) Estricta
*   **Imágenes**: Utilizar el componente `<Image />` de Next.js. Las imágenes por debajo de la línea de flotación (below the fold) deben tener `loading="lazy"`.
*   **Videos y GIFs**: No usar formatos GIF pesados en la grilla de videos. En su lugar, usar loops cortos en formatos de video eficientes (`MP4` o `WebM`).

### 3.2 Autoplay Inteligente de Miniaturas (IntersectionObserver)
*   No iniciar la reproducción automática de todos los videos a la vez.
*   Implementar un Custom Hook `useIntersectionObserver` para detectar qué tarjetas de video están en el viewport.
*   **Comportamiento**:
    *   En móvil: Iniciar la reproducción del video silencioso cuando esté al menos en un 60% visible en el viewport, y pausarlo inmediatamente al salir.
    *   En desktop: Iniciar reproducción en hover o cuando esté en foco de lectura del cursor.

### 3.3 Filtros y Paginación Instantáneos (SEO Friendly)
*   La interacción con categorías, actores o etiquetas debe cambiar instantáneamente usando transiciones de estado en el cliente.
*   Utilizar `nuqs` para mapear los filtros a parámetros de búsqueda en la URL (`?tag=amateur&sort=views`). Esto permite:
    1.  SEO programático e indexación de páginas filtradas por Google.
    2.  Paginación e historial del navegador instantáneos sin re-renderizado completo del DOM.

---

## 4. Arquitectura de Conversión y Monetización Camuflada

El diseño de monetización debe ser nativo y fundirse con la experiencia de navegación para evitar "ceguera de banners".

### 4.1 Anuncios Nativos Mimetizados
*   Los anuncios e invitaciones a ofertas de afiliados se deben inyectar directamente en las posiciones de la grilla de videos (por ejemplo, en el índice 3, 7, etc.).
*   Los contenedores de anuncios deben tener **exactamente** la misma estructura visual que una tarjeta de video (bordes redondeados, proporciones, estilo tipográfico y superposiciones), cambiando únicamente el CTA y la indicación sutil de "Patrocinado".

### 4.2 CTAs Adherentes (Sticky) al Pulgar
*   Para dispositivos móviles, las ofertas de alta conversión (registro gratis, webcam) deben contar con un elemento flotante/sticky en la parte inferior de la pantalla.
*   **Ubicación**: Situado en la zona de fácil acceso para el pulgar, pero con un diseño compacto (`h-14`) y semi-transparente para no obstruir el contenido del video que se está visualizando. Animado con Framer Motion en su aparición (spring animation).

### 4.3 Micro-Interacciones y Skeleton Loaders
*   Antes de redirigir a enlaces de afiliados, o mientras se cargan listas de videos, usar un componente esquelético (`Skeleton Loader` de shadcn/ui) animado con un degradado de pulso suave.
*   Esto mantiene al usuario enfocado y consciente de que el sistema está respondiendo, reduciendo la tasa de rebote durante las cargas rápidas.

---

## 5. SEO y Prácticas de Rendimiento (WPO)
*   **Metadatos**: Configurar metadatos dinámicos estructurados usando la API `generateMetadata` de Next.js para optimizar el rastreo de buscadores en cada categoría y video.
*   **Estructura Semántica**: Solo un elemento `<h1>` por página. Uso riguroso de `<header>`, `<main>`, `<section>`, `<article>` y `<footer>`.
*   **Atributos de Accesibilidad**: Mantener `aria-label` descriptivos en botones interactivos y enlaces de afiliados para asegurar que el sitio mantenga un puntaje de SEO del 100% en Lighthouse.
