import express from 'express';

const app = express();
const PORT = 3001;

app.get('/api/salud', (req, res) => {
  res.json({ ok: true });
});

app.listen(PORT, () => {
  console.log(`Servidor escuchando en http://localhost:${PORT}`);
});
