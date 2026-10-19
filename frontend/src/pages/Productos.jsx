import { useEffect, useState } from 'react'
import { crearProducto, listarProductos } from '../api.js'
import { centimosAEuros, eurosACentimos } from '../utils/dinero.js'

// Tipos de IVA que acepta el backend
const TIPOS_IVA = [0, 4, 10, 21]

// El precio se guarda como texto tal cual lo escribe el usuario ("12,50") y se convierte al guardar
const FORMULARIO_VACIO = { nombre: '', precio: '', iva: '21' }

function Productos() {
  const [productos, setProductos] = useState([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')
  const [formulario, setFormulario] = useState(FORMULARIO_VACIO)
  const [guardando, setGuardando] = useState(false)

  // Al abrir la página, pedimos la lista de productos al backend (una sola vez)
  useEffect(() => {
    listarProductos()
      .then((datos) => setProductos(datos))
      .catch((err) => setError(err.message))
      .finally(() => setCargando(false))
  }, [])

  function cambiarCampo(evento) {
    const { name, value } = evento.target
    setFormulario({ ...formulario, [name]: value })
  }

  async function guardar(evento) {
    evento.preventDefault()
    setError('')

    if (formulario.nombre.trim() === '') {
      setError('El nombre es obligatorio')
      return
    }

    // "12,50" -> 1250. Si el texto no es un precio válido, devuelve null
    const precioCentimos = eurosACentimos(formulario.precio)
    if (precioCentimos === null) {
      setError('El precio no es válido. Escríbelo en euros, por ejemplo 12,50')
      return
    }

    setGuardando(true)
    try {
      const nuevo = await crearProducto({
        nombre: formulario.nombre,
        precio_centimos: precioCentimos,
        // El desplegable devuelve texto ("21"); el backend espera un número
        iva_porcentaje: Number(formulario.iva),
      })
      setProductos([...productos, nuevo])
      setFormulario(FORMULARIO_VACIO)
    } catch (err) {
      setError(err.message)
    } finally {
      setGuardando(false)
    }
  }

  return (
    <>
      <h1 className="titulo-pagina">Productos</h1>

      {error && (
        <p className="mensaje-error" role="alert">
          {error}
        </p>
      )}

      {/* noValidate: sin los avisos propios del navegador, para que los errores salgan en rojo y en español */}
      <form className="formulario" onSubmit={guardar} noValidate>
        <label className="campo">
          Nombre *
          <input name="nombre" value={formulario.nombre} onChange={cambiarCampo} required />
        </label>
        <label className="campo">
          Precio (€) *
          <input
            name="precio"
            inputMode="decimal"
            placeholder="12,50"
            value={formulario.precio}
            onChange={cambiarCampo}
            required
          />
        </label>
        <label className="campo">
          IVA
          <select name="iva" value={formulario.iva} onChange={cambiarCampo}>
            {TIPOS_IVA.map((tipo) => (
              <option key={tipo} value={tipo}>
                {tipo} %
              </option>
            ))}
          </select>
        </label>
        <button className="boton" type="submit" disabled={guardando}>
          {guardando ? 'Guardando...' : 'Añadir producto'}
        </button>
      </form>

      {cargando ? (
        <p className="texto-suave">Cargando...</p>
      ) : productos.length === 0 ? (
        <p className="texto-suave">Todavía no hay productos</p>
      ) : (
        // "tabla-scroll": en el móvil la tabla se desliza de lado sin mover la página
        <div className="tabla-scroll">
          <table className="tabla">
            <thead>
              <tr>
                <th>Nombre</th>
                <th className="numero">Precio</th>
                <th className="numero">IVA</th>
              </tr>
            </thead>
            <tbody>
              {productos.map((producto) => (
                <tr key={producto.id}>
                  <td>{producto.nombre}</td>
                  <td className="numero">{centimosAEuros(producto.precio_centimos)}</td>
                  <td className="numero">{producto.iva_porcentaje} %</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  )
}

export default Productos
