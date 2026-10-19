import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { listarFacturas } from '../api.js'
import { centimosAEuros } from '../utils/dinero.js'
import { formatearFecha } from '../utils/fechas.js'
import imagenNegocios from '../assets/inicio-negocios.svg'

// Cuántas facturas recientes se ven en la página de inicio
const CUANTAS_ULTIMAS = 5

function Inicio() {
  const [facturas, setFacturas] = useState([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    listarFacturas()
      .then(setFacturas)
      .catch((err) => setError(err.message))
      .finally(() => setCargando(false))
  }, [])

  // El backend las devuelve de la más reciente a la más antigua: las primeras son las últimas
  const ultimas = facturas.slice(0, CUANTAS_ULTIMAS)

  return (
    <section className="inicio">
      <h1 className="titulo-pagina inicio__titulo">
        Tus facturas, <span className="inicio__destacado">en orden</span>
      </h1>
      <p className="inicio__texto texto-suave">
        Crea facturas, gestiona tus clientes y productos, y ten siempre a mano los totales con su IVA.
      </p>

      <div className="barra-acciones">
        {/* "nuevaFactura" le dice a la página de Facturas que abra el formulario directamente */}
        <Link to="/facturas" state={{ nuevaFactura: true }} className="boton">
          Nueva factura
        </Link>
        <Link to="/clientes" className="boton boton--secundario">
          Ver clientes
        </Link>
      </div>

      {error && (
        <p className="mensaje-error" role="alert">
          {error}
        </p>
      )}

      {/* Con facturas, lo útil es ver las últimas. Sin ninguna, la ilustración de bienvenida */}
      {!cargando && !error && ultimas.length > 0 && (
        <section className="inicio__ultimas">
          <div className="inicio__ultimas-cabecera">
            <h2 className="subtitulo">Últimas facturas</h2>
            <Link to="/facturas">Ver todas ({facturas.length})</Link>
          </div>
          <div className="tabla-scroll">
            <table className="tabla">
              <thead>
                <tr>
                  <th>Nº</th>
                  <th>Fecha</th>
                  <th>Cliente</th>
                  <th className="numero">Total</th>
                </tr>
              </thead>
              <tbody>
                {ultimas.map((factura) => (
                  <tr key={factura.id}>
                    <td>
                      <Link className="tabla__numero-factura" to={`/facturas/${factura.id}`}>
                        {factura.numero}
                      </Link>
                    </td>
                    <td>{formatearFecha(factura.fecha)}</td>
                    <td>{factura.cliente_nombre}</td>
                    <td className="numero tabla__total">{centimosAEuros(factura.total_centimos)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {!cargando && !error && ultimas.length === 0 && (
        <figure className="inicio__imagen">
          <img src={imagenNegocios} alt="Factura con sello de pagada sobre un gráfico de crecimiento" />
        </figure>
      )}
    </section>
  )
}

export default Inicio
