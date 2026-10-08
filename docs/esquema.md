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
