# EcoTracer — Frontend Blueprint

> **Propósito:** Guía técnica exhaustiva para replicar este frontend desde cero en un proyecto nuevo.
> Cada sección contiene los valores exactos, sin aproximaciones.

---

## 1. Stack & Dependencias

### Core
| Paquete | Rol |
|---|---|
| `react` + `react-dom` | UI library |
| `typescript` | Tipado estático |
| `vite` | Build tool |
| `tailwindcss` + `tailwindcss-animate` | Estilos utilitarios + animaciones CSS |

### Componentes UI
| Paquete | Rol |
|---|---|
| `shadcn/ui` | Primitivas accesibles (Popover, Button, etc.) |
| `@radix-ui/*` | Primitivas headless que usa shadcn internamente |
| `lucide-react` | Iconografía — usar **siempre** este set, nunca mezclar con otros |

### Animación
| Paquete | Rol |
|---|---|
| `framer-motion` | Opcional para animaciones de entrada complejas (el proyecto las hace vía CSS puro) |

### Fuentes (Google Fonts — cargar en `index.html`)
```html
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600;700&family=Space+Grotesk:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
```

---

## 2. Configuración de Diseño — Fuente Única de Verdad

### `tailwind.config.ts` completo

```typescript
import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: ["./pages/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./app/**/*.{ts,tsx}", "./src/**/*.{ts,tsx}"],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: { "2xl": "1400px" },
    },
    extend: {
      fontFamily: {
        grotesk: ["Space Grotesk", "system-ui", "sans-serif"],
        mono:    ["JetBrains Mono", "Menlo", "monospace"],
      },
      colors: {
        // ── EcoTracer brand tokens — single source of truth ──────────
        EcoTracer: {
          primary:   "#09291D",   // Verde bosque oscuro — texto, iconos, fondos de sidebar
          secondary: "#FCFAEB",   // Crema cálida — fondo de página
          accent:    "#C8A97A",   // Ámbar dorado — TODAS las acciones y CTAs
          muted:     "#705B3D",   // Marrón apagado — texto secundario
          surface:   "#F0EEDF",   // Crema ligeramente más oscura — cards
          border:    "#E5E3D4",   // Borde sutil con temperatura cálida
        },

        // ── Shadcn semantic tokens (mapeados a la paleta) ────────────
        border:     "hsl(var(--border))",
        input:      "hsl(var(--input))",
        ring:       "hsl(var(--ring))",
        background: "#FCFAEB",
        foreground: "hsl(var(--foreground))",
        surface: {
          DEFAULT:              "#FCFAEB",
          bright:               "#FCFAEB",
          container:            "#F0EEDF",
          "container-high":     "#E8E6D7",
        },
        primary: {
          DEFAULT:              "#09291D",
          foreground:           "#FFFFFF",
          container:            "#09291D",
          "on-container":       "#FFFFFF",
        },
        secondary: {
          DEFAULT:              "hsl(var(--secondary))",
          foreground:           "hsl(var(--secondary-foreground))",
        },
        tertiary: {
          DEFAULT:              "#A68E6B",
          foreground:           "#FFFFFF",
        },
        destructive: {
          DEFAULT:              "hsl(var(--destructive))",
          foreground:           "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT:              "hsl(var(--muted))",
          foreground:           "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT:              "#C8A97A",
          foreground:           "#FFFFFF",
        },
        popover: {
          DEFAULT:              "hsl(var(--popover))",
          foreground:           "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT:              "#FCFAEB",
          foreground:           "hsl(var(--card-foreground))",
        },
        success: {
          DEFAULT:              "hsl(var(--success))",
          foreground:           "hsl(var(--success-foreground))",
        },
        token: {
          DEFAULT:              "#09291D",
          foreground:           "#FFFFFF",
        },
        sidebar: {
          DEFAULT:              "hsl(var(--sidebar-background))",
          foreground:           "hsl(var(--sidebar-foreground))",
          primary:              "hsl(var(--sidebar-primary))",
          "primary-foreground": "hsl(var(--sidebar-primary-foreground))",
          accent:               "hsl(var(--sidebar-accent))",
          "accent-foreground":  "hsl(var(--sidebar-accent-foreground))",
          border:               "hsl(var(--sidebar-border))",
          ring:                 "hsl(var(--sidebar-ring))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to:   { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to:   { height: "0" },
        },
        "fade-up": {
          from: { opacity: "0", filter: "blur(4px)", transform: "translateY(16px)" },
          to:   { opacity: "1", filter: "blur(0px)", transform: "translateY(0)" },
        },
        "scale-in": {
          from: { opacity: "0", transform: "scale(0.96)" },
          to:   { opacity: "1", transform: "scale(1)" },
        },
        "pulse-token": {
          "0%, 100%": { boxShadow: "0 0 0 0 hsla(33, 45%, 54%, 0.4)" },
          "50%":       { boxShadow: "0 0 0 8px hsla(33, 45%, 54%, 0)" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up":   "accordion-up 0.2s ease-out",
        "fade-up":        "fade-up 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards",
        "scale-in":       "scale-in 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards",
        "pulse-token":    "pulse-token 2s ease-in-out infinite",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
```

### `src/index.css` completo

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    /* Paleta EcoTracer 60:30:10 — source of truth en tailwind.config.ts */
    --background: 40 38% 96%;
    --foreground: 160 10% 20%;

    --card: 0 0% 100%;
    --card-foreground: 160 10% 20%;

    --popover: 0 0% 100%;
    --popover-foreground: 160 10% 20%;

    --primary: 152 44% 25%;
    --primary-foreground: 0 0% 100%;

    --secondary: 160 8% 88%;
    --secondary-foreground: 160 10% 20%;

    --muted: 160 6% 92%;
    --muted-foreground: 160 5% 50%;

    --accent: 33 45% 54%;
    --accent-foreground: 0 0% 100%;

    --destructive: 0 72% 51%;
    --destructive-foreground: 0 0% 100%;

    /* Borde con temperatura cálida — firma "precision cryptographic" */
    --border: 33 22% 85%;
    --input:  160 8% 93%;
    --ring:   33 45% 54%;   /* El foco siempre es ámbar */

    --radius: 0.5rem;

    --success: 152 60% 40%;
    --success-foreground: 0 0% 100%;

    --token: 33 45% 54%;
    --token-foreground: 0 0% 100%;

    /* Sidebar — dark forest green */
    --sidebar-background: 152 35% 23%;
    --sidebar-foreground: 150 8% 92%;
    --sidebar-primary: 33 45% 54%;
    --sidebar-primary-foreground: 0 0% 100%;
    --sidebar-accent: 152 25% 28%;
    --sidebar-accent-foreground: 150 8% 92%;
    --sidebar-border: 152 20% 30%;
    --sidebar-ring: 33 45% 54%;
  }
}

@layer base {
  * { @apply border-border; }
  body {
    @apply bg-background text-foreground antialiased;
    font-family: "Space Grotesk", system-ui, sans-serif;
    font-feature-settings: "cv11", "ss01";
  }
  h1, h2, h3, h4, h5, h6 {
    font-family: "Space Grotesk", system-ui, sans-serif;
    text-wrap: balance;
    letter-spacing: -0.02em;   /* Tracking ligeramente negativo en headings */
  }
  p {
    text-wrap: pretty;
    overflow-wrap: break-word;
  }
}

@layer utilities {
  .tabular-nums {
    font-variant-numeric: tabular-nums;
  }
  /* Datos blockchain — cualquier elemento con identidad on-chain */
  .font-blockchain {
    font-family: "JetBrains Mono", Menlo, monospace;
    font-variant-numeric: tabular-nums;
    letter-spacing: -0.01em;
  }
}

/* Keyframes duplicados en CSS puro (respaldo para animaciones inline) */
@keyframes fade-up {
  from { opacity: 0; filter: blur(4px); transform: translateY(16px); }
  to   { opacity: 1; filter: blur(0px); transform: translateY(0); }
}
@keyframes scale-in {
  from { opacity: 0; transform: scale(0.96); }
  to   { opacity: 1; transform: scale(1); }
}
@keyframes pulse-token {
  0%, 100% { box-shadow: 0 0 0 0 hsla(33, 45%, 54%, 0.4); }
  50%       { box-shadow: 0 0 0 8px hsla(33, 45%, 54%, 0); }
}
```

---

## 3. Identidad Visual — Las Reglas de Oro

### Jerarquía de Colores (regla 60:30:10)

| Porcentaje | Color | Hex | Uso |
|---|---|---|---|
| **60%** | Crema cálida | `#FCFAEB` | Fondo de página, `bg-EcoTracer-secondary` |
| **30%** | Verde bosque | `#09291D` | Sidebar, encabezados, texto, `bg-EcoTracer-primary` |
| **10%** | Ámbar dorado | `#C8A97A` | Botones CTA, bordes activos, tokens GRT, `EcoTracer-accent` |

### Tipografía

**Regla absoluta:** Solo se usan dos familias tipográficas. Jamás introducir una tercera.

| Familia | Clase Tailwind | Uso |
|---|---|---|
| **Space Grotesk** | `font-grotesk` (default en `body`) | Todo el texto de interfaz: labels, títulos, párrafos, botones |
| **JetBrains Mono** | `font-mono` / clase `.font-blockchain` | Exclusivamente para datos de identidad: hashes, IDs on-chain, cantidades de tokens, mensajes de consola |

**Parámetros tipográficos:**
- `letter-spacing: -0.02em` en todos los headings (`h1`–`h6`)
- `font-feature-settings: "cv11", "ss01"` en el `body` (activa ligaduras discretas de Space Grotesk)
- `text-wrap: balance` en headings, `text-wrap: pretty` en párrafos

### El Efecto Glassmorphism (regla de cristal)

Todo panel oscuro que flote sobre un fondo claro **debe** usar esta combinación exacta:

```
bg-[#09291D]/80        → verde bosque al 80% de opacidad
backdrop-blur-[20px]   → desenfoque de 20px (o backdrop-blur-xl)
border border-white/10 → borde blanco al 10% → efecto cristal sutil
```

En hover/focus de ese mismo panel:
```
hover:border-white/30  → el borde se vuelve más visible → feedback táctil
```

**Nunca** usar `backdrop-blur` sin el fondo semitransparente. Los dos van siempre juntos.

### Acentos de Ámbar en el Cristal

Cuando se necesita destacar un elemento dentro de una superficie oscura (ej. avatar de rol, ítem activo):
```
bg-[#C8A97A]/20 border border-[#C8A97A]/30   → estado normal
bg-[#C8A97A]/10 border border-[#C8A97A]/25   → variante más sutil (dropdowns)
```

### Indicador de Ítem Activo en Navegación

El ítem activo se marca con un borde izquierdo de 3px en ámbar, **no** con un fondo de highlight:
```
border-l-[3px] border-[#C8A97A] pl-[9px] pr-3 font-medium text-[#C8A97A]
```
El ítem inactivo mantiene `border-l-[3px] border-transparent` para que el layout no salte.

---

## 4. Componentes Patrón

### 4.1 `ExpandableActionButton` — Botón Expansible

**Concepto:** Un botón circular que solo muestra un icono. Al hacer hover, se expande hacia la derecha para revelar una etiqueta de texto. Es el CTA principal de cada dashboard.

**Dos variantes:**

#### `variant="expand"` (default — circular → expansible)

```
Estado base:  h-12 w-12   rounded-2xl   border-white/10
Estado hover: w-44        rounded-2xl   border-white/30
```

**Mecánica de la animación (500ms):**
- Solo se anima `width`, `border-radius` y `border-color` — no `all`. Esto evita que `backdrop-filter` parpadee.
- Curva de easing: `cubic-bezier(0.23, 1, 0.32, 1)` — arranque rápido, frenado suave (easing de "resorte").
- El **icono rota 90°** en el mismo tiempo de 500ms con la misma curva.
- El **texto** usa `max-width: 0 → 140px` para la apertura física, pero su `opacity: 0 → 1` tiene un `transitionDelay` de **180ms** — el texto no aparece hasta que el botón ya abrió lo suficiente para contenerlo visualmente.

```tsx
// Estructura de clases clave
<button className="
  group flex h-12 w-12 items-center justify-center overflow-hidden
  rounded-2xl bg-[#09291D]/80 backdrop-blur-xl border border-white/10
  text-[#C8A97A]
  transition-[width,border-radius,border-color] duration-500
  ease-[cubic-bezier(0.23,1,0.32,1)]
  hover:w-44 hover:border-white/30 active:scale-[0.97]
">
  <span className="transition-transform duration-500 ease-[cubic-bezier(0.23,1,0.32,1)] group-hover:rotate-90">
    {icon}
  </span>
  <span
    className="max-w-0 overflow-hidden whitespace-nowrap text-sm font-semibold opacity-0
               transition-[max-width,opacity] duration-500 ease-[cubic-bezier(0.23,1,0.32,1)]
               group-hover:max-w-[140px] group-hover:opacity-100 group-hover:ml-2.5"
    style={{ transitionDelay: '0ms, 180ms' }}
  >
    {label}
  </span>
</button>
```

#### `variant="full"` (ancho completo — para paneles de detalle)

```tsx
<button className="
  group flex w-full items-center justify-center gap-2 rounded-xl
  bg-[#09291D]/80 backdrop-blur-xl border border-white/10
  px-4 py-2.5 text-sm font-semibold text-[#ceb795]
  transition-[border-color,background-color] duration-300
  hover:border-white/30 hover:bg-[#09291D]/90 active:scale-[0.98]
">
  <span className="transition-transform duration-300 group-hover:scale-110">{icon}</span>
  <span>{label}</span>
</button>
```

---

### 4.2 `FloatingNavbar` / `AppSidebar` — Sidebar Glassmorphism

**El contenedor principal:**
```tsx
<div className="
  m-4 rounded-2xl
  bg-[#09291D]/80 backdrop-blur-[20px] border border-white/10
  flex flex-col h-full
">
```
Los `m-4` crean el efecto de "burbuja flotante" — el sidebar no toca los bordes de la pantalla.

**`FloatingNavbar` es colapsable:** alterna entre `w-20` (icono) y `w-64` (completo) con `transition-all duration-300`.

**Divisores internos:** `border-b border-white/5` para separaciones de muy baja opacidad (apenas visibles).

**Sección de usuario:** El avatar del rol usa `bg-[#C8A97A]/20 border border-[#C8A97A]/30` — highlight ámbar en superficie oscura.

**Role switcher dropdown:** Al abrirse usa `animate-scale-in` (0.4s, `cubic-bezier(0.16, 1, 0.3, 1)`). Fondo `bg-[#C8A97A]/10 border border-[#C8A97A]/20`.

**Popover de logout:**
```tsx
<PopoverContent className="
  w-56 bg-[#09291D] border border-white/20 text-white
  p-4 rounded-xl shadow-2xl
">
```
Botones del popover usan `font-mono` con bordes de colores semánticos (ámbar para confirmar, blanco/10 para cancelar).

**Animaciones de aparición de texto** (cuando se expande la navbar): `opacity-0 animate-fade-up` con `animationFillMode: 'forwards'`.

---

### 4.3 `MycelliumBackground` — Fondo SVG Orgánico

Fondo decorativo que evoca una red miceliar + capa blockchain. Se usa en `LoginPage` como capa absoluta detrás del contenido.

**Tres capas de trazos:**
1. Filamentos principales: `stroke="#09291D" strokeOpacity="0.07" strokeWidth="1.1"`
2. Ramas secundarias: `strokeOpacity="0.055" strokeWidth="0.72"`
3. Puntas terciarias: `strokeOpacity="0.038" strokeWidth="0.5"`

**Capa de acento blockchain (ámbar):** `stroke="#C8A97A" strokeOpacity="0.065"` — la red de consenso on-chain.

**Nodos validadores (pulsantes):** 3 nodos ámbar que pulsan con stagger de 1.4s entre sí:
```css
@keyframes mc-pulse      { 0%,100% { opacity:.30; r:3.5 } 50% { opacity:.55; r:5.5 } }
@keyframes mc-pulse-ring { 0% { r:6; opacity:.18 } 100% { r:18; opacity:0 } }
```

**Importantísimo:** `pointer-events-none select-none` y `aria-hidden="true"` — es puramente decorativo.

---

## 5. Lógica de UI

### 5.1 `EstadoBadge` — Estados del Lote

Cada estado tiene su propio registro visual que comunica semánticamente la etapa del ciclo de vida del residuo:

```typescript
const ESTADO_STYLES = {
  // Neutral — esperando, sin movimiento
  pendiente:   'bg-neutral-100 text-neutral-400 border border-neutral-200',

  // Ámbar/cálido — en movimiento activo
  en_transito: 'bg-EcoTracer-accent/15 text-amber-800 border border-EcoTracer-accent/40',

  // Verde salvia — recibido y almacenado, en reposo
  en_acopio:   'bg-emerald-50 text-emerald-800 border border-emerald-200',

  // Verde bosque — procesado, valor ambiental realizado
  reciclado:   'bg-EcoTracer-primary/10 text-EcoTracer-primary border border-EcoTracer-primary/30',

  // Verde bosque sólido — estado final, transacción completa
  comprado:    'bg-EcoTracer-primary text-white border border-EcoTracer-primary',
};
```

**Regla:** Los estados siguen una progresión de color desde neutro → ámbar (acción) → verde claro → verde oscuro → verde sólido. El color más intenso = estado más avanzado en el ciclo.

**Morfología del badge:** `rounded-full px-3 py-1 text-xs font-semibold` — siempre píldora, nunca rectángulo.

---

### 5.2 `StatCard` — Jerarquía de Tarjetas de Estadística

Dos variantes con jerarquía visual clara:

#### `variant="default"` — Métrica estándar
```tsx
'border-EcoTracer-accent/20 bg-EcoTracer-surface hover:border-EcoTracer-accent/40'
// Valor: text-3xl font-bold tabular-nums tracking-tight text-EcoTracer-primary
// Icono: bg-EcoTracer-primary/10 text-EcoTracer-primary (10×10 rounded-lg)
```

#### `variant="token"` — Métrica de tokens GRT (jerarquía máxima)
```tsx
'border-EcoTracer-accent/30 bg-EcoTracer-primary text-white animate-pulse-token'
// Valor: font-mono text-5xl font-black tabular-nums tracking-tight text-EcoTracer-accent
// Sufijo GRT: text-sm font-semibold text-EcoTracer-accent/60
// Icono: bg-EcoTracer-accent/20 text-EcoTracer-accent
```

El `variant="token"` es siempre la tercera tarjeta en un grid de 3 (`sm:grid-cols-3`), tiene mayor tamaño de fuente (`text-5xl` vs `text-3xl`), fondo oscuro invertido, y el pulsado continuo de `animate-pulse-token` lo convierte en el foco de atención visual primario del dashboard.

**Animación de entrada escalonada:**
```tsx
// Cada card recibe un delay incremental
<StatCard delay={0}   ... />   // aparece inmediato
<StatCard delay={80}  ... />   // 80ms después
<StatCard delay={160} ... />   // 160ms después
```
Implementado con `opacity-0 animate-fade-up` + `style={{ animationDelay: '${delay}ms', animationFillMode: 'forwards' }}`.

---

### 5.3 `LoginPage` — Página de Autenticación

- Fondo: `bg-EcoTracer-secondary` + `<MycelliumBackground />` absoluto.
- Card de conexión/registro: `rounded-xl border border-EcoTracer-accent/20 bg-EcoTracer-surface p-6`.
- Entrada al formulario de registro usa `animate-scale-in`, la tarjeta de conexión usa `animate-fade-up`.
- Input de texto con focus ring ámbar: `focus:ring-2 focus:ring-EcoTracer-accent/30`.
- El selector de rol usa estado seleccionado: `border-EcoTracer-accent bg-EcoTracer-accent/5`.

---

## 6. Patrones de Animación

| Clase | Efecto | Duración | Curva | Uso |
|---|---|---|---|---|
| `animate-fade-up` | `opacity+blur+translateY` | 600ms | `cubic-bezier(0.16,1,0.3,1)` | Entrada de elementos al DOM |
| `animate-scale-in` | `opacity+scale(0.96→1)` | 400ms | `cubic-bezier(0.16,1,0.3,1)` | Aparición de dropdowns y modales |
| `animate-pulse-token` | `box-shadow` pulsante ámbar | 2s loop | `ease-in-out` | Token GRT card |
| Expansión de botón | `width+border-radius` | 500ms | `cubic-bezier(0.23,1,0.32,1)` | `ExpandableActionButton` |

**Regla de `animationFillMode: 'forwards'`:** Todo elemento que arranca con `opacity-0` debe tener `animationFillMode: 'forwards'` para no volver a invisible al terminar la animación.

---

## 7. System Prompt para el Nuevo Proyecto

Copia y pega este bloque como instrucción de sistema al iniciar una nueva conversación con una IA para continuar el desarrollo:

---

> Eres un experto en frontend React/TypeScript con Tailwind CSS y diseño de producto. Debes seguir estrictamente el sistema de diseño EcoTracer/EcoTracer descrito a continuación. **No introducir colores, fuentes ni estilos que no estén en esta especificación.**
>
> **Paleta de colores (única fuente de verdad):**
> - `#09291D` — verde bosque. Fondos de sidebar, textos principales, estado final comprado.
> - `#FCFAEB` — crema cálida. Fondo de página (60% dominante).
> - `#C8A97A` — ámbar dorado. EXCLUSIVO para: botones CTA, bordes de hover, texto de ítem activo, tokens GRT, cualquier elemento de acción o interacción.
> - `#F0EEDF` — crema oscura. Fondos de cards y superficies elevadas.
> - `#705B3D` — marrón apagado. Texto secundario/muted.
>
> **Tipografía:**
> - **Space Grotesk** para todo texto de UI (labels, títulos, botones, párrafos). `letter-spacing: -0.02em` en headings.
> - **JetBrains Mono** exclusivamente para datos on-chain: hashes, IDs, cantidades de tokens, cualquier dato con identidad blockchain.
> - Nunca usar otra fuente.
>
> **Glassmorphism (paneles oscuros flotantes):**
> - Siempre: `bg-[#09291D]/80 backdrop-blur-[20px] border border-white/10`
> - En hover: elevar borde a `border-white/30`
> - Los paneles deben tener `m-4 rounded-2xl` para el efecto de "burbuja flotante"
>
> **Animaciones:**
> - Entradas al DOM: `animate-fade-up` (blur+translateY, 600ms, `cubic-bezier(0.16,1,0.3,1)`)
> - Dropdowns y modales: `animate-scale-in` (scale 0.96→1, 400ms)
> - Expansiones de botón: `transition-[width,border-radius] duration-500 ease-[cubic-bezier(0.23,1,0.32,1)]`
> - Siempre incluir `animationFillMode: 'forwards'` en elementos con `opacity-0` inicial
>
> **Íconos:** Usar únicamente `lucide-react`. Tamaño estándar `h-4 w-4` en texto, `h-5 w-5` en navegación.
>
> **Reglas de no-negociables:**
> 1. El ámbar `#C8A97A` es SOLO para acciones e interacción — jamás para texto decorativo ni fondos grandes.
> 2. Los bordes en superficies claras son `border-EcoTracer-accent/20` (tono ámbar sutil). Los bordes en superficies oscuras son `border-white/10`.
> 3. El foco (`ring`) siempre es ámbar: `focus:ring-2 focus:ring-EcoTracer-accent/30`.
> 4. Las StatCards de tokens GRT son siempre `bg-EcoTracer-primary text-white` con valor en `font-mono text-5xl text-EcoTracer-accent`.
> 5. Los badges de estado son siempre `rounded-full` (píldora), nunca rectángulo.
> 6. Cualquier dato que venga de blockchain o tenga identidad on-chain usa `font-mono` / clase `.font-blockchain`.

---

*Blueprint generado el 2026-03-22 a partir del análisis de los archivos fuente de la rama `Murga`.*
