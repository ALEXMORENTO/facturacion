# Esquema del proyecto: Facturín

## 1. Qué hace

* Guardar clientes
* Guardar productos con su precio
* Crear facturas y calcular IVA y total
* Imprimir la factura o guardarla en PDF

## Qué NO hace

* Usuarios y contraseñas
* Envío de emails
* Funcionar en internet (solo en local)



## 2. Las piezas

- Frontend (React): las pantallas que ves en el navegador.

- Backend (Node + Express): recibe las peticiones, comprueba los datos y calcula los totales.

- Base de datos (SQLite): un archivo donde se guarda todo.



Cómo se hablan: Frontend → Backend → Base de datos.

El frontend nunca toca la base de datos directamente.

