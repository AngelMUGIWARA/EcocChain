# 🎨 EcoTracer - Paleta de Colores (60:30:10)

## Resumen

Se ha implementado la identidad visual de EcoTracer siguiendo la regla de color **60:30:10**, que distribuye los colores en tres niveles jerárquicos para crear armonía visual y enfatizar la interacción del usuario.

---

## Colores Configurados

### 60% - Dominante (Fondo)
- **Color**: Marrón Canela Claro
- **Valor Hex**: `#C8A97A`
- **Clase Tailwind**: `bg-EcoTracer-primary`
- **Uso**: Fondos de página principales, área de trabajo

**Componentes afectados:**
- Página Index.tsx - fondo principal del dashboard

---

### 30% - Secundario (Estructura/Texto)
- **Color**: Verde Pino Oscuro
- **Valor Hex**: `#335C4E`
- **Clase Tailwind**: `bg-EcoTracer-secondary`, `text-EcoTracer-secondary`
- **Uso**: Navbar, Sidebar, títulos, badges de "Lote Reciclado"

**Componentes afectados:**
- AppSidebar.tsx - fondo y estilos de la barra lateral
- EstadoBadge.tsx - estado "reciclado" con color secundario
- StatCard.tsx - iconos de estadísticas predeterminadas
- LoteTimeline.tsx - puntos de proceso completado

---

### 10% - Acento (Interacción)
- **Color**: Marrón Café Claro
- **Valor Hex**: `#A68E6B`
- **Clase Tailwind**: `bg-EcoTracer-accent`, `text-EcoTracer-accent`
- **Uso**: Botones de acción, estados activos, balance de Green Tokens (GRT)

**Componentes afectados:**
- Button.tsx - botones principales de acción ("Crear lote", "Transferir")
- StatCard.tsx - badges de tokens GRT
- AppSidebar.tsx - iconos de usuario y marca
- LoteTimeline.tsx - badges de tokens confirmados
- EstadoBadge.tsx - estado "comprado"

---

## Archivo de Configuración

**Ubicación**: `tailwind.config.ts`

```typescript
EcoTracer: {
  primary: "#C8A97A",      // 60% - Dominante (Fondo)
  secondary: "#335C4E",    // 30% - Secundario (Estructura)
  accent: "#A68E6B",       // 10% - Acento (Interacción)
}
```

---

## Flujo de Trazabilidad Reflejado

La paleta refleja el flujo completo de gestión de residuos:

1. **Generador (Empresa)** 🏭
   - Fondo canela suave (primario)
   - Crear lotes con botones en color acento

2. **Transportista** 🚚
   - Panel en fondo dominante
   - Botones de acción en acento

3. **Reciclador** ♻️
   - Fondo primario
   - Badges de "Reciclado" en verde secundario
   - Emitir tokens en color acento

4. **Comprador** 🛍️
   - Interfaz completa con paleta
   - Tokens GRT destacados en acento
   - Estados de compra en secundario

---

## Componentes Actualizados

| Componente | Cambios | Color Usado |
|---|---|---|
| `index.tsx` | Fondo principal del dashboard | Primario |
| `AppSidebar.tsx` | Sidebar con nuevo fondo y estilos | Secundario |
| `Button.tsx` | Variantes default y secondary | Acento / Secundario |
| `StatCard.tsx` | Iconos y badges de tokens | Secundario / Acento |
| `EstadoBadge.tsx` | Estados "reciclado" y "comprado" | Secundario / Acento |
| `LoteTimeline.tsx` | Puntos y badges de proceso | Secundario / Acento |
| `LoginPage.tsx` | Fondo, logo y selección de rol | Primario / Secundario |

---

## Guía de Uso

### Cómo usar los nuevos colores en componentes

**Usar en Tailwind:**
```jsx
// Fondo dominante
<div className="bg-EcoTracer-primary">...</div>

// Fondo secundario
<div className="bg-EcoTracer-secondary text-white">...</div>

// Botones de acción
<Button className="bg-EcoTracer-accent">...</Button>
```

**Usar en estilos inline:**
```jsx
<div style={{ backgroundColor: '#C8A97A' }}>Fondo dominante</div>
<div style={{ backgroundColor: '#335C4E' }}>Fondo secundario</div>
<div style={{ backgroundColor: '#A68E6B' }}>Acento</div>
```

---

## Notas Técnicas

- Los colores están definidos directamente en Tailwind sin necesidad de variables CSS
- La compatibilidad con el sistema existente de `sidebar` se mantiene intacta
- Los colores responden a la accesibilidad visual requerida en las interfaces
- La paleta es consistente en todos los dashboards (Empresa, Transportista, Acopio, Recicladora, Compradora)

---

## ✅ Implementación Completada

- ✅ Configuración en `tailwind.config.ts`
- ✅ Aplicación en AppSidebar
- ✅ Aplicación en Button (variantes default y secondary)
- ✅ Aplicación en StatCard (iconos y tokens)
- ✅ Aplicación en EstadoBadge (reciclado y comprado)
- ✅ Aplicación en LoteTimeline (proceso y tokens)
- ✅ Aplicación en LoginPage (fondo y selección de rol)
- ✅ Aplicación en Index (fondo principal)

