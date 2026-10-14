# Decisiones técnicas de Facturín

Este documento explica, una por una, las tecnologías y decisiones del proyecto.
Para cada una verás:

- **Qué es**, con una comparación de la vida real.
- **Para qué la usamos** en Facturín.
- **Por qué la elegimos.**
- **Qué alternativa descartamos** y por qué.

---

## 1. React

**Qué es.** Una librería para construir las pantallas de una aplicación web.
Funciona como un juego de piezas de LEGO: haces piezas pequeñas (un botón, un menú, una tabla)
y las juntas para formar pantallas enteras. Si un dato cambia, React vuelve a pintar solo la pieza afectada.

**Para qué la usamos.** Todo lo que ves en el navegador está hecho con React:
el menú lateral (`frontend/src/components/MenuLateral.jsx`) y las páginas de Inicio, Clientes,
Productos y Facturas (`frontend/src/pages/`).

**Por qué la elegimos.**
- Es la librería más usada: hay muchísimos tutoriales, ejemplos y respuestas a dudas.
- Las piezas se reutilizan: el menú se escribe una vez y aparece en todas las pantallas.
- Actualiza la pantalla sola cuando cambian los datos (por ejemplo, el total de una factura).

**Alternativa descartada: HTML y JavaScript "a mano".** Para una página sencilla vale,
pero con varias pantallas, formularios y listas habría que actualizar cada trozo de la página
manualmente, y el código se vuelve difícil de mantener. También existen Vue o Angular,
pero React tiene más comunidad y material para aprender.

---

## 2. Vite

**Qué es.** La herramienta que prepara y sirve el frontend mientras programamos.
Es como el ayudante de cocina que tiene los ingredientes listos: tú cambias una línea de código
y Vite actualiza el navegador al instante, sin que tengas que recargar.

**Para qué la usamos.**
- Arranca el frontend en `http://localhost:5173` (`npm run dev` dentro de `frontend/`).
- Hace de **intermediario (proxy)**: cuando el navegador pide algo que empieza por `/api`,
  Vite se lo pasa al backend en el puerto 3001. Está configurado en `frontend/vite.config.js`.
  Así el frontend no necesita saber en qué puerto vive el backend.

**Por qué la elegimos.** Arranca en un segundo, se configura con muy pocas líneas
y es la forma recomendada hoy para empezar un proyecto de React.

**Alternativa descartada: Create React App.** Era la opción clásica, pero está abandonada
y es mucho más lenta. Next.js también se descartó: está pensado para webs publicadas en internet
y añade conceptos (renderizado en servidor, etc.) que Facturín, que funciona solo en local, no necesita.

---

## 3. React Router

**Qué es.** Una librería que decide qué pantalla mostrar según la dirección (URL) del navegador.
Es como el cartel de un edificio: si vas a `/clientes` te manda a la sala de Clientes;
si vas a `/facturas/7`, a la factura número 7.

**Para qué la usamos.** En `frontend/src/App.jsx` se define qué página corresponde a cada URL:
`/`, `/facturas`, `/facturas/:id`, `/clientes`, `/productos`, y una página de "no encontrada"
para cualquier otra dirección. El menú lateral se queda fijo y solo cambia el contenido.

**Por qué la elegimos.**
- Cada pantalla tiene su propia URL: se puede usar el botón "Atrás" del navegador
  o guardar en favoritos una factura concreta.
- Es la librería de rutas estándar en React.

**Alternativa descartada: cambiar de pantalla con una variable** ("pantalla actual = clientes").
Es más simple al principio, pero la URL no cambia, el botón "Atrás" no funciona
y al recargar siempre vuelves al inicio.

---

## 4. Node.js 24

**Qué es.** Un programa que permite ejecutar JavaScript fuera del navegador, en el ordenador.
Normalmente JavaScript solo "vive" dentro del navegador; Node.js es como darle una casa propia
para que pueda trabajar por su cuenta: leer archivos, guardar datos o hablar con internet.

**Para qué la usamos.** Es el motor del backend. También lo necesitan las herramientas
de desarrollo (Vite, npm, concurrently).

**Por qué la elegimos.**
- Usamos **el mismo lenguaje (JavaScript)** en el frontend y en el backend: solo hay que aprender uno.
- La **versión 24** trae de serie cosas que antes requerían instalar paquetes extra:
  la base de datos SQLite (`node:sqlite`), `fetch` para llamar a otras webs
  y `node --watch`, que reinicia el backend solo cuando cambias el código.

**Alternativa descartada: Python o PHP para el backend.** Funcionarían igual de bien,
pero obligarían a aprender un segundo lenguaje. Y una versión antigua de Node (por ejemplo la 20)
no trae SQLite incorporado.

---

## 5. Express

**Qué es.** Una librería para crear servidores web con Node.js.
Es como el camarero de un restaurante: recibe los pedidos ("dame los clientes",
"crea esta factura"), los lleva a la cocina y devuelve el plato (la respuesta).

**Para qué la usamos.** En `backend/src/server.js` se crea el servidor en el puerto 3001
y se reparten las peticiones por temas en `backend/src/routes/`:
`/api/clientes`, `/api/productos`, `/api/facturas` y `/api/divisas`.
También devuelve los errores en español.

**Por qué la elegimos.**
- Es el servidor más conocido para Node: muy sencillo y con muchísima documentación.
- Con pocas líneas tienes una API funcionando, sin tener que aprender un gran "framework".

**Alternativa descartada: usar solo el módulo `http` de Node.** Se puede, pero habría que escribir
a mano cosas que Express ya resuelve (leer el JSON de las peticiones, separar rutas, gestionar errores).
Frameworks más grandes como NestJS se descartaron por ser demasiado complejos para este proyecto.

---

## 6. SQLite (`node:sqlite`)

**Qué es.** Una base de datos que cabe en **un solo archivo**.
Es como un archivador de oficina con cajones (tablas): uno para clientes, otro para productos,
otro para facturas y otro para las líneas de cada factura.

**Para qué la usamos.** Todo se guarda en `backend/facturacion.db`.
Las tablas se crean en `backend/src/db.js` la primera vez que arranca el backend.
Usamos `node:sqlite`, el módulo de SQLite que ya viene **incluido en Node.js 24**.

**Por qué la elegimos.**
- **No hay que instalar nada**: ni un programa de base de datos aparte, ni un paquete extra.
- Para hacer una copia de seguridad basta con copiar el archivo `facturacion.db`.
- Facturín lo usa una sola persona en su ordenador, y para eso SQLite es más que suficiente.
- Permite relacionar datos (un cliente tiene muchas facturas) y comprueba que no se rompan esas relaciones.

**Alternativa descartada: PostgreSQL o MySQL.** Son bases de datos potentes pensadas para
muchos usuarios a la vez, pero hay que instalarlas, arrancarlas y configurarlas aparte.
También descartamos el paquete `better-sqlite3`: hace lo mismo, pero hay que instalarlo
y a veces da problemas al compilarse en Windows. Guardar todo en un archivo JSON tampoco
valía: no comprueba relaciones y es fácil que se corrompa.

---

## 7. Guardar el dinero en céntimos

**Qué es.** En lugar de guardar `12,50 €` como número con decimales, guardamos `1250` céntimos
(un número entero). Es como contar monedas en vez de pesar la cartera: cada céntimo es exacto.

**Para qué lo usamos.** En la base de datos todas las columnas de dinero son enteros y terminan en
`_centimos` (`precio_centimos`, `total_centimos`...). Solo al mostrarlo en pantalla se convierte a euros,
con las funciones de `frontend/src/utils/dinero.js` (`1250` → `"12,50 €"`).

**Por qué lo elegimos.** Los ordenadores no saben guardar exactamente algunos decimales.
Por ejemplo, en JavaScript `0.1 + 0.2` da `0.30000000000000004`. Con muchas facturas,
esos pequeños errores acaban descuadrando céntimos en el IVA o en los totales.
Con números enteros, las sumas siempre son exactas.

**Alternativa descartada: guardar euros con decimales** (`12.5`). Es más intuitivo,
pero provoca esos errores de redondeo, y en una factura un céntimo de diferencia es un error.

---

## 8. Los cálculos se hacen en el backend

**Qué es.** El IVA, la base y el total de cada factura los calcula el servidor (backend),
nunca la pantalla (frontend). Es como en una tienda: el cliente puede ver los precios,
pero quien cobra y hace la cuenta es la caja registradora, no el cliente.

**Para qué lo usamos.** El frontend envía qué productos y qué cantidades lleva la factura.
El backend busca los precios, calcula base, IVA y total, y los guarda.
El frontend solo muestra el resultado.

**Por qué lo elegimos.**
- **Una sola fuente de verdad**: el cálculo está en un único sitio, así que no puede haber
  dos resultados distintos.
- **Seguridad**: lo que llega desde el navegador se puede manipular; el backend no se fía
  y lo comprueba todo (ver `backend/src/utils/validaciones.js`).
- Si mañana cambia cómo se calcula algo, se cambia en un solo lugar.

**Alternativa descartada: calcular en el frontend y enviar el total ya hecho.**
Es más rápido de programar, pero el backend tendría que creerse cualquier número que le llegue.

---

## 9. Git + GitHub, con `main`, `develop`, ramas y PRs

**Qué es.**
- **Git** guarda el historial de todos los cambios del código. Es como el "control de cambios"
  de Word, pero para todo el proyecto: puedes ver qué cambió, cuándo y volver atrás.
- **GitHub** es la web donde se guarda una copia del proyecto en internet.
- Una **rama** es una copia paralela del código donde trabajar sin estropear la versión buena.
  Es como hacer un borrador en una hoja aparte antes de pasarlo a limpio.
- Un **PR (Pull Request)** es la petición de "pasa mi borrador a limpio": en GitHub se revisan
  los cambios antes de unirlos.

**Para qué lo usamos.**
- `main` = **producción**: la versión que funciona y se usa.
- `develop` = **desarrollo**: donde se van juntando las novedades antes de pasarlas a `main`.
- Cada tarea va en su propia rama que sale de `develop`: `feature/...` para funciones nuevas,
  `chore/...` para tareas de mantenimiento, `docs/...` para documentación (como esta).
- Al terminar, se abre un PR hacia `develop`; cuando `develop` está estable, otro PR de `develop` a `main`.

**Por qué lo elegimos.**
- Si algo sale mal, se puede volver a una versión anterior.
- `main` nunca se rompe porque nadie trabaja directamente en ella.
- Cada PR deja por escrito qué se cambió y por qué.

**Alternativa descartada: copiar carpetas** (`facturacion-v2`, `facturacion-final-bueno`...).
Es lo que hace mucha gente al empezar, pero es imposible saber qué cambió entre copias.
También descartamos trabajar todo directamente en `main`: más sencillo, pero cualquier error
llega en seguida a la versión que se usa.

---

## 10. `concurrently` + `Facturin.bat`

**Qué es.**
- **concurrently** es una herramienta que arranca varios programas a la vez en una sola ventana.
  Es como un mando a distancia universal que enciende la tele y el equipo de sonido con un botón.
- **Facturin.bat** es un archivo de Windows que se abre con doble clic y arranca todo.

**Para qué lo usamos.**
- En el `package.json` de la raíz, el comando `npm run dev` usa concurrently para arrancar
  a la vez el backend (en azul) y el frontend (en verde), y abre el navegador.
- `Facturin.bat` comprueba que Node.js está instalado, instala las dependencias la primera vez
  y lanza `npm run dev`. Para cerrar Facturín basta con cerrar la ventana.

**Por qué lo elegimos.** Sin esto habría que abrir dos terminales, entrar en dos carpetas
y escribir dos comandos cada vez. Con el `.bat`, quien use Facturín no necesita saber nada de terminales.

**Alternativa descartada: arrancar cada parte a mano en dos terminales.** Funciona,
pero es incómodo y fácil de olvidar. También descartamos convertirlo en una app de escritorio
(con Electron, por ejemplo): sería más "bonito", pero añade mucha complejidad para lo que necesitamos.

---

## 11. API Frankfurter

**Qué es.** Un servicio gratuito en internet que da los **tipos de cambio** del euro
publicados por el Banco Central Europeo. Es como mirar la tabla de cambio de divisas
de la ventanilla del banco, pero preguntándosela a un ordenador.

**Para qué la usamos.** Para mostrar el total de una factura también en dólares (USD),
libras (GBP) y francos suizos (CHF). Lo hace el backend en `backend/src/routes/divisas.js`:
pide los tipos de cambio a Frankfurter, convierte la cantidad (redondeando al céntimo,
para seguir usando enteros) y se la devuelve al frontend.

Si no hay internet o Frankfurter tarda más de 5 segundos, el backend responde con un error claro
y el resto de Facturín sigue funcionando con normalidad.

**Por qué la elegimos.**
- Es **gratuita y no pide registro ni clave**: no hay contraseñas que guardar ni que se puedan filtrar.
- Los datos vienen del Banco Central Europeo, una fuente oficial y fiable.
- La llamamos **desde el backend** (no desde el navegador), siguiendo la regla de que
  el frontend solo habla con nuestro propio `/api`.

**Alternativa descartada: otras APIs de divisas** (como Open Exchange Rates o Fixer).
La mayoría piden registrarse y usar una clave, y su versión gratuita tiene límites.
También descartamos escribir los tipos de cambio a mano: se quedarían desactualizados en seguida.

---

## Cómo se conectan las piezas

```
            ┌───────────────────────────┐
            │        NAVEGADOR          │  Lo que ves y donde haces clic
            └─────────────┬─────────────┘
                          │  http://localhost:5173
                          ▼
            ┌───────────────────────────┐
            │  FRONTEND  (React + Vite) │  Pantallas y formularios.
            │  React Router elige la    │  No calcula totales ni toca
            │  pantalla según la URL    │  la base de datos.
            └─────────────┬─────────────┘
                          │  Peticiones a /api/...
                          │  (el proxy de Vite las reenvía al puerto 3001)
                          ▼
            ┌───────────────────────────┐
            │ BACKEND (Node.js+Express) │  Comprueba los datos,
            │  puerto 3001              │  calcula IVA y totales
            │                           │  (siempre en céntimos)
            └──────┬─────────────┬──────┘
                   │             │
     Lee y guarda  │             │  Pide tipos de cambio
                   ▼             ▼  (solo para /api/divisas)
   ┌────────────────────────┐  ┌──────────────────────────┐
   │ BASE DE DATOS          │  │ API EXTERNA: Frankfurter │
   │ SQLite (node:sqlite)   │  │ (internet, Banco Central │
   │ backend/facturacion.db │  │  Europeo)                │
   └────────────────────────┘  └──────────────────────────┘
```

**Ejemplo: crear una factura.**

1. En el navegador eliges un cliente y añades productos.
2. El frontend envía esos datos a `/api/facturas`.
3. Vite reenvía la petición al backend.
4. El backend comprueba los datos, busca los precios, calcula base, IVA y total en céntimos
   y lo guarda todo en SQLite.
5. El backend responde con la factura ya calculada.
6. El frontend la muestra, convirtiendo los céntimos a euros (`1250` → `12,50 €`).

**Y para arrancarlo todo:** doble clic en `Facturin.bat` → `npm run dev` →
concurrently enciende el backend y el frontend → se abre el navegador.

**Y para guardar los cambios del código:** rama `feature/...` → PR a `develop` → PR a `main` (en GitHub).
