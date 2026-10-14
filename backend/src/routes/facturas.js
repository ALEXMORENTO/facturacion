import { Router } from 'express';
import db from '../db.js';
import { validarFechaPosterior } from '../utils/validaciones.js';

const router = Router();

const listarFacturas = db.prepare(`
  SELECT f.id, f.numero, f.fecha, c.nombre AS cliente_nombre, c.dni AS cliente_dni,
         f.base_centimos, f.iva_centimos, f.total_centimos
  FROM facturas f
  JOIN clientes c ON c.id = f.cliente_id
  ORDER BY f.fecha DESC, f.id DESC
`);
const buscarFactura = db.prepare('SELECT * FROM facturas WHERE id = ?');
const buscarCliente = db.prepare('SELECT * FROM clientes WHERE id = ?');
const buscarProducto = db.prepare('SELECT * FROM productos WHERE id = ?');
const listarLineas = db.prepare('SELECT * FROM lineas_factura WHERE factura_id = ? ORDER BY id');
// Los números tienen siempre 4 cifras (2026-0001), así que ordenarlos como texto funciona
const ultimoNumeroDelAnio = db.prepare(
  'SELECT numero FROM facturas WHERE numero LIKE ? ORDER BY numero DESC LIMIT 1'
);
// Fecha más reciente de todas las facturas (null si todavía no hay ninguna)
const fechaUltimaFactura = db.prepare('SELECT MAX(fecha) AS fecha FROM facturas');
const insertarFactura = db.prepare(`
  INSERT INTO facturas (numero, fecha, cliente_id, base_centimos, iva_centimos, total_centimos, estado)
  VALUES (?, ?, ?, ?, ?, ?, ?)
`);
const insertarLinea = db.prepare(`
  INSERT INTO lineas_factura (factura_id, producto_id, descripcion, cantidad, precio_centimos, iva_porcentaje)
  VALUES (?, ?, ?, ?, ?, ?)
`);

// Acepta solo fechas AAAA-MM-DD que existan en el calendario (rechaza 2026-02-30)
function esFechaValida(texto) {
  if (typeof texto !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(texto)) return false;
  const fecha = new Date(`${texto}T00:00:00Z`);
  return !Number.isNaN(fecha.getTime()) && fecha.toISOString().slice(0, 10) === texto;
}

// Suma las bases de cada tipo de IVA y calcula el IVA una sola vez por tipo,
// redondeando al céntimo más cercano. Todo son enteros: nunca usamos euros con decimales.
// Devuelve también el desglose por tipo de IVA, para poder mostrarlo en la factura.
function calcularTotales(lineas) {
  const basePorTipo = new Map();
  for (const linea of lineas) {
    const baseLinea = linea.precio_centimos * linea.cantidad;
    basePorTipo.set(linea.iva_porcentaje, (basePorTipo.get(linea.iva_porcentaje) ?? 0) + baseLinea);
  }

  let base = 0;
  let iva = 0;
  const ivaPorTipo = [];
  for (const [porcentaje, baseTipo] of basePorTipo) {
    const ivaTipo = Math.round((baseTipo * porcentaje) / 100);
    base += baseTipo;
    iva += ivaTipo;
    ivaPorTipo.push({ iva_porcentaje: porcentaje, base_centimos: baseTipo, iva_centimos: ivaTipo });
  }
  ivaPorTipo.sort((a, b) => a.iva_porcentaje - b.iva_porcentaje);

  return { base, iva, total: base + iva, ivaPorTipo };
}

function siguienteNumero(anio) {
  const ultima = ultimoNumeroDelAnio.get(`${anio}-%`);
  const contador = ultima ? Number(ultima.numero.split('-')[1]) + 1 : 1;
  return `${anio}-${String(contador).padStart(4, '0')}`;
}

router.get('/', (req, res) => {
  res.json(listarFacturas.all());
});

router.get('/:id', (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id <= 0) {
    return res.status(400).json({ error: 'El id de la factura debe ser un número entero positivo' });
  }

  const factura = buscarFactura.get(id);
  if (!factura) {
    return res.status(404).json({ error: 'No existe ninguna factura con ese id' });
  }

  const { cliente_id, ...resto } = factura;
  const lineas = listarLineas.all(id);
  // El desglose sale de las líneas guardadas (con el precio y el IVA de cuando se emitió),
  // con el mismo cálculo que al crearla, así que cuadra con los totales guardados
  const { ivaPorTipo } = calcularTotales(lineas);

  res.json({
    ...resto,
    cliente: buscarCliente.get(cliente_id),
    lineas: lineas.map((linea) => ({ ...linea, importe_centimos: linea.precio_centimos * linea.cantidad })),
    iva_por_tipo: ivaPorTipo,
  });
});

router.post('/', (req, res) => {
  const { cliente_id, fecha, lineas } = req.body ?? {};

  if (!Number.isInteger(cliente_id) || cliente_id <= 0) {
    return res.status(400).json({ error: 'El cliente_id debe ser un número entero positivo' });
  }
  if (!buscarCliente.get(cliente_id)) {
    return res.status(400).json({ error: `No existe ningún cliente con id ${cliente_id}` });
  }

  if (!esFechaValida(fecha)) {
    return res.status(400).json({ error: 'La fecha debe tener el formato AAAA-MM-DD y ser un día real' });
  }

  const errorFecha = validarFechaPosterior(fecha, fechaUltimaFactura.get().fecha);
  if (errorFecha) {
    return res.status(400).json({ error: errorFecha });
  }

  if (!Array.isArray(lineas) || lineas.length === 0) {
    return res.status(400).json({ error: 'La factura debe tener al menos una línea' });
  }

  // Comprobamos todas las líneas antes de guardar nada.
  // El precio y el IVA salen siempre del producto, nunca de lo que mande el cliente.
  const lineasCompletas = [];
  for (const [indice, linea] of lineas.entries()) {
    const numeroLinea = indice + 1;
    const { producto_id, cantidad } = linea ?? {};

    if (!Number.isInteger(producto_id) || producto_id <= 0) {
      return res
        .status(400)
        .json({ error: `Línea ${numeroLinea}: el producto_id debe ser un número entero positivo` });
    }
    if (!Number.isInteger(cantidad) || cantidad <= 0) {
      return res
        .status(400)
        .json({ error: `Línea ${numeroLinea}: la cantidad debe ser un número entero mayor que 0` });
    }

    const producto = buscarProducto.get(producto_id);
    if (!producto) {
      return res
        .status(400)
        .json({ error: `Línea ${numeroLinea}: no existe ningún producto con id ${producto_id}` });
    }

    lineasCompletas.push({
      producto_id,
      descripcion: producto.nombre,
      cantidad,
      precio_centimos: producto.precio_centimos,
      iva_porcentaje: producto.iva_porcentaje,
    });
  }

  const totales = calcularTotales(lineasCompletas);

  // Transacción: o se guardan la factura y todas sus líneas, o no se guarda nada
  db.exec('BEGIN');
  try {
    const numero = siguienteNumero(fecha.slice(0, 4));
    const resultado = insertarFactura.run(
      numero,
      fecha,
      cliente_id,
      totales.base,
      totales.iva,
      totales.total,
      'emitida'
    );
    const facturaId = Number(resultado.lastInsertRowid);

    for (const linea of lineasCompletas) {
      insertarLinea.run(
        facturaId,
        linea.producto_id,
        linea.descripcion,
        linea.cantidad,
        linea.precio_centimos,
        linea.iva_porcentaje
      );
    }

    db.exec('COMMIT');

    res.status(201).json({
      id: facturaId,
      numero,
      fecha,
      cliente_id,
      base_centimos: totales.base,
      iva_centimos: totales.iva,
      total_centimos: totales.total,
      estado: 'emitida',
      lineas: lineasCompletas,
    });
  } catch (error) {
    db.exec('ROLLBACK');
    throw error;
  }
});

export default router;
