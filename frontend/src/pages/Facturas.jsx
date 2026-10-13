import { useEffect, useRef, useState } from 'react'
import { crearFactura, listarClientes, listarFacturas, listarProductos } from '../api.js'
import { centimosAEuros } from '../utils/dinero.js'

// Fecha de hoy como 'AAAA-MM-DD' en la hora local.
// No usamos toISOString() porque va en hora UTC y de madrugada daría el día anterior.
function hoy() {
  const ahora = new Date()
  const mes = String(ahora.getMonth() + 1).padStart(2, '0')
  const dia = String(ahora.getDate()).padStart(2, '0')
  return `${ahora.getFullYear()}-${mes}-${dia}`
}

// '2026-10-13' -> '13/10/2026'
function formatearFecha(texto) {
  const [anio, mes, dia] = texto.split('-')
  return `${dia}/${mes}/${anio}`
}

// La cantidad se guarda como texto (lo que hay escrito en el input).
// Devuelve el número si es un entero mayor que 0, o null si no lo es.
function leerCantidad(texto) {
  const numero = Number(texto)
  return Number.isInteger(numero) && numero > 0 ? numero : null
}

// Vista previa orientativa de los totales. Imita el cálculo del backend
// (suma la base por tipo de IVA y redondea el IVA una vez por tipo),
// pero el importe que vale es siempre el que devuelve el backend al guardar.
function calcularVistaPrevia(lineas, productos) {
  const basePorTipo = new Map()
  for (const linea of lineas) {
    const producto = productos.find((p) => p.id === Number(linea.producto_id))
    const cantidad = leerCantidad(linea.cantidad)
    // Las líneas a medio rellenar no cuentan todavía
    if (!producto || cantidad === null) continue

    const baseLinea = producto.precio_centimos * cantidad
    const tipo = producto.iva_porcentaje
    basePorTipo.set(tipo, (basePorTipo.get(tipo) ?? 0) + baseLinea)
  }

  let base = 0
  let iva = 0
  for (const [porcentaje, baseTipo] of basePorTipo) {
    base += baseTipo
    iva += Math.round((baseTipo * porcentaje) / 100)
  }
  return { base, iva, total: base + iva }
}

function Facturas() {
  const [facturas, setFacturas] = useState([])
  const [clientes, setClientes] = useState([])
  const [productos, setProductos] = useState([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')

  // Estado del formulario de nueva factura
  const [mostrandoFormulario, setMostrandoFormulario] = useState(false)
  const [clienteId, setClienteId] = useState('')
  const [fecha, setFecha] = useState(hoy())
  const [lineas, setLineas] = useState([])
  const [guardando, setGuardando] = useState(false)

  // Contador para dar a cada línea un id único que no cambia aunque se borren otras.
  // useRef guarda un valor entre repintados sin provocar un repintado al cambiarlo.
  const siguienteIdLinea = useRef(1)

  function lineaNueva() {
    const id = siguienteIdLinea.current
    siguienteIdLinea.current += 1
    return { id, producto_id: '', cantidad: '1' }
  }

  // Al abrir la página, pedimos facturas, clientes y productos a la vez (una sola vez)
  useEffect(() => {
    Promise.all([listarFacturas(), listarClientes(), listarProductos()])
      .then(([datosFacturas, datosClientes, datosProductos]) => {
        setFacturas(datosFacturas)
        setClientes(datosClientes)
        setProductos(datosProductos)
      })
      .catch((err) => setError(err.message))
      .finally(() => setCargando(false))
  }, [])

  function abrirFormulario() {
    setError('')
    setClienteId('')
    setFecha(hoy())
    setLineas([lineaNueva()])
    setMostrandoFormulario(true)
  }

  function cerrarFormulario() {
    setError('')
    setMostrandoFormulario(false)
  }

  // ----- Líneas -----
  function anadirLinea() {
    setLineas([...lineas, lineaNueva()])
  }

  function quitarLinea(id) {
    setLineas(lineas.filter((linea) => linea.id !== id))
  }

  // Cambia un campo ('producto_id' o 'cantidad') de una sola línea y deja las demás igual
  function cambiarLinea(id, campo, valor) {
    setLineas(lineas.map((linea) => (linea.id === id ? { ...linea, [campo]: valor } : linea)))
  }

  async function guardar(evento) {
    // Evita que el navegador recargue la página al enviar el formulario
    evento.preventDefault()
    setError('')

    if (clienteId === '') {
      setError('Elige un cliente')
      return
    }
    if (lineas.length === 0) {
      setError('La factura debe tener al menos una línea')
      return
    }

    const lineasParaEnviar = []
    for (const [indice, linea] of lineas.entries()) {
      if (linea.producto_id === '') {
        setError(`Línea ${indice + 1}: elige un producto`)
        return
      }
      const cantidad = leerCantidad(linea.cantidad)
      if (cantidad === null) {
        setError(`Línea ${indice + 1}: la cantidad debe ser un número entero mayor que 0`)
        return
      }
      // Los desplegables devuelven texto ("3"); el backend espera números
      lineasParaEnviar.push({ producto_id: Number(linea.producto_id), cantidad })
    }

    setGuardando(true)
    try {
      // Solo mandamos qué se vende y cuánto: precios, IVA y totales los pone el backend
      await crearFactura({ cliente_id: Number(clienteId), fecha, lineas: lineasParaEnviar })
      // Volvemos a pedir el listado para que traiga el nombre y DNI del cliente y el orden correcto
      setFacturas(await listarFacturas())
      setMostrandoFormulario(false)
    } catch (err) {
      setError(err.message)
    } finally {
      setGuardando(false)
    }
  }

  const vistaPrevia = calcularVistaPrevia(lineas, productos)

  return (
    <>
      <h1 className="titulo-pagina">Facturas</h1>

      {error && <p className="mensaje-error">{error}</p>}

      {!mostrandoFormulario && (
        <button className="boton boton--separado" onClick={abrirFormulario} disabled={cargando}>
          Nueva factura
        </button>
      )}

      {mostrandoFormulario && (
        <form className="formulario formulario--columna" onSubmit={guardar}>
          <div className="fila-campos">
            <label className="campo">
              Cliente *
              <select value={clienteId} onChange={(e) => setClienteId(e.target.value)} required>
                <option value="">Elige un cliente</option>
                {clientes.map((cliente) => (
                  <option key={cliente.id} value={cliente.id}>
                    {cliente.nombre}
                    {cliente.dni ? ` (${cliente.dni})` : ''}
                  </option>
                ))}
              </select>
            </label>
            <label className="campo">
              Fecha *
              <input type="date" value={fecha} onChange={(e) => setFecha(e.target.value)} required />
            </label>
          </div>

          {clientes.length === 0 && (
            <p className="texto-suave">No hay clientes. Créalos primero en la página Clientes.</p>
          )}
          {productos.length === 0 && (
            <p className="texto-suave">No hay productos. Créalos primero en la página Productos.</p>
          )}

          <h2 className="subtitulo">Líneas</h2>

          {lineas.map((linea, indice) => (
            // "key" con el id de la línea (no con el índice) para que, al quitar una,
            // React no mezcle lo escrito en las demás
            <div className="fila-campos" key={linea.id}>
              <label className="campo">
                Producto {indice + 1}
                <select
                  value={linea.producto_id}
                  onChange={(e) => cambiarLinea(linea.id, 'producto_id', e.target.value)}
                  required
                >
                  <option value="">Elige un producto</option>
                  {productos.map((producto) => (
                    <option key={producto.id} value={producto.id}>
                      {producto.nombre} — {centimosAEuros(producto.precio_centimos)} (IVA{' '}
                      {producto.iva_porcentaje} %)
                    </option>
                  ))}
                </select>
              </label>
              <label className="campo">
                Cantidad
                <input
                  className="campo__cantidad"
                  type="number"
                  min="1"
                  step="1"
                  value={linea.cantidad}
                  onChange={(e) => cambiarLinea(linea.id, 'cantidad', e.target.value)}
                  required
                />
              </label>
              <button
                className="boton boton--secundario"
                type="button"
                onClick={() => quitarLinea(linea.id)}
                aria-label={`Quitar línea ${indice + 1}`}
              >
                Quitar
              </button>
            </div>
          ))}

          <div>
            <button className="boton boton--secundario" type="button" onClick={anadirLinea}>
              + Añadir línea
            </button>
          </div>

          <dl className="vista-previa">
            <dt>Base</dt>
            <dd>{centimosAEuros(vistaPrevia.base)}</dd>
            <dt>IVA</dt>
            <dd>{centimosAEuros(vistaPrevia.iva)}</dd>
            <dt>Total</dt>
            <dd className="vista-previa__total">{centimosAEuros(vistaPrevia.total)}</dd>
          </dl>
          <p className="texto-suave">Importes orientativos: los definitivos los calcula el servidor al guardar.</p>

          <div className="fila-campos">
            <button className="boton" type="submit" disabled={guardando}>
              {guardando ? 'Guardando...' : 'Guardar factura'}
            </button>
            <button
              className="boton boton--secundario"
              type="button"
              onClick={cerrarFormulario}
              disabled={guardando}
            >
              Cancelar
            </button>
          </div>
        </form>
      )}

      {!mostrandoFormulario &&
        (cargando ? (
          <p className="texto-suave">Cargando...</p>
        ) : facturas.length === 0 ? (
          <p className="texto-suave">Todavía no hay facturas</p>
        ) : (
          // El backend ya las devuelve ordenadas por fecha, de la más reciente a la más antigua
          <table className="tabla">
            <thead>
              <tr>
                <th>Fecha</th>
                <th>Cliente</th>
                <th>DNI</th>
                <th className="numero">IVA</th>
                <th className="numero">Total</th>
              </tr>
            </thead>
            <tbody>
              {facturas.map((factura) => (
                <tr key={factura.id}>
                  <td>{formatearFecha(factura.fecha)}</td>
                  <td>{factura.cliente_nombre}</td>
                  <td>{factura.cliente_dni ?? '—'}</td>
                  <td className="numero">{centimosAEuros(factura.iva_centimos)}</td>
                  <td className="numero">{centimosAEuros(factura.total_centimos)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ))}
    </>
  )
}

export default Facturas
