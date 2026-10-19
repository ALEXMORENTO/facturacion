import { NavLink } from 'react-router-dom'

const ENLACES = [
  { ruta: '/', texto: 'Inicio' },
  { ruta: '/facturas', texto: 'Facturas' },
  { ruta: '/clientes', texto: 'Clientes' },
  { ruta: '/productos', texto: 'Productos' },
]

function MenuLateral() {
  return (
    <aside className="menu-lateral">
      <div className="menu-lateral__marca">
        {/* El círculo dorado con el hilo, icono de Acenology. alt vacío: el nombre ya va escrito al lado */}
        <img className="menu-lateral__logo" src="/logo-acenology.png" alt="" />
        <div>
          Factur<span className="menu-lateral__marca-acento">í</span>n
          <small className="menu-lateral__submarca">by Acenology</small>
        </div>
      </div>

      <nav>
        <ul className="menu-lateral__lista">
          {ENLACES.map((enlace) => (
            <li key={enlace.ruta}>
              {/* NavLink añade la clase "active" al enlace de la página actual.
                  "end" evita que Inicio (/) quede marcado en todas las páginas */}
              <NavLink to={enlace.ruta} end={enlace.ruta === '/'} className="menu-lateral__enlace">
                {enlace.texto}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  )
}

export default MenuLateral
