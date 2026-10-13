# Esquema del proyecto: Facturín

## 1. Qué hace

- Guardar clientes
- Guardar productos con su precio
- Crear facturas y calcular IVA y total
- Imprimir la factura o guardarla en PDF

## Qué NO hace

- Usuarios y contraseñas
- Envío de emails
- Funcionar en internet (solo en local)

## 2. Las piezas

- Frontend (React): las pantallas que ves en el navegador.
- Backend (Node + Express): recibe las peticiones, comprueba los datos y calcula los totales.
- Base de datos (SQLite): un archivo donde se guarda todo.

Cómo se hablan: Frontend → Backend → Base de datos.
El frontend nunca toca la base de datos directamente.

## 3. Los datos

- clientes: nombre y apellidos, DNI, email, dirección
- productos: nombre, precio, % de IVA
- facturas: fecha, número, cliente, total con IVA, IVA
- lineas_factura: cada producto de una factura y su cantidad

Un cliente tiene muchas facturas y una factura tiene muchas líneas.

Listado de facturas (ordenado por fecha):

| Fecha | Nombre y apellidos | DNI | Total con IVA | IVA |
|---|---|---|---|---|
| 01/10/2026 | Ana López García | 12345678A | 121,00 € | 21,00 € |
| 05/10/2026 | Luis Pérez Martín | 87654321B | 242,00 € | 42,00 € |

## 4. Las pantallas

| Pantalla | Qué se hace |
|---|---|
| Inicio | Ver lo facturado este mes y las últimas facturas |
| Clientes | Ver, añadir y editar clientes |
| Productos | Ver, añadir y editar productos con su precio e IVA |
| Facturas | Listado con fecha, nombre, DNI, total e IVA, ordenado por fecha |
| Nueva factura | Elegir cliente, añadir productos y ver el total calculado |
| Ver factura | Ver la factura completa e imprimirla o guardarla en PDF |

Navegación: menú lateral con Inicio, Clientes, Productos y Facturas.
Desde Facturas se pasa a Nueva factura y a Ver factura.

## 5. Preguntas clave

**¿Qué problema resuelve?**
Hacer facturas a mano (en Word o Excel) es lento y es fácil equivocarse con el IVA, los totales o el número de factura. Facturín guarda los clientes y los productos una vez y, al crear una factura, calcula solo el IVA, el total y el número.

**¿Para quién es?**
Para un autónomo o un negocio pequeño que hace sus facturas desde su propio ordenador, sin internet y sin varios usuarios.

**¿Qué entra en esta primera versión?**

- Añadir y ver clientes.
- Añadir y ver productos con su precio y su IVA (0, 4, 10 o 21 %).
- Crear una factura: elegir cliente, fecha y productos con su cantidad.
- Calcular la base, el IVA y el total (lo hace el backend).
- Poner el número de factura automático por año (2026-0001, 2026-0002…).
- Ver el listado de facturas y una factura completa.
- Imprimir la factura o guardarla en PDF desde el navegador.

**¿Qué se deja para más adelante?**

- Editar y borrar clientes, productos y facturas.
- Facturas rectificativas (para corregir una factura ya emitida).
- Descuentos y líneas escritas a mano (sin producto guardado).
- Cantidades con decimales (por ejemplo, 1,5 horas).
- Usuarios y contraseñas, envío por email y uso por internet.

## 6. Casos raros

Qué hace hoy el backend (`backend/src/`) en cada situación difícil.

| Situación | Qué hace hoy | Estado |
|---|---|---|
| Cliente sin DNI | Se guarda igual: el DNI es opcional y queda vacío. Se le pueden hacer facturas. | ⚠️ Pendiente de decidir: una factura completa debería llevar el DNI/NIF del cliente. |
| Cliente que no existe | Al crear la factura responde con error: "No existe ningún cliente con id …". | ✅ Resuelto |
| Factura sin líneas | Responde con error: "La factura debe tener al menos una línea". | ✅ Resuelto |
| Cantidad 0 o negativa | Responde con error indicando la línea: "la cantidad debe ser un número entero mayor que 0". | ✅ Resuelto |
| Cantidad con decimales (1,5) | También da error: solo acepta números enteros. | ⚠️ Pendiente (se deja para más adelante) |
| Producto que no existe | Responde con error indicando la línea: "no existe ningún producto con id …". | ✅ Resuelto |
| Producto con IVA no válido | Al crear el producto solo acepta 0, 4, 10 o 21. Cualquier otro valor da error. | ✅ Resuelto |
| Producto con precio 0 | Se acepta (sirve para regalos o servicios gratis). Precio negativo da error. | ✅ Resuelto |
| Mismo producto dos veces en una factura | Se aceptan y salen como dos líneas separadas. | ✅ Aceptado así |
| Cambiar el precio de un producto ya facturado | Hoy no se puede editar un producto (no hay ruta para ello). Aun así, cada línea de factura guarda su propia copia del nombre, el precio y el IVA, así que las facturas antiguas no cambiarían. | ⚠️ Pendiente: falta poder editar productos. Las facturas viejas ya están protegidas. |
| Borrar un cliente que tiene facturas | Hoy no se puede borrar ningún cliente (no hay ruta para ello). Si se intentara, la base de datos lo impediría porque las claves foráneas están activadas. | ⚠️ Pendiente: decidir qué hacer (no dejar borrar, o "desactivar" el cliente). |
| Editar los datos de un cliente que ya tiene facturas | Hoy no se puede editar. Pero, ojo: la factura no guarda una copia del cliente, lo lee de la tabla de clientes. Si en el futuro se edita un cliente, sus facturas antiguas mostrarían los datos nuevos. | ❌ Sin resolver: habría que guardar una copia de los datos del cliente en la factura. |
| Factura con fecha anterior a la última | Se acepta sin aviso. Recibe el siguiente número del año, así que puede quedar la 2026-0011 con fecha de enero y la 2026-0010 con fecha de octubre. La ley pide que número y fecha vayan en orden. | ❌ Sin resolver |
| Factura con fecha de otro año o futura | Se acepta. El número sale de la serie del año de la fecha (una factura de 2025 hecha hoy sería la siguiente de 2025). | ❌ Sin resolver |
| Fecha que no existe (30 de febrero) | Responde con error: "La fecha debe tener el formato AAAA-MM-DD y ser un día real". | ✅ Resuelto |
| Falla algo a mitad de guardar | Se usa una transacción: o se guarda todo, o no se guarda nada. | ✅ Resuelto |

## 7. Pseudocódigo: crear una factura

Lo que hace el backend cuando llega la petición `POST /api/facturas` con el cliente, la fecha y las líneas (producto y cantidad).

1. Recibir los datos: `cliente_id`, `fecha` y la lista de `lineas`.
2. Validar el cliente:
   1. Si `cliente_id` no es un número entero positivo → error.
   2. Si no existe ese cliente en la base de datos → error.
3. Validar la fecha: si no tiene el formato AAAA-MM-DD o no es un día real → error.
4. Validar que hay líneas: si la lista está vacía o no es una lista → error.
5. Para cada línea (revisando todas antes de guardar nada):
   1. Si `producto_id` no es un número entero positivo → error con el número de línea.
   2. Si la cantidad no es un número entero mayor que 0 → error con el número de línea.
   3. Buscar el producto en la base de datos. Si no existe → error con el número de línea.
   4. Copiar del producto su nombre, su precio y su IVA. Nunca se usa un precio enviado por el frontend.
6. Agrupar por IVA:
   1. Para cada línea, base de la línea = precio × cantidad (en céntimos).
   2. Sumar las bases de las líneas que tienen el mismo % de IVA (un grupo para el 21 %, otro para el 10 %, etc.).
7. Calcular:
   1. Base total = suma de las bases de todos los grupos.
   2. IVA de cada grupo = base del grupo × % ÷ 100, redondeado al céntimo.
   3. IVA total = suma del IVA de todos los grupos.
   4. Total = base total + IVA total.
8. Empezar la transacción (a partir de aquí, o se guarda todo o nada).
9. Calcular el número automático:
   1. Tomar el año de la fecha (por ejemplo, 2026).
   2. Buscar el número más alto de ese año. Si no hay ninguno, empezar en 1; si lo hay, sumarle 1.
   3. Escribirlo con 4 cifras: `2026-0001`.
10. Guardar la factura (número, fecha, cliente, base, IVA, total y estado "emitida").
11. Guardar cada línea con su copia del nombre, precio, IVA y cantidad.
12. Confirmar la transacción.
13. Si algo falla entre los pasos 9 y 12 → deshacer la transacción (no queda nada guardado) y devolver error.
14. Responder con la factura creada: su número, los totales y las líneas.
