import { Router } from 'express';
import db from '../db.js';

const router = Router();

// Tipos de IVA vigentes en España: exento, superreducido, reducido y general
const TIPOS_IVA = [0, 4, 10, 21];

const listarProductos = db.prepare('SELECT * FROM productos ORDER BY id');
const insertarProducto = db.prepare(
  'INSERT INTO productos (nombre, precio_centimos, iva_porcentaje) VALUES (?, ?, ?)'
);

router.get('/', (req, res) => {
  res.json(listarProductos.all());
});

router.post('/', (req, res) => {
  const { nombre, precio_centimos, iva_porcentaje } = req.body ?? {};

  if (typeof nombre !== 'string' || nombre.trim() === '') {
    return res.status(400).json({ error: 'El nombre es obligatorio' });
  }

  // Number.isInteger rechaza decimales (12.5), textos ("1250") y valores ausentes
  if (!Number.isInteger(precio_centimos) || precio_centimos < 0) {
    return res
      .status(400)
      .json({ error: 'El precio_centimos debe ser un número entero mayor o igual que 0' });
  }

  if (!TIPOS_IVA.includes(iva_porcentaje)) {
    return res
      .status(400)
      .json({ error: 'El iva_porcentaje debe ser 0, 4, 10 o 21' });
  }

  const producto = { nombre: nombre.trim(), precio_centimos, iva_porcentaje };

  const resultado = insertarProducto.run(
    producto.nombre,
    producto.precio_centimos,
    producto.iva_porcentaje
  );

  res.status(201).json({ id: Number(resultado.lastInsertRowid), ...producto });
});

export default router;
