# TropelCare Control Room — Pizza Protocol

Consola operativa para gestionar colonias de criaturas digitales (Tropeles). Proyecto desarrollado en hackathon de 2 horas.

## Integrantes

| Nombre | Parte |
|--------|-------|
| Alanis Marie Espinoza Feliciano | Autenticación, Layout, Dashboard, Deploy |
| Marylin Regina Ccolcca Flores | Tropeles, Feed infinito, Detalle de señal | 202420045
| Gloria Angeline Alfaro Quispe | Sector Story Engine |

## Instalación

```bash
pnpm install
```

## Variables de entorno

Crear un archivo `.env` en la raíz del proyecto:

```
VITE_API_BASE_URL=https://<backend-url>/api/v1
```

## Comandos

```bash
pnpm dev          # Servidor de desarrollo
pnpm build        # Build de producción
pnpm typecheck    # Verificación de tipos TypeScript
pnpm preview      # Preview del build
```

## Deploy

**URL:** https://hack2-brown-mu.vercel.app

Desplegado en Vercel con redeploy automático en cada push a `main`.

## Decisiones técnicas

- **Estado en URL**: Los filtros, paginación y ordenamiento de Tropeles y Señales se persisten en `URLSearchParams` como fuente única de verdad. Permite compartir y restaurar el estado exacto.
- **AbortController**: Cada fetch crea un controller propio que se cancela cuando cambian los params o el componente se desmonta. Evita race conditions y resultados de requests antiguas.
- **Feed cursor-based**: El infinite scroll usa `IntersectionObserver` sobre un sentinel al final de la lista. Deduplicación por ID con un `Set` en `useRef`. Un `inFlightRef` garantiza una sola carga en vuelo.
- **Snapshot del feed**: Al navegar al detalle de una señal se guarda en `sessionStorage` el estado completo del feed (items, cursor, scroll). Al volver se rehidrata instantáneamente sin refetch.
- **Axios centralizado**: Una sola instancia axios en `src/lib/axios.ts` con interceptores para JWT e inyección del token. Los módulos de api importan desde ella para evitar instancias duplicadas.
- **Scrollytelling**: El `SectorStoryPage` usa `IntersectionObserver` sobre `window` y `position: fixed` para el panel lateral, por lo que se excluye del Layout compartido.
- **CSS Scroll-driven Animations**: Se aplican solo si `CSS.supports('animation-timeline', 'scroll()')` es verdadero. Fallback con transiciones CSS estándar.
- **View Transition API**: Se usa `document.startViewTransition()` entre la vista resumen y la historia del sector. Fallback a `setState` directo si no hay soporte.
- **prefers-reduced-motion**: Todas las animaciones respetan el media query. Las transiciones se desactivan y el scroll usa `behavior: 'auto'` en lugar de `'smooth'`.
