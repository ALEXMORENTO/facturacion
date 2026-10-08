import express from 'express';
import './db.js';
import clientesRouter from './routes/clientes.js';
import productosRouter from './routes/productos.js';

const app = express();
const PORT = 3001;

// Convierte el cuerpo JSON de las peticiones en req.body
app.use(express.json());

app.get('/api/salud', (req, res) => {
  res.json({ ok: true });
});

app.use('/api/clientes', clientesRouter);
app.use('/api/productos', productosRouter);

// Si el JSON enviado está mal escrito, respondemos en español en vez del error por defecto
app.use((err, req, res, next) => {
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ error: 'El cuerpo de la petición no es un JSON válido' });
  }
  console.error(err);
  res.status(500).json({ error: 'Error interno del servidor' });
});

app.listen(PORT, () => {
  console.log(`Servidor escuchando en http://localhost:${PORT}`);
});
