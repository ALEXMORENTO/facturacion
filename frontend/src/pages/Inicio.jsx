import { Link } from 'react-router-dom'
import imagenNegocios from '../assets/inicio-negocios.svg'

function Inicio() {
  return (
    <section className="inicio">
      <p className="inicio__antetitulo">Facturín · by Acenology</p>
      <h1 className="titulo-pagina inicio__titulo">
        Tus facturas, <span className="inicio__destacado">en orden</span>
      </h1>
      <p className="inicio__texto texto-suave">
        Crea facturas, gestiona tus clientes y productos, y ten siempre a mano los totales con su IVA.
      </p>

      <div className="barra-acciones">
        <Link to="/facturas" className="boton">
          Ir a facturas
        </Link>
        <Link to="/clientes" className="boton boton--secundario">
          Ver clientes
        </Link>
      </div>

      <figure className="inicio__imagen">
        <img src={imagenNegocios} alt="Factura con sello de pagada sobre un gráfico de crecimiento" />
      </figure>
    </section>
  )
}

export default Inicio
