import { Router } from 'express';

const router = Router();

// API pública y gratuita del Banco Central Europeo (no necesita clave)
const URL_FRANKFURTER = 'https://api.frankfurter.dev/v1/latest?base=EUR&symbols=USD,GBP,CHF';

// Si Frankfurter tarda más de esto, nos rendimos para no dejar la página esperando
const TIEMPO_MAXIMO_MS = 5000;

// GET /api/divisas -> tipos de cambio del euro y la fecha a la que corresponden
// GET /api/divisas?centimos=1250 -> además, esa cantidad convertida a cada divisa (en céntimos)
router.get('/', async (req, res) => {
  let centimos = null;
  if (req.query.centimos !== undefined) {
    centimos = Number(req.query.centimos);
    if (!Number.isInteger(centimos) || centimos < 0) {
      return res
        .status(400)
        .json({ error: 'El parámetro centimos debe ser un número entero mayor o igual que 0' });
    }
  }

  let datos;
  try {
    const respuesta = await fetch(URL_FRANKFURTER, {
      signal: AbortSignal.timeout(TIEMPO_MAXIMO_MS),
    });
    if (!respuesta.ok) {
      throw new Error(`Frankfurter respondió con el estado ${respuesta.status}`);
    }
    datos = await respuesta.json();
  } catch (err) {
    // Sin internet, Frankfurter caído o demasiado lento
    console.error('No se han podido obtener los tipos de cambio:', err.message);
    return res
      .status(503)
      .json({ error: 'No se han podido obtener los tipos de cambio en este momento' });
  }

  const resultado = { base: 'EUR', fecha: datos.date, tipos: datos.rates };

  // Redondeamos al céntimo para seguir trabajando siempre con números enteros
  if (centimos !== null) {
    resultado.importes_centimos = {};
    for (const [divisa, tipo] of Object.entries(datos.rates)) {
      resultado.importes_centimos[divisa] = Math.round(centimos * tipo);
    }
  }

  res.json(resultado);
});

export default router;
