# Decisiones técnicas de Facturín

Este documento explica, una por una, las tecnologías y las decisiones importantes del proyecto. Está pensado para alguien que empieza: cada apartado responde a cuatro preguntas.

- **Qué es**, con una comparación de la vida real.
- **Para qué la usamos aquí**, en este proyecto concreto.
- **Por qué la elegimos.**
- **Qué alternativa descartamos** y por qué.

Al final hay un esquema de cómo se conectan todas las piezas.

---

## 1. React

**Qué es.**
Una librería de JavaScript para construir pantallas web a base de piezas (llamadas *componentes*).
Es como montar con piezas de LEGO: haces una pieza "menú lateral", otra "tabla de facturas", otra "botón de imprimir", y luego las encajas para formar cada pantalla. Si cambias una pieza, cambia en todos los sitios donde la usas.

**Para qué la usamos aquí.**
Para todas las pantallas que ves en el navegador: Inicio, Clientes, Productos, Facturas y Ver factura. Están en `frontend/src/pages/`, y las piezas reutilizables (como el menú lateral) en `frontend/src/components/`.

**Por qué la elegimos.**
- Es la herramienta más usada para hacer pantallas web, así que hay muchísima documentación, tutoriales y respuestas a casi cualquier duda.
- Cuando los datos cambian (por ejemplo, añades un cliente), React actualiza la pantalla solo, sin que tengas que tocar la página a mano.
- Lo que aprendes con React te sirve para muchos otros proyectos.

**Qué alternativa descartamos.**
- **HTML y JavaScript "a pelo" (sin librería):** para una página sencilla vale, pero con seis pantallas, formularios y listas que cambian, el código se vuelve un lío enseguida.
- **Vue o Angular:** son buenas opciones, pero React tiene más comunidad y más ejemplos, lo que ayuda mucho al aprender.

---

## 2. Vite

**Qué es.**
Una herramienta que prepara y sirve el frontend mientras lo programas.
Es como el horno de una cocina: tú escribes la receta (el código React) y Vite la "cocina" para que el navegador la entienda. Además, es un horno muy rápido: en cuanto guardas un cambio, la página se actualiza sola en el navegador.

**Para qué la usamos aquí.**
- Arranca el frontend en `http://localhost:5173` con `npm run dev` dentro de `frontend/`.
- Hace de **intermediario** (proxy): cuando el navegador pide algo que empieza por `/api`, Vite se lo pasa al backend (puerto 3001). Está configurado en `frontend/vite.config.js`.

**Por qué la elegimos.**
- Arranca en un momento y recarga los cambios casi al instante.
- Es la forma recomendada hoy para empezar un proyecto de React.
- El proxy nos ahorra problemas: el navegador cree que todo viene del mismo sitio y no hay que escribir el puerto del backend en el código.

**Qué alternativa descartamos.**
- **Create React App:** era la forma clásica de empezar con React, pero es mucho más lenta y ya no se mantiene.
- **Next.js:** es muy potente, pero mezcla frontend y backend y añade conceptos que no necesitamos para un programa local.

---

## 3. React Router

**Qué es.**
Una librería que decide qué pantalla se ve según la dirección (URL) del navegador.
Es como el recepcionista de un edificio: miras el cartel (`/clientes`, `/facturas/7`) y te manda a la sala correcta, sin salir del edificio.

**Para qué la usamos aquí.**
En `frontend/src/App.jsx` está la lista de rutas:

| Dirección | Pantalla |
|---|---|
| `/` | Inicio |
| `/clientes` | Clientes |
| `/productos` | Productos |
| `/facturas` | Facturas |
| `/facturas/:id` | Ver una factura concreta |
| cualquier otra | Página no encontrada |

El menú lateral se queda fijo y solo cambia la parte central.

**Por qué la elegimos.**
- Es la librería de rutas más usada con React.
- Cada pantalla tiene su propia dirección, así que funcionan los botones de "atrás" y "adelante" del navegador, y puedes guardar en favoritos una factura concreta.
- Cambiar de pantalla es instantáneo, porque no se recarga la página entera.

**Qué alternativa descartamos.**
- **Hacerlo a mano con un `if` que mire una variable "pantalla actual":** funciona al principio, pero perderíamos las direcciones propias, el botón "atrás" y los favoritos.

---

## 4. Node.js 24

**Qué es.**
Un programa que permite ejecutar JavaScript fuera del navegador, directamente en tu ordenador.
Es como sacar a un cocinero de un restaurante (el navegador) y dejarle cocinar en tu casa: el mismo cocinero, el mismo idioma, pero ahora puede hacer cosas que en el restaurante no le dejaban, como leer y guardar archivos.

**Para qué la usamos aquí.**
- Para ejecutar el backend (`backend/src/server.js`).
- Para instalar las dependencias con `npm`, que viene incluido con Node.
- Para hacer funcionar Vite, que también es un programa de Node.

**Por qué la elegimos (y por qué la versión 24).**
- Es JavaScript, el mismo lenguaje que el frontend. Así solo hay que aprender **un** lenguaje para todo el proyecto.
- La versión 24 trae incluido el módulo `node:sqlite` para usar la base de datos sin instalar nada más (ver apartado 6). En versiones antiguas no existe.
- Con `node --watch` el backend se reinicia solo cada vez que guardas un cambio.

**Qué alternativa descartamos.**
- **Python (con Flask o Django) o PHP:** son buenas opciones, pero habría que aprender un segundo lenguaje además de JavaScript.
- **Versiones antiguas de Node (18, 20):** no traen `node:sqlite` de serie y nos obligarían a instalar una librería extra para la base de datos.

---

## 5. Express

**Qué es.**
Una librería para Node que sirve para crear un servidor web: un programa que recibe peticiones y devuelve respuestas.
Es como el camarero de un restaurante: recibe el pedido del cliente ("dame la lista de facturas"), lo lleva a la cocina, comprueba que todo está bien y vuelve con el plato.

**Para qué la usamos aquí.**
Para el backend, que escucha en `http://localhost:3001`. Cada tipo de dato tiene su archivo de rutas en `backend/src/routes/`:

| Ruta | Qué hace |
|---|---|
| `/api/clientes` | Ver y añadir clientes |
| `/api/productos` | Ver y añadir productos |
| `/api/facturas` | Ver y crear facturas (aquí se calculan el IVA, los totales y el número) |
| `/api/divisas` | Pasar el total a dólares, libras y francos suizos |
| `/api/salud` | Responde "estoy encendido" |

También traduce al español los errores, por ejemplo cuando llega un JSON mal escrito.

**Por qué la elegimos.**
- Es la librería de servidor más conocida de Node: hay ejemplos para casi todo.
- Es sencilla: con pocas líneas tienes una ruta funcionando.
- No impone una forma rígida de organizar el código, lo que viene bien en un proyecto pequeño.

**Qué alternativa descartamos.**
- **El servidor que trae Node de serie (`node:http`), sin librería:** se puede, pero hay que escribir a mano cosas que Express ya resuelve (leer el JSON, separar las rutas, gestionar errores).
- **Fastify o NestJS:** son más modernos o más completos, pero tienen menos ejemplos para principiantes (Fastify) o son demasiado complejos para este tamaño de proyecto (NestJS).

---

## 6. SQLite con `node:sqlite`

**Qué es.**
SQLite es una base de datos que guarda toda la información en **un único archivo**. `node:sqlite` es la pieza que viene dentro de Node para leer y escribir en ese archivo.
Es como un archivador con cajones (tablas: clientes, productos, facturas, líneas de factura), pero que cabe entero en una carpeta y puedes copiarlo como cualquier otro archivo.

**Para qué la usamos aquí.**
Para guardar clientes, productos, facturas y las líneas de cada factura. El archivo es `backend/facturacion.db` y se crea solo la primera vez que arrancas el backend (lo hace `backend/src/db.js`, que también crea las tablas).

Dos detalles importantes:
- Activamos las **claves foráneas**, para que la base de datos no deje, por ejemplo, crear una factura de un cliente que no existe.
- Las facturas se guardan con una **transacción**: o se guarda la factura con todas sus líneas, o no se guarda nada.

**Por qué la elegimos.**
- No hay que instalar ni configurar ningún programa aparte: es un archivo.
- Hacer una copia de seguridad es tan fácil como copiar `facturacion.db`.
- Es perfecta para un programa que usa una sola persona en un solo ordenador.
- `node:sqlite` viene incluido en Node 24, así que no hace falta ninguna librería extra.

**Qué alternativa descartamos.**
- **PostgreSQL o MySQL:** son bases de datos muy potentes, pero funcionan como un programa aparte que hay que instalar, arrancar y configurar. Tiene sentido cuando muchas personas usan la aplicación a la vez por internet, que no es nuestro caso.
- **La librería `better-sqlite3`:** hace lo mismo que `node:sqlite`, pero es una dependencia más que instalar y que a veces da problemas al instalarse en Windows.
- **Guardar todo en archivos JSON:** parece más simple, pero no protege los datos (no hay transacciones ni claves foráneas) y buscar o relacionar datos se complica mucho.

---

## 7. Guardar el dinero en céntimos

**Qué es.**
Una regla del proyecto: todos los importes se guardan como **números enteros de céntimos**. Por ejemplo, 12,50 € se guarda como `1250`.
Es como contar monedas de un céntimo en vez de billetes partidos: nunca tienes "medio céntimo" ni "un poquito menos de un céntimo", siempre un número exacto.

**Para qué la usamos aquí.**
- En la base de datos, los campos de dinero se llaman `precio_centimos`, `base_centimos`, `iva_centimos` y `total_centimos`, y son números enteros.
- El frontend solo convierte a euros para **mostrarlos** (`1250` → "12,50 €") y, al revés, cuando escribes un precio. Lo hace `frontend/src/utils/dinero.js`.
- Incluso al pasar a otras divisas, el resultado se redondea al céntimo para seguir con enteros.

**Por qué la elegimos.**
Los ordenadores cometen pequeños errores al sumar números con decimales. Por ejemplo, en JavaScript `0.1 + 0.2` no da `0.3`, sino `0.30000000000000004`. En una factura, esos errores acaban en un céntimo de más o de menos en el total. Con números enteros esos errores no existen y las cuentas siempre cuadran.

**Qué alternativa descartamos.**
- **Guardar los euros con decimales (`12.50`):** es lo primero que se le ocurre a cualquiera, pero tiene justo el problema de redondeo explicado arriba.
- **Usar una librería especial para decimales exactos:** funcionaría, pero añade complejidad que no necesitamos. Los céntimos enteros resuelven lo mismo sin instalar nada.

---

## 8. Los cálculos los hace el backend

**Qué es.**
Otra regla del proyecto: el IVA, la base, el total y el número de factura los calcula **siempre el backend**. El frontend solo los muestra.
Es como en una tienda: el cliente te dice qué quiere y cuántos, pero el precio lo pone la caja registradora, no el cliente.

**Para qué la usamos aquí.**
Al crear una factura, el frontend solo envía el cliente, la fecha y qué productos y cuántos. El backend (`backend/src/routes/facturas.js`):

1. Busca cada producto en la base de datos y copia su nombre, precio e IVA. **Nunca usa un precio que venga del frontend.**
2. Calcula la base de cada línea (precio × cantidad).
3. Agrupa las líneas por % de IVA y calcula el IVA de cada grupo, redondeado al céntimo.
4. Suma la base y el IVA para sacar el total.
5. Pone el número automático del año (`2026-0001`, `2026-0002`…).

**Por qué la elegimos.**
- **Seguridad y fiabilidad:** lo que se ejecuta en el navegador se puede manipular. Si el frontend mandara el total, alguien podría cambiarlo. El backend no se fía de nada que le llegue de fuera.
- **Un solo sitio:** las reglas de cálculo están en un único archivo. Si mañana cambia algo del IVA, se cambia en un sitio y vale para todo.
- **Coherencia:** el número de factura tiene que ser único y seguido. Solo quien guarda en la base de datos puede garantizarlo.

**Qué alternativa descartamos.**
- **Calcular en el frontend y mandar el total ya hecho:** es más rápido de programar al principio, pero es inseguro y repartiría las reglas entre dos sitios. Lo descartamos.

---

## 9. Git + GitHub con `main`, `develop`, ramas y Pull Requests

**Qué es.**
- **Git** es un programa que guarda el historial de todos los cambios del proyecto. Cada vez que guardas un paso (un *commit*), queda una "foto" a la que puedes volver.
- **GitHub** es una web donde se guarda una copia del proyecto con todo su historial.
- **Una rama** es una copia paralela del proyecto donde puedes trabajar sin estropear lo demás.
- **Un Pull Request (PR)** es una petición para unir los cambios de una rama con otra, con la posibilidad de revisarlos antes.

La analogía: Git es como el historial de versiones de un documento, pero mucho más potente. Las ramas son borradores: escribes en tu borrador, y cuando está bien, pides (con un PR) que se pase a limpio al documento oficial.

**Para qué la usamos aquí.**

| Rama | Para qué sirve |
|---|---|
| `main` | Producción: la versión buena y terminada. |
| `develop` | Desarrollo: donde se van juntando las tareas acabadas. |
| `feature/...` | Una funcionalidad nueva (ej.: `feature/divisa`). |
| `chore/...` | Mantenimiento que no cambia lo que hace el programa. |
| `docs/...` | Cambios solo en la documentación (como este archivo). |

Cada tarea sale de `develop` en su propia rama, se sube a GitHub, y entra en `develop` mediante un PR. Cuando `develop` está estable, otro PR la pasa a `main`. Nunca se trabaja directamente en `main` ni en `develop`.

**Por qué la elegimos.**
- Si algo se rompe, puedes volver atrás a una versión que funcionaba.
- Cada tarea va separada: si una sale mal, no estropea las demás.
- El PR obliga a mirar los cambios antes de juntarlos, lo que evita sustos.
- GitHub sirve además de copia de seguridad del código.
- Es la forma de trabajar que se usa en casi cualquier empresa, así que es buena práctica aprenderla.

**Qué alternativa descartamos.**
- **Trabajar sin Git, copiando carpetas (`facturacion-v2`, `facturacion-final`…):** es fácil perderse y no sabes qué cambió entre una y otra.
- **Usar Git con una sola rama `main` para todo:** es más simple, pero cualquier cambio a medias quedaría directamente en la versión "buena".

---

## 10. `concurrently` + `Facturin.bat`

**Qué es.**
- **`concurrently`** es una herramienta que ejecuta varios comandos a la vez en la misma ventana.
- **`Facturin.bat`** es un archivo de Windows que, con un doble clic, ejecuta una lista de órdenes.

La analogía: Facturín necesita dos motores encendidos a la vez (el backend y el frontend). `concurrently` es como una llave que arranca los dos motores de golpe. `Facturin.bat` es el botón de arranque del coche: no tienes que saber nada de la llave, solo pulsar.

**Para qué la usamos aquí.**
- En el `package.json` de la raíz, el comando `npm run dev` usa `concurrently` para arrancar backend y frontend juntos. Cada uno sale con su etiqueta de color: `[backend]` en azul y `[frontend]` en verde. El navegador se abre solo.
- `Facturin.bat` comprueba que Node.js está instalado, la primera vez instala lo que falte, y luego lanza `npm run dev`. Para pararlo, basta con cerrar la ventana.

**Por qué la elegimos.**
- Sin esto, habría que abrir **dos terminales** y escribir un comando en cada una, cada vez que quieras usar el programa.
- Con `Facturin.bat`, cualquier persona puede arrancar Facturín sin abrir una terminal ni saber programar.
- `concurrently` funciona igual en Windows, Mac y Linux.

**Qué alternativa descartamos.**
- **Arrancar a mano con dos terminales:** sigue siendo posible (está explicado en el README), pero es incómodo para el día a día.
- **Usar `&` en el comando para lanzar los dos a la vez:** funciona distinto en Windows que en Mac o Linux, y al pulsar `Ctrl + C` no siempre se paran los dos.
- **Docker:** sirve para empaquetar aplicaciones, pero hay que instalarlo y aprenderlo. Es demasiado para un programa local.

---

## 11. La API Frankfurter

**Qué es.**
Un servicio gratuito de internet que te dice cuánto vale el euro en otras monedas. Los datos vienen del Banco Central Europeo y se actualizan cada día laborable. Una **API** es una "ventanilla" a la que un programa le hace preguntas y recibe respuestas.
Es como llamar al banco para preguntar el cambio del día: tú preguntas "¿a cuánto está el dólar?" y te contestan con el número.

**Para qué la usamos aquí.**
En la pantalla **Ver factura**, debajo del total, se muestra cuánto sería ese total en dólares (USD), libras (GBP) y francos suizos (CHF), con la fecha del cambio.

El camino es este: el frontend pide `/api/divisas?centimos=…` a **nuestro** backend (`backend/src/routes/divisas.js`), y es el backend quien pregunta a Frankfurter, hace la conversión (redondeando a céntimos) y devuelve el resultado.

Si no hay internet o Frankfurter tarda más de 5 segundos, el backend responde con un mensaje de error en español y el resto de la factura se sigue viendo con normalidad. Es la única parte de Facturín que necesita internet.

**Por qué la elegimos.**
- Es gratuita y **no necesita registrarse ni usar una clave** (contraseña de acceso).
- Los datos son oficiales, del Banco Central Europeo.
- Es muy sencilla de usar: una sola dirección web devuelve todo lo que necesitamos.
- La llamamos desde el backend, y no desde el navegador, para respetar la regla de que el frontend solo habla con `/api` y para que la conversión siga las mismas reglas de céntimos que el resto del programa.

**Qué alternativa descartamos.**
- **Otras APIs de cambio de divisa (de pago o con clave):** habría que registrarse y guardar una clave secreta, algo innecesario para este uso.
- **Escribir los tipos de cambio a mano en el código:** serían falsos en cuanto cambiara el mercado al día siguiente.
- **Llamar a Frankfurter directamente desde el frontend:** rompería la regla de que el frontend solo habla con nuestro backend.

---

## Cómo se conectan las piezas

```text
 ┌──────────────────────────┐
 │        NAVEGADOR         │   Lo que ves: Chrome, Edge, Firefox…
 └────────────┬─────────────┘
              │  abres http://localhost:5173
              ▼
 ┌──────────────────────────┐
 │  FRONTEND  (puerto 5173) │   React + React Router, servido por Vite
 │  Pantallas: Inicio,      │   Solo muestra datos y recoge lo que escribes.
 │  Clientes, Productos,    │   Pasa céntimos a euros para enseñarlos.
 │  Facturas, Ver factura   │
 └────────────┬─────────────┘
              │  peticiones a /api/...
              │  (el proxy de Vite las reenvía)
              ▼
 ┌──────────────────────────┐
 │  BACKEND   (puerto 3001) │   Node.js 24 + Express
 │  Comprueba los datos,    │   Calcula IVA, totales y número de factura.
 │  calcula y guarda        │   Todo el dinero en céntimos enteros.
 └──────┬────────────┬──────┘
        │            │
        │ lee y      │ pregunta el cambio del día
        │ escribe    │ (solo para Ver factura, necesita internet)
        ▼            ▼
 ┌──────────────┐  ┌──────────────────────────┐
 │ BASE DE DATOS│  │  API EXTERNA: Frankfurter │
 │ SQLite       │  │  Tipos de cambio del      │
 │ facturacion  │  │  Banco Central Europeo    │
 │ .db          │  │  (USD, GBP, CHF)          │
 └──────────────┘  └──────────────────────────┘
```

Las tres reglas que hay que recordar:

1. **El frontend nunca toca la base de datos ni la API externa.** Solo habla con el backend a través de `/api`.
2. **El backend es el único que calcula y el único que guarda.** Así todas las comprobaciones están en un solo sitio.
3. **El dinero viaja siempre en céntimos enteros.** Solo se convierte a euros en el último momento, para mostrarlo en pantalla.

Y para arrancarlo todo: doble clic en `Facturin.bat` (o `npm run dev` en la raíz), que gracias a `concurrently` enciende el backend y el frontend a la vez.
