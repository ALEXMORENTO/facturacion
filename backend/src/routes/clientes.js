import { Router } from 'express';
import db from '../db.js';
import { normalizarDocumento, validarDniNif, validarEmail } from '../utils/validaciones.js';

const router = Router();

// Los "?" son huecos que SQLite rellena con los valores que pasamos a run()/all(),
// así nunca pegamos texto del usuario dentro de la consulta SQL
const listarClientes = db.prepare('SELECT * FROM clientes ORDER BY id');
const insertarCliente = db.prepare(
  'INSERT INTO clientes (nombre, dni, email, direccion) VALUES (?, ?, ?, ?)'
);

router.get('/', (req, res) => {
  res.json(listarClientes.all());
});

router.post('/', (req, res) => {
  // Sin cuerpo JSON, Express 5 deja req.body como undefined
  const { nombre, dni, email, direccion } = req.body ?? {};

  if (typeof nombre !== 'string' || nombre.trim() === '') {
    return res.status(400).json({ error: 'El nombre es obligatorio' });
  }

  // Los campos opcionales pueden faltar, pero si vienen tienen que ser texto
  const opcionales = { dni, email, direccion };
  for (const [campo, valor] of Object.entries(opcionales)) {
    if (valor !== undefined && valor !== null && typeof valor !== 'string') {
      return res.status(400).json({ error: `El campo ${campo} debe ser texto` });
    }
  }

  // Guardamos null en vez de cadenas vacías para los campos opcionales
  const limpiar = (valor) => (valor && valor.trim() !== '' ? valor.trim() : null);

  const cliente = {
    nombre: nombre.trim(),
    // El DNI se guarda siempre igual escrito (sin espacios ni guiones y en mayúsculas)
    dni: limpiar(dni) ? normalizarDocumento(dni) || null : null,
    email: limpiar(email),
    direccion: limpiar(direccion),
  };

  // DNI y email siguen siendo opcionales, pero si vienen tienen que ser válidos
  if (cliente.dni) {
    const error = validarDniNif(cliente.dni);
    if (error) return res.status(400).json({ error });
  }
  if (cliente.email) {
    const error = validarEmail(cliente.email);
    if (error) return res.status(400).json({ error });
  }

  const resultado = insertarCliente.run(
    cliente.nombre,
    cliente.dni,
    cliente.email,
    cliente.direccion
  );

  res.status(201).json({ id: Number(resultado.lastInsertRowid), ...cliente });
});

export default router;
