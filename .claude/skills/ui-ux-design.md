# Skill: React & Tailwind UI Excellence
Description: Estándares de diseño para interfaces Web3 limpias y profesionales.

## Reglas de Diseño
- **Mobile First:** Usa siempre clases prefijadas (md:lg:) para responsividad.
- **Micro-interacciones:** Todo botón de transacción debe tener `active:scale-95` y `transition-all`.
- **Estados de Carga:** Implementa Skeletons o Spinners mientras la blockchain procesa (Stellar tarda ~5s).
- **Tailwind Puro:** Evita valores arbitrarios como `w-[342px]`, usa la escala `w-80` o similares.