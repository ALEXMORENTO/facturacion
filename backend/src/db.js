import { DatabaseSync } from 'node:sqlite';
import { fileURLToPath } from 'node:url';

// Ruta absoluta a backend/facturacion.db, sin depender de la carpeta desde la que se arranque
const rutaDb = fileURLToPath(new URL('../facturacion.db', import.meta.url));

const db = new DatabaseSync(rutaDb);

// SQLite no comprueba las claves foráneas salvo que se active en cada conexión
db.exec('PRAGMA foreign_keys = ON;');

db.exec(`
  CREATE TABLE IF NOT EXISTS clientes (
    id        INTEGER PRIMARY KEY AUTOINCREMENT,
    nombre    TEXT NOT NULL,
    dni       TEXT,
    email     TEXT,
    direccion TEXT
  );

  CREATE TABLE IF NOT EXISTS productos (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    nombre          TEXT NOT NULL,
    precio_centimos INTEGER NOT NULL,
    iva_porcentaje  INTEGER NOT NULL
  );

  CREATE TABLE IF NOT EXISTS facturas (
    id             INTEGER PRIMARY KEY AUTOINCREMENT,
    numero         TEXT NOT NULL UNIQUE,
    fecha          TEXT NOT NULL,
    cliente_id     INTEGER NOT NULL REFERENCES clientes(id),
    base_centimos  INTEGER NOT NULL,
    iva_centimos   INTEGER NOT NULL,
    total_centimos INTEGER NOT NULL,
    estado         TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS lineas_factura (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    factura_id      INTEGER NOT NULL REFERENCES facturas(id),
    producto_id     INTEGER REFERENCES productos(id),
    descripcion     TEXT NOT NULL,
    cantidad        INTEGER NOT NULL,
    precio_centimos INTEGER NOT NULL,
    iva_porcentaje  INTEGER NOT NULL
  );
`);

export default db;
