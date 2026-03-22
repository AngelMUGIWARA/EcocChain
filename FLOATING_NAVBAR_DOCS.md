# 🎯 FloatingNavbar - Documentación de Implementación

## Resumen

Se ha reemplazado la `AppSidebar` fija por un componente **FloatingNavbar** moderno y minimalista que:

- ✅ Flota en el lado derecho de la pantalla
- ✅ Se expande/contrae con animación suave
- ✅ Mantiene la paleta Eco-Blockchain
- ✅ Es completamente responsivo
- ✅ Código limpio y modular

---

## Especificaciones Técnicas

### Comportamiento

| Estado | Ancho | Contenido | Icono Toggle |
|--------|-------|-----------|--------------|
| **Colapsado** | `80px` | Solo iconos | Menu ☰ |
| **Expandido** | `256px` | Iconos + Etiquetas | Close ✕ |

### Animaciones

- **Transición de ancho**: `transition-all duration-300`
- **Fade-in de textos**: `animate-fade-up` en elementos expandidos
- **Hover effects**: Opacity 80% en elementos interactivos
- **Toggle suave**: Iconos del menú se animan con el cambio de estado

---

## Estructura Componente

### Ubicación
```
src/components/FloatingNavbar.tsx
```

### Composición

```
FloatingNavbar (root - fixed position)
├── Floating Container (rounded-2xl, shadow-lg)
│   ├── Header (Toggle Button)
│   │   ├── Menu Toggle (rounded-lg)
│   │   └── Brand Section (solo expandido)
│   ├── User Section
│   │   ├── Role Icon
│   │   ├── User Info (expandido)
│   │   └── Role Switcher Modal (expandido)
│   ├── Navigation (flex-1)
│   │   ├── NavItem (Dashboard) - active
│   │   ├── NavItem (Lotes)
│   │   └── NavItem (Wallet)
│   └── Footer (Logout Button)
```

---

## Paleta de Colores (Eco-Blockchain)

| Elemento | Color | Uso |
|----------|-------|-----|
| **Fondo Container** | `#335C4E` | Verde Pino (base navbar) |
| **Iconos/Texto** | `#F1EFE0` | Blanco Hueso (contenido) |
| **Botón Toggle** | `#A68E6B` | Marrón Canela (acciones) |
| **NavItem Active** | `#C8A97A` | Marrón Canela (activo) |
| **NavItem Inactive** | `rgba(255,255,255,0.1)` | Gris sutil |
| **Borders** | `rgba(255,255,255,0.1)` | Muy sutil |

---

## Integración en Index.tsx

### Cambio Realizado

**Antes**:
```tsx
<div className="flex h-screen overflow-hidden bg-background">
  <AppSidebar />
  <main className="flex-1 overflow-y-auto bg-background p-6 md:p-8">
```

**Después**:
```tsx
<div className="h-screen overflow-hidden bg-background">
  <FloatingNavbar />
  <main className="h-screen w-full overflow-y-auto bg-background p-6 md:p-8 pr-24">
```

### Ajustes

- **Padding derecho adicional**: `pr-24` para evitar que el contenido quede bajo el navbar
- **Layout**: De `flex` a contenedor único (navbar es `position: fixed`)
- **Ancho main**: `w-full` en lugar de `flex-1`

---

## Características Implementadas

### 1. Toggle Hamburguesa
- Botón fijo en el header
- Cambia entre Menu (☰) y Close (✕)
- Anima el estado del navbar completo
- Color: Marrón Canela (#A68E6B)

### 2. Menú Principal
- **Dashboard**: NavItem activo (estado por defecto)
- **Lotes**: NavItem inactivo
- **Wallet**: NavItem inactivo
- Cambio de color en hover (#C8A97A)

### 3. Selector de Rol (Demo)
- Accesible desde el icono de usuario
- Solo visible cuando navbar está expandido
- Muestra todos los roles disponibles
- Cambio instantáneo de rol y cierre automático

### 4. Sección de Usuario
- Icon del rol en estado colapsado
- Nombre y rol en estado expandido
- Animaciones fade-in suaves

### 5. Logout
- Botón en footer
- Icono visible siempre
- Etiqueta solo en estado expandido

---

## Animaciones CSS

### Fade-up (textos entrada)
```css
opacity-0 animate-fade-up { animationFillMode: 'forwards' }
duration: 0.6s
```

### Scale-in (modal selector rol)
```css
animate-scale-in
duration: 0.4s
```

### Transición de ancho
```css
transition-all duration-300
w-20 (colapsado) / w-64 (expandido)
```

---

## Estados del Componente

### isExpanded
- **false**: Navbar colapsado (80px)
  - Solo iconos visibles
  - Textos hidden
  - Menu/Lotes/Wallet como botones icon

- **true**: Navbar expandido (256px)
  - Iconos + etiquetas
  - Textos fade-in suave
  - Menú completo visible

### showRoleSwitcher
- **false**: Selector de rol hidden
- **true**: Modal de roles visible (solo si expanded)
- Se cierra automáticamente al seleccionar un rol

---

## Responsividad

### Mobile (< 768px)
- Navbar sigue fijo en lado derecho
- Padding `pr-24` asegura visible
- Toggle facilita compactar navbar

### Desktop (≥ 768px)
- Navbar flotante no interfiere
- Contenido principal utiliza espacio completo (menos pr-24)
- Hover effects mejoran UX

---

## Props y Funciones

### FloatingNavbar Component

**Props**: None (utiliza `useAuth` context)

**Hooks**:
- `useAuth()`: Acceso a usuario, switchRole, disconnect
- `useState` para `isExpanded` y `showRoleSwitcher`

### NavItem Subcomponent

**Props**:
```tsx
{
  icon: React.ReactNode;
  label: string;
  active?: boolean;
  isExpanded?: boolean;
}
```

---

## Archivos Modificados

1. **Creado**: `src/components/FloatingNavbar.tsx` (nuevo componente)
2. **Modificado**: `src/pages/Index.tsx` (reemplaza AppSidebar)
3. **Sin cambios**: `src/components/AppSidebar.tsx` (mantiene para compatibilidad)

---

## Próximas Mejoras (Opcionales)

1. **Rutas activas**: Detectar página actual y marcar NavItem como `active`
2. **Tooltips**: En estado colapsado, mostrar tooltip al hover
3. **Animaciones enlace**: Subraya o highlight en hover
4. **Tema oscuro**: Variables para dark mode
5. **Persistencia**: Guardar estado expandido/colapsado en localStorage

---

## Testing

### Checklist Manual

- [ ] Toggle funciona (expanded/collapsed)
- [ ] Brainstorm lógica correcto
- [ ] Role switcher abre/cierra
- [ ] Logout desconecta
- [ ] Animaciones suaves
- [ ] Colores correctos
- [ ] Responsive en mobile
- [ ] No hay overflow de contenido

---

## Código de Ejemplo - Uso

```tsx
// En Index.tsx
import { FloatingNavbar } from '@/components/FloatingNavbar';

export default function Index() {
  const { user } = useAuth();

  if (!user) return <LoginPage />;

  return (
    <div className="h-screen overflow-hidden bg-background">
      <FloatingNavbar />
      <main className="h-screen w-full overflow-y-auto bg-background p-6 md:p-8 pr-24">
        {/* Contenido del dashboard */}
      </main>
    </div>
  );
}
```

---

## Variables CSS Personalizables

Para ajustar el navbar, modifica estas propiedades en `FloatingNavbar.tsx`:

```tsx
// Ancho colapsado (línea 33)
w-20  // Cambiar a w-16 o w-24 si deseas

// Ancho expandido (línea 33)
w-64  // Cambiar a w-72 o w-80

// Bordes redondeados (línea 37)
rounded-2xl  // Cambiar a rounded-3xl para más curva

// Sombra (línea 37)
shadow-lg  // Cambiar a shadow-xl para mayor profundidad

// Duración animación (línea 33)
duration-300  // Cambiar a duration-200 para más rápido
```

