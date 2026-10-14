# Facturín: programa de facturación en local

Facturín es un programa para hacer facturas desde tu propio ordenador. Guardas tus clientes y tus productos una vez y, al crear una factura, el programa calcula solo el IVA, el total y el número de factura. Después puedes ver la factura, imprimirla o guardarla en PDF.

Está pensado para un autónomo o un negocio pequeño que trabaja en un solo ordenador, sin internet y sin varios usuarios.

## Qué se puede hacer

- Añadir y ver clientes (nombre, DNI, email y dirección).
- Añadir y ver productos con su precio y su IVA (0, 4, 10 o 21 %).
- Crear una factura: elegir cliente, fecha y productos con su cantidad.
- Ver el listado de facturas, ordenado por fecha.
- Ver una factura completa, con el desglose del IVA, e imprimirla o guardarla en PDF desde el navegador.

Lo que queda para más adelante (editar y borrar, facturas rectificativas, descuentos, cantidades con decimales, usuarios…) está explicado en [`docs/esquema.md`](docs/esquema.md).

## Stack elegido y por qué

| Pieza | Tecnología | Por qué |
|---|---|---|
| Frontend (las pantallas) | React + Vite | React es la herramienta más usada para hacer pantallas web y tiene mucha documentación. Vite arranca al momento y recarga la página sola al guardar un cambio. |
| Backend (el servidor) | Node + Express | Se programa en JavaScript, el mismo lenguaje que el frontend, así que solo hay que aprender uno. Express es sencillo y muy conocido. |
| Base de datos | SQLite con `node:sqlite` | Toda la información se guarda en un único archivo, sin instalar ningún programa aparte. `node:sqlite` viene ya incluido en Node, así que no hace falta ninguna librería extra. |

## Requisitos

- **Node.js 24** (incluye `npm`). Se descarga en [nodejs.org](https://nodejs.org/).
  Hace falta esta versión porque el módulo `node:sqlite` solo existe en las versiones recientes de Node.
- Git, para descargar el proyecto.

Para comprobar qué versión tienes, abre una terminal y escribe:

```bash
node --version
```

Debe salir algo que empiece por `v24`.

## Instalación

Descarga el proyecto e instala las dependencias. Hay tres grupos: las de la raíz (la herramienta que arranca todo a la vez), las del backend y las del frontend. Un solo comando instala las tres:

```bash
git clone https://github.com/ALEXMORENTO/facturacion.git
cd facturacion
npm run instalar
```

> Si usas `Facturin.bat` (ver abajo), no hace falta este paso: la primera vez instala solo lo que falte.

## Cómo arrancarlo

El programa son dos partes que funcionan a la vez: el backend (el servidor) y el frontend (las pantallas). Hay dos formas fáciles de encender las dos de golpe.

### Forma 1 — Doble clic en `Facturin.bat` (Windows)

En la carpeta del proyecto, haz **doble clic en `Facturin.bat`**. Se abre una ventana negra que:

1. Comprueba que tienes Node.js instalado.
2. La primera vez, instala las dependencias que falten (tarda un poco).
3. Enciende el backend y el frontend, y abre el navegador solo en `http://localhost:5173`.

Para pararlo, **cierra esa ventana** (o pulsa `Ctrl + C` dentro de ella).

### Forma 2 — Un solo comando en la terminal

Desde la carpeta raíz del proyecto (`facturacion/`):

```bash
npm run dev
```

Esto usa [`concurrently`](https://www.npmjs.com/package/concurrently), una herramienta que ejecuta varios comandos a la vez en la misma terminal. Verás los mensajes de las dos partes mezclados, cada uno con su etiqueta de color: `[backend]` en azul y `[frontend]` en verde. El navegador se abre solo.

Para pararlo, pulsa `Ctrl + C` (se paran las dos partes).

### Forma manual — Dos terminales (opcional)

Si prefieres ver cada parte por separado, también puedes arrancarlas a mano en **dos terminales**.

**Terminal 1 — backend:**

```bash
cd backend
npm run dev
```

Verás `Servidor escuchando en http://localhost:3001`. La primera vez se crea solo el archivo de la base de datos, `backend/facturacion.db`, con sus tablas vacías.

**Terminal 2 — frontend:**

```bash
cd frontend
npm run dev
```

Abre en el navegador la dirección que aparece (normalmente `http://localhost:5173`).

Para pararlos, pulsa `Ctrl + C` en cada terminal.

> **¿Cómo se hablan las dos partes?** El frontend pide los datos a rutas que empiezan por `/api`. Vite (el servidor del frontend) reenvía esas peticiones al backend en el puerto 3001. Esto está configurado en `frontend/vite.config.js`. Si el backend está apagado, las pantallas mostrarán el aviso "No se ha podido conectar con el servidor".

## Estructura de carpetas

```text
facturacion/
├── backend/                  Servidor (Node + Express)
│   ├── src/
│   │   ├── server.js         Arranca el servidor y conecta las rutas
│   │   ├── db.js             Abre la base de datos y crea las tablas
│   │   └── routes/
│   │       ├── clientes.js   /api/clientes
│   │       ├── productos.js  /api/productos
│   │       └── facturas.js   /api/facturas (cálculo del IVA, totales y número)
│   └── facturacion.db        La base de datos (se crea sola, no se sube a Git)
│
├── frontend/                 Pantallas (React + Vite)
│   ├── src/
│   │   ├── main.jsx          Punto de entrada de React
│   │   ├── App.jsx           Decide qué página se ve según la dirección
│   │   ├── api.js            Todas las llamadas al backend
│   │   ├── components/       Piezas reutilizables (menú lateral)
│   │   ├── pages/            Una página por pantalla: Inicio, Clientes,
│   │   │                     Productos, Facturas, Ver factura…
│   │   └── utils/            Ayudas: pasar céntimos a euros, formatear fechas
│   └── vite.config.js        Configuración de Vite (incluye el reenvío a /api)
│
├── docs/
│   └── esquema.md            Diseño del proyecto: datos, pantallas, casos raros
├── package.json              Scripts de la raíz: "npm run dev" arranca todo
├── Facturin.bat              Arranque con doble clic en Windows
├── CLAUDE.md                 Reglas del proyecto
└── README.md                 Este archivo
```

## Cómo funciona

### Las piezas y quién habla con quién

```text
Navegador (frontend)  →  Backend (/api)  →  Base de datos (SQLite)
```

El frontend **nunca** toca la base de datos. Solo pide cosas al backend, y el backend es el único que lee y escribe en ella. Así todas las comprobaciones y los cálculos están en un solo sitio.

### El dinero se guarda en céntimos

Todos los importes se guardan como **números enteros de céntimos**. Por ejemplo, 12,50 € se guarda como `1250`.

¿Por qué? Los ordenadores cometen pequeños errores al sumar números con decimales (por ejemplo, `0.1 + 0.2` no da exactamente `0.3`). Con céntimos enteros esos errores desaparecen y las cuentas siempre cuadran.

El frontend solo convierte los céntimos a euros para mostrarlos (`1250` → "12,50 €") y, al revés, cuando el usuario escribe un precio (archivo `frontend/src/utils/dinero.js`).

### El IVA y los totales los calcula el backend

El frontend solo envía el cliente, la fecha y qué productos y cuántos. El precio y el IVA de cada línea los saca el backend del producto guardado; nunca se fía de un precio que le llegue desde fuera.

El cálculo (en `backend/src/routes/facturas.js`) es así:

1. Base de cada línea = precio × cantidad.
2. Se suman las bases que tienen el mismo % de IVA (un grupo para el 21 %, otro para el 10 %…).
3. El IVA se calcula una vez por grupo y se redondea al céntimo.
4. Total = base total + IVA total.

Cada línea guarda una copia del nombre, el precio y el IVA del producto en ese momento. Así, aunque en el futuro cambie el precio de un producto, las facturas antiguas no cambian.

Además, la factura y sus líneas se guardan dentro de una **transacción**: o se guarda todo, o no se guarda nada. Nunca queda una factura a medias.

### Número de factura automático

El número se pone solo, con el año de la fecha de la factura y un contador de 4 cifras que empieza de nuevo cada año:

```text
2026-0001, 2026-0002, 2026-0003…
2027-0001, …
```

Para calcularlo, el backend busca el número más alto de ese año y le suma 1. Si es la primera factura del año, empieza en `0001`.

## Flujo de Git

El proyecto se ha trabajado con ramas y Pull Requests (PRs) en GitHub:

| Rama | Para qué sirve |
|---|---|
| `main` | Producción: la versión buena y terminada. |
| `develop` | Desarrollo: donde se van juntando las tareas acabadas. |
| `feature/...` | Una funcionalidad nueva. Ej.: `feature/nuevas-facturas`, `feature/ver-imprimir`. |
| `chore/...` | Tareas de mantenimiento que no cambian lo que hace el programa. Ej.: `chore/gitignore-claude`. |
| `docs/...` | Cambios solo en la documentación. Ej.: `docs/completa-esquema`, `docs/README`. |

Los pasos de cada tarea:

1. Partir siempre de `develop` actualizado y crear una rama nueva para la tarea:
   ```bash
   git switch develop
   git pull
   git switch -c feature/nombre-de-la-tarea
   ```
2. Hacer los cambios y guardarlos con commits pequeños. Los mensajes siguen el formato *conventional commits*: `feat:` (algo nuevo), `fix:` (arreglo), `docs:` (documentación), `chore:` (mantenimiento).
3. Subir la rama a GitHub con `git push -u origin feature/nombre-de-la-tarea`.
4. Abrir un **Pull Request** hacia `develop`, revisarlo y fusionarlo (merge).
5. Cuando `develop` está estable, se abre un Pull Request de `develop` a `main` para pasarlo a producción.

Nunca se trabaja directamente sobre `main` ni sobre `develop`: todo entra a través de un Pull Request.
