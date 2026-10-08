import { Route, Routes } from 'react-router-dom'
import MenuLateral from './components/MenuLateral.jsx'
import Inicio from './pages/Inicio.jsx'
import Facturas from './pages/Facturas.jsx'
import Clientes from './pages/Clientes.jsx'
import Productos from './pages/Productos.jsx'
import NoEncontrada from './pages/NoEncontrada.jsx'

function App() {
  return (
    <div className="app">
      <MenuLateral />

      <main className="contenido">
        {/* Según la URL, se muestra una página u otra; el menú se queda siempre */}
        <Routes>
          <Route path="/" element={<Inicio />} />
          <Route path="/facturas" element={<Facturas />} />
          <Route path="/clientes" element={<Clientes />} />
          <Route path="/productos" element={<Productos />} />
          <Route path="*" element={<NoEncontrada />} />
        </Routes>
      </main>
    </div>
  )
}

export default App
