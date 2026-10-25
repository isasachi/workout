# Entreno

Tu plan de entrenamiento de 8 semanas en casa, sin material, como app para el iPhone.

- **Hoy**: la sesión que toca según el día y la semana del plan, con una demo animada del primer ejercicio y un botón para empezar.
- **Sesión guiada**: calentamiento, un ejercicio por pantalla con su demo animada, las series para anotar con un toque, descanso de 90 s con aviso sonoro y la pantalla siempre encendida.
- **Variantes**: cada ejercicio tiene su escalera de variantes, de la más fácil a la más difícil. Puedes cambiar en cualquier momento y la app te avisa cuando toca subir.
- **Cardio y HIIT**: cronómetro con las fases del plan (calentamiento, ritmo estable, bloques fuertes y recuperación).
- **Progreso**: tus 8 semanas de un vistazo, el historial de cada ejercicio y una copia de seguridad para exportar o importar.

Los datos se guardan solo en el teléfono (IndexedDB). No hay cuentas ni servidor.

## Desarrollo

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # genera dist/
npm run preview  # sirve dist/ en http://localhost:4173
```

Stack: React 18, TypeScript, Vite y vite-plugin-pwa. Cada pantalla, cada tipo de sesión y cada grupo de animaciones se carga por separado.

## Estructura

```
src/
  data/       el plan: ejercicios y variantes, sesiones, semanas y guía
  demo/       motor de las figuras animadas (rig.ts, Figure.tsx, DemoPlayer.tsx)
    moves/    las posturas de cada movimiento, en cuatro grupos que se cargan por separado
  lib/        fechas, guardado en el teléfono y reglas de progresión
  screens/    pestañas Hoy, Plan y Progreso, y las fichas
  runners/    sesiones guiadas de fuerza, cardio, HIIT y recuperación
  components/ piezas compartidas
dev/          hojas de contacto de las posturas y scripts de capturas (no se publican)
```

### Añadir o corregir un movimiento

Cada movimiento es una lista de posturas clave con su tiempo y su indicación. Los ángulos se miden en grados: 0 apunta hacia abajo, 90 hacia delante y 180 hacia arriba. Con `npm run dev` abierto, `http://localhost:5173/dev/sheet.html?only=squat,pushup` dibuja las posturas en una hoja para revisarlas.

## Publicar en Vercel

1. Sube este repositorio a GitHub.
2. En [vercel.com/new](https://vercel.com/new), importa el repositorio. Vercel detecta Vite solo: build `npm run build`, carpeta `dist`.
3. Cada push a la rama principal publica una versión nueva. La app instalada se actualiza sola la próxima vez que la abras.

## Instalar en el iPhone

1. Abre la dirección de Vercel en **Safari**.
2. Toca **Compartir** y luego **Añadir a pantalla de inicio**.
3. Ábrela desde el icono: se ve a pantalla completa y funciona sin conexión.

Úsala siempre desde el icono. iOS guarda los datos de una app instalada aparte de los de Safari, y no los borra por falta de uso.
