import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { obtenerFactura } from '../api.js'
import { centimosAEuros } from '../utils/dinero.js'
import { formatearFecha } from '../utils/fechas.js'

function FacturaDetalle() {
  // El id sale de la URL: /facturas/7 -> id = '7'
  const { id } = useParams()
  const [factura, setFactura] = useState(null)
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')

  // Pedimos la factura al abrir la página y cada vez que cambie el id de la URL
  useEffect(() => {
    setCargando(true)
    setError('')
    setFactura(null)
    obtenerFactura(id)
      .then(setFactura)
      .catch((err) => setError(err.message))
      .finally(() => setCargando(false))
  }, [id])

  return (
    <>
      {/* Al imprimir no sale nada de lo que tenga la clase "no-imprimir" */}
      <div className="barra-acciones no-imprimir">
        <Link to="/facturas" className="boton boton--secundario">
          ← Volver a facturas
        </Link>
        {factura && (
          <button className="boton" onClick={() => window.print()}>
            Imprimir
          </button>
        )}
      </div>

      {cargando && <p className="texto-suave">Cargando...</p>}

      {error && <p className="mensaje-error">{error}</p>}

      {factura && (
        <article className="factura">
          <header className="factura__cabecera">
            <div>
              <h1 className="titulo-pagina">Factura {factura.numero}</h1>
              <p className="texto-suave">Fecha: {formatearFecha(factura.fecha)}</p>
            </div>

            <div className="factura__cliente">
              <h2 className="subtitulo">Cliente</h2>
              <p>
                <strong>{factura.cliente.nombre}</strong>
              </p>
              {factura.cliente.dni && <p>DNI: {factura.cliente.dni}</p>}
              {factura.cliente.direccion && <p>{factura.cliente.direccion}</p>}
              {factura.cliente.email && <p>{factura.cliente.email}</p>}
            </div>
          </header>

          <table className="tabla">
            <thead>
              <tr>
                <th>Producto</th>
                <th className="numero">Cantidad</th>
                <th className="numero">Precio</th>
                <th className="numero">IVA</th>
                <th className="numero">Importe</th>
              </tr>
            </thead>
            <tbody>
              {factura.lineas.map((linea) => (
                <tr key={linea.id}>
                  <td>{linea.descripcion}</td>
                  <td className="numero">{linea.cantidad}</td>
                  <td className="numero">{centimosAEuros(linea.precio_centimos)}</td>
                  <td className="numero">{linea.iva_porcentaje} %</td>
                  <td className="numero">{centimosAEuros(linea.importe_centimos)}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Base e IVA de cada tipo, y al final los totales. Todo viene calculado del backend */}
          <dl className="vista-previa factura__totales">
            {factura.iva_por_tipo.map((tipo) => (
              <div className="factura__fila-total" key={tipo.iva_porcentaje}>
                <dt>
                  IVA {tipo.iva_porcentaje} % sobre {centimosAEuros(tipo.base_centimos)}
                </dt>
                <dd>{centimosAEuros(tipo.iva_centimos)}</dd>
              </div>
            ))}
            <div className="factura__fila-total">
              <dt>Base imponible</dt>
              <dd>{centimosAEuros(factura.base_centimos)}</dd>
            </div>
            <div className="factura__fila-total">
              <dt>Total IVA</dt>
              <dd>{centimosAEuros(factura.iva_centimos)}</dd>
            </div>
            <div className="factura__fila-total">
              <dt>Total</dt>
              <dd className="vista-previa__total">{centimosAEuros(factura.total_centimos)}</dd>
            </div>
          </dl>
        </article>
      )}
    </>
  )
}

export default FacturaDetalle
