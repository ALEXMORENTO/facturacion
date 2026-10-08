// Todas las llamadas al backend pasan por aquí.
// Usamos rutas que empiezan por /api y el proxy de Vite las reenvía a http://localhost:3001.

// Hace la petición, convierte la respuesta en JSON y, si algo falla,
// lanza un Error con el mensaje en español que devuelve el backend.
async function pedir(ruta, opciones = {}) {
  let respuesta
  try {
    respuesta = await fetch(`/api${ruta}`, opciones)
  } catch {
    throw new Error('No se ha podido conectar con el servidor')
  }

  // Si el backend está apagado, el proxy responde con un error que no es JSON
  const datos = await respuesta.json().catch(() => null)

  if (!respuesta.ok) {
    throw new Error(datos?.error ?? `Error ${respuesta.status} al llamar a ${ruta}`)
  }
  return datos
}

// Para las peticiones POST: manda el objeto como JSON y avisa al backend de que lo es
function enviar(ruta, cuerpo) {
  return pedir(ruta, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(cuerpo),
  })
}

// ----- Salud -----
export const comprobarServidor = () => pedir('/salud')

// ----- Clientes -----
export const listarClientes = () => pedir('/clientes')

// cliente: { nombre, dni?, email?, direccion? }
export const crearCliente = (cliente) => enviar('/clientes', cliente)

// ----- Productos -----
export const listarProductos = () => pedir('/productos')

// producto: { nombre, precio_centimos, iva_porcentaje }
export const crearProducto = (producto) => enviar('/productos', producto)

// ----- Facturas -----
export const listarFacturas = () => pedir('/facturas')

export const obtenerFactura = (id) => pedir(`/facturas/${id}`)

// factura: { cliente_id, fecha: 'AAAA-MM-DD', lineas: [{ producto_id, cantidad }] }
export const crearFactura = (factura) => enviar('/facturas', factura)
