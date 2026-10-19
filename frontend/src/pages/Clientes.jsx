import { useEffect, useState } from 'react'
import { crearCliente, listarClientes } from '../api.js'
import SinDato from '../components/SinDato.jsx'

// Valores del formulario cuando está vacío
const FORMULARIO_VACIO = { nombre: '', dni: '', email: '', direccion: '' }

function Clientes() {
  const [clientes, setClientes] = useState([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')
  const [formulario, setFormulario] = useState(FORMULARIO_VACIO)
  const [guardando, setGuardando] = useState(false)

  // Al abrir la página, pedimos la lista de clientes al backend (una sola vez)
  useEffect(() => {
    listarClientes()
      .then((datos) => setClientes(datos))
      .catch((err) => setError(err.message))
      .finally(() => setCargando(false))
  }, [])

  // Un solo manejador para todos los campos: usa el "name" del input para saber cuál cambia
  function cambiarCampo(evento) {
    const { name, value } = evento.target
    setFormulario({ ...formulario, [name]: value })
  }

  async function guardar(evento) {
    // Evita que el navegador recargue la página al enviar el formulario
    evento.preventDefault()
    setError('')

    if (formulario.nombre.trim() === '') {
      setError('El nombre es obligatorio')
      return
    }

    setGuardando(true)
    try {
      const nuevo = await crearCliente(formulario)
      // Añadimos el cliente que devuelve el backend al final de la lista: la tabla se repinta sola
      setClientes([...clientes, nuevo])
      setFormulario(FORMULARIO_VACIO)
    } catch (err) {
      setError(err.message)
    } finally {
      setGuardando(false)
    }
  }

  return (
    <>
      <h1 className="titulo-pagina">Clientes</h1>

      {error && (
        <p className="mensaje-error" role="alert">
          {error}
        </p>
      )}

      {/* noValidate: sin los avisos propios del navegador, para que el error del backend salga en rojo */}
      <form className="formulario" onSubmit={guardar} noValidate>
        <label className="campo">
          Nombre *
          <input name="nombre" value={formulario.nombre} onChange={cambiarCampo} required />
        </label>
        <label className="campo">
          DNI / NIE / CIF
          <input name="dni" value={formulario.dni} onChange={cambiarCampo} />
        </label>
        <label className="campo">
          Email
          <input name="email" type="email" value={formulario.email} onChange={cambiarCampo} />
        </label>
        <label className="campo">
          Dirección
          <input name="direccion" value={formulario.direccion} onChange={cambiarCampo} />
        </label>
        <button className="boton" type="submit" disabled={guardando}>
          {guardando ? 'Guardando...' : 'Añadir cliente'}
        </button>
      </form>

      {cargando ? (
        <p className="texto-suave">Cargando...</p>
      ) : clientes.length === 0 ? (
        <p className="texto-suave">Todavía no hay clientes</p>
      ) : (
        // "tabla-scroll": en el móvil la tabla se desliza de lado sin mover la página
        <div className="tabla-scroll">
          <table className="tabla">
            <thead>
              <tr>
                <th>Nombre</th>
                <th>DNI</th>
                <th>Email</th>
                <th>Dirección</th>
              </tr>
            </thead>
            <tbody>
              {clientes.map((cliente) => (
                // "key" ayuda a React a saber qué fila es cada una cuando la lista cambia
                <tr key={cliente.id}>
                  <td>{cliente.nombre}</td>
                  <td>{cliente.dni ?? <SinDato />}</td>
                  <td>{cliente.email ?? <SinDato />}</td>
                  <td>{cliente.direccion ?? <SinDato />}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  )
}

export default Clientes
