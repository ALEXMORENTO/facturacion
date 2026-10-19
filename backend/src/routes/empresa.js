import { Router } from 'express';

const router = Router();

// Tus datos como emisor, los que salen en cada factura (nombre, NIF, dirección y email).
// No se guardan en el código porque son datos personales: se leen de backend/.env.local
router.get('/', (req, res) => {
  res.json({
    nombre: process.env.EMISOR_NOMBRE ?? '',
    nif: process.env.EMISOR_NIF ?? '',
    direccion: process.env.EMISOR_DIRECCION ?? '',
    email: process.env.EMISOR_EMAIL ?? '',
  });
});

export default router;
