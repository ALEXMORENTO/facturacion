import { useEffect, useRef, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { crearFactura, listarClientes, listarFacturas, listarProductos } from '../api.js'
import SinDato from '../components/SinDato.jsx'
import { centimosAEuros } from '../utils/dinero.js'
import { formatearFecha } from '../utils/fechas.js'

// Fecha de hoy como 'AAAA-MM-DD' en la hora local.
// No usamos toISOString() porque va en hora UTC y de madrugada daría el día anterior.
function hoy() {
  const ahora = new Date()
  const mes = String(ahora.getMonth() + 1).padStart(2, '0')
  const dia = String(ahora.getDate()).padStart(2, '0')
  return `${ahora.getFullYear()}-${mes}-${dia}`
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
  // Sirve para cambiar de página desde el código (al pinchar en una fila)
  const navigate = useNavigate()
  const [facturas, setFacturas] = useState([])
  const [clientes, setClientes] = useState([])
  const [productos, setProductos] = useState([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')
  // Qué campo tiene el error ('cliente', 'fecha', 'producto-3', 'cantidad-3'...), para mostrarlo
  // debajo de ese campo. Vacío si el error es de la factura en general (por ejemplo, del servidor)
  const [campoConError, setCampoConError] = useState('')

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

  // Si venimos del botón "Nueva factura" de Inicio, abrimos el formulario en cuanto
  // estén cargados los clientes y productos. Después borramos el aviso de la dirección
  // para que, al recargar la página, no se vuelva a abrir solo
  const location = useLocation()
  const pidioNuevaFactura = location.state?.nuevaFactura === true

  useEffect(() => {
    if (cargando || !pidioNuevaFactura) return
    abrirFormulario()
    navigate(location.pathname, { replace: true, state: null })
  }, [cargando, pidioNuevaFactura, navigate, location.pathname])

  // Muestra el error debajo del campo y lleva el cursor a él
  function marcarError(campo, mensaje) {
    setError(mensaje)
    setCampoConError(campo)
    document.getElementById(`campo-${campo}`)?.focus()
  }

  // Lo que necesita cada campo para avisar de su error: borde rojo y el mensaje enlazado
  function propsDeError(campo) {
    return campoConError === campo
      ? { 'aria-invalid': true, 'aria-describedby': `error-${campo}` }
      : {}
  }

  function mensajeDeCampo(campo) {
    return (
      campoConError === campo && (
        <span id={`error-${campo}`} className="campo__error" role="alert">
          {error}
        </span>
      )
    )
  }

  function abrirFormulario() {
    setError('')
    setCampoConError('')
    setClienteId('')
    setFecha(hoy())
    setLineas([lineaNueva()])
    setMostrandoFormulario(true)
  }

  function cerrarFormulario() {
    setError('')
    setCampoConError('')
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
    setCampoConError('')

    if (clienteId === '') {
      marcarError('cliente', 'Elige un cliente')
      return
    }
    if (fecha === '') {
      marcarError('fecha', 'Elige la fecha de la factura')
      return
    }
    if (lineas.length === 0) {
      setError('La factura debe tener al menos una línea')
      return
    }

    const lineasParaEnviar = []
    for (const linea of lineas) {
      if (linea.producto_id === '') {
        marcarError(`producto-${linea.id}`, 'Elige un producto')
        return
      }
      const cantidad = leerCantidad(linea.cantidad)
      if (cantidad === null) {
        marcarError(`cantidad-${linea.id}`, 'Escribe un número entero mayor que 0')
        return
      }
      // Los desplegables devuelven texto ("3"); el backend espera números
      lineasParaEnviar.push({ producto_id: Number(linea.producto_id), cantidad })
    }

    setGuardando(true)
    try {
      // Solo mandamos qué se vende y cuánto: precios, IVA y totales los pone el backend
      const nueva = await crearFactura({ cliente_id: Number(clienteId), fecha, lineas: lineasParaEnviar })
      // Abrimos la factura recién emitida; "recienEmitida" le dice a esa página que muestre el aviso de éxito
      navigate(`/facturas/${nueva.id}`, { state: { recienEmitida: true } })
    } catch (err) {
      setError(err.message)
      setGuardando(false)
    }
  }

  const vistaPrevia = calcularVistaPrevia(lineas, productos)

  // Las facturas van en orden de fecha: una nueva no puede ser anterior a la última.
  // El listado viene de la más reciente a la más antigua, así que la última es la primera.
  const fechaMinima = facturas[0]?.fecha

  return (
    <>
      <h1 className="titulo-pagina">Facturas</h1>

      {/* Con el formulario abierto, el error sale junto al botón de emitir (más abajo) */}
      {error && !mostrandoFormulario && (
        <p className="mensaje-error" role="alert">
          {error}
        </p>
      )}

      {!mostrandoFormulario && (
        <button className="boton boton--separado" onClick={abrirFormulario} disabled={cargando}>
          Nueva factura
        </button>
      )}

      {mostrandoFormulario && (
        // noValidate: los errores los mostramos nosotros, en español y junto al botón,
        // en vez de los globos del navegador
        <form className="formulario formulario--columna" onSubmit={guardar} noValidate>
          <div className="fila-campos fila-campos--arriba">
            <label className="campo">
              Cliente *
              <select
                id="campo-cliente"
                value={clienteId}
                onChange={(e) => setClienteId(e.target.value)}
                required
                {...propsDeError('cliente')}
              >
                <option value="">Elige un cliente</option>
                {clientes.map((cliente) => (
                  <option key={cliente.id} value={cliente.id}>
                    {cliente.nombre}
                    {cliente.dni ? ` (${cliente.dni})` : ''}
                  </option>
                ))}
              </select>
              {mensajeDeCampo('cliente')}
            </label>
            <label className="campo">
              Fecha *
              <input
                id="campo-fecha"
                type="date"
                value={fecha}
                min={fechaMinima}
                onChange={(e) => setFecha(e.target.value)}
                required
                {...propsDeError('fecha')}
              />
              {mensajeDeCampo('fecha')}
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
            <div className="fila-campos fila-campos--arriba" key={linea.id}>
              <label className="campo">
                Producto {indice + 1}
                <select
                  id={`campo-producto-${linea.id}`}
                  value={linea.producto_id}
                  onChange={(e) => cambiarLinea(linea.id, 'producto_id', e.target.value)}
                  required
                  {...propsDeError(`producto-${linea.id}`)}
                >
                  <option value="">Elige un producto</option>
                  {productos.map((producto) => (
                    <option key={producto.id} value={producto.id}>
                      {producto.nombre} — {centimosAEuros(producto.precio_centimos)} (IVA{' '}
                      {producto.iva_porcentaje} %)
                    </option>
                  ))}
                </select>
                {mensajeDeCampo(`producto-${linea.id}`)}
              </label>
              <label className="campo">
                Cantidad
                <input
                  id={`campo-cantidad-${linea.id}`}
                  className="campo__cantidad"
                  type="number"
                  min="1"
                  step="1"
                  value={linea.cantidad}
                  onChange={(e) => cambiarLinea(linea.id, 'cantidad', e.target.value)}
                  required
                  {...propsDeError(`cantidad-${linea.id}`)}
                />
                {mensajeDeCampo(`cantidad-${linea.id}`)}
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
            <dt className="vista-previa__total-etiqueta">Total</dt>
            <dd className="vista-previa__total">{centimosAEuros(vistaPrevia.total)}</dd>
          </dl>
          <p className="aviso-emitir">
            Al emitirla se le asigna el siguiente número correlativo y ya no se podrá modificar ni
            borrar. Revisa el cliente, la fecha y las líneas antes de continuar.
          </p>

          {/* Los errores de un campo salen debajo de ese campo; aquí solo los generales */}
          {error && !campoConError && (
            <p className="mensaje-error" role="alert">
              {error}
            </p>
          )}

          <div className="fila-campos">
            <button className="boton" type="submit" disabled={guardando}>
              {guardando ? 'Emitiendo...' : 'Emitir factura'}
            </button>
            <button
              className="boton boton--texto"
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
          // El backend ya las devuelve ordenadas por fecha, de la más reciente a la más antigua.
          // "tabla-scroll": en el móvil la tabla se desliza de lado sin mover la página
          <div className="tabla-scroll">
            <table className="tabla">
              <thead>
                <tr>
                  <th>Nº</th>
                  <th>Fecha</th>
                  <th>Cliente</th>
                  <th>DNI</th>
                  <th className="numero">IVA</th>
                  <th className="numero">Total</th>
                </tr>
              </thead>
              <tbody>
                {facturas.map((factura) => (
                  // Con el ratón, toda la fila lleva al detalle. Con el teclado se llega
                  // por el enlace del número (tabulador + Intro)
                  <tr
                    key={factura.id}
                    className="fila-enlace"
                    onClick={() => navigate(`/facturas/${factura.id}`)}
                  >
                    <td>
                      <Link className="tabla__numero-factura" to={`/facturas/${factura.id}`}>
                        {factura.numero}
                      </Link>
                    </td>
                    <td>{formatearFecha(factura.fecha)}</td>
                    <td>{factura.cliente_nombre}</td>
                    <td>{factura.cliente_dni ?? <SinDato />}</td>
                    <td className="numero">{centimosAEuros(factura.iva_centimos)}</td>
                    <td className="numero tabla__total">{centimosAEuros(factura.total_centimos)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ))}
    </>
  )
}

export default Facturas
