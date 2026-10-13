# Facturación — reglas del proyecto

## Stack
- Frontend: React + Vite, en `frontend/`.
- Backend: Node + Express, en `backend/`.
- Base de datos: SQLite con el módulo nativo `node:sqlite`.

## Dinero
- El dinero se guarda y se maneja siempre en céntimos (números enteros). Ejemplo: 12,50 € = `1250`.
- Los totales y el IVA los calcula el backend. El frontend solo los muestra.

## Arquitectura
- El frontend nunca accede a la base de datos. Solo habla con el backend a través de `/api`.

## Idioma
- El código, los textos de la interfaz y los mensajes de error van en español.

## Ramas
- `main` = producción. `develop` = desarrollo.
- Cada tarea va en una rama `feature/...` o `chore/...` que sale de `develop`.

## Git
- No hagas commits, push ni merge: los hace el usuario.
- No toques `main` ni `develop` directamente.

## Cómo explicar
- El usuario es principiante: explica los cambios con palabras sencillas.
