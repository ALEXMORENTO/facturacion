// Funciones de validación que usan las rutas del backend.
// Las que comprueban un dato devuelven un mensaje de error en español si algo falla,
// o null si el dato es correcto.

// Letras de control del DNI y del NIE: la letra es la que ocupa la posición (número % 23)
const LETRAS_DNI = 'TRWAGMYFPDXBNJZSQVHLCKE';

// Letras de control del CIF cuando el dígito de control es una letra (J=0, A=1 ... I=9)
const LETRAS_CIF = 'JABCDEFGHI';

// Quita espacios, guiones y puntos y pasa a mayúsculas: ' 12.345.678-z ' -> '12345678Z'
export function normalizarDocumento(texto) {
  return texto.replace(/[\s.-]/g, '').toUpperCase();
}

function errorDni(doc) {
  const numero = Number(doc.slice(0, 8));
  const letraCorrecta = LETRAS_DNI[numero % 23];
  if (doc[8] !== letraCorrecta) {
    return `El DNI ${doc} no es válido: la letra no corresponde al número`;
  }
  return null;
}

function errorNie(doc) {
  // La X, Y o Z inicial cuenta como 0, 1 o 2 para calcular la letra
  const numero = Number('XYZ'.indexOf(doc[0]) + doc.slice(1, 8));
  const letraCorrecta = LETRAS_DNI[numero % 23];
  if (doc[8] !== letraCorrecta) {
    return `El NIE ${doc} no es válido: la letra no corresponde al número`;
  }
  return null;
}

function errorCif(doc) {
  const letraInicial = doc[0];
  const digitos = doc.slice(1, 8);
  const control = doc[8];

  // Cálculo oficial: los dígitos en posición par se suman tal cual;
  // los de posición impar se multiplican por 2 y se suman sus cifras (14 -> 1 + 4)
  let suma = 0;
  for (let i = 0; i < 7; i++) {
    const digito = Number(digitos[i]);
    if (i % 2 === 0) {
      const doble = digito * 2;
      suma += Math.floor(doble / 10) + (doble % 10);
    } else {
      suma += digito;
    }
  }
  const digitoControl = (10 - (suma % 10)) % 10;
  const letraControl = LETRAS_CIF[digitoControl];

  // Según el tipo de entidad, el control tiene que ser letra, número, o vale cualquiera de los dos
  let valido;
  if ('PQRSNW'.includes(letraInicial)) {
    valido = control === letraControl;
  } else if ('ABEH'.includes(letraInicial)) {
    valido = control === String(digitoControl);
  } else {
    valido = control === letraControl || control === String(digitoControl);
  }

  if (!valido) {
    return `El CIF ${doc} no es válido: el carácter de control no es correcto`;
  }
  return null;
}

// Comprueba un DNI, NIE o CIF ya normalizado (sin espacios ni guiones y en mayúsculas)
export function validarDniNif(doc) {
  if (/^\d{8}[A-Z]$/.test(doc)) return errorDni(doc);
  if (/^[XYZ]\d{7}[A-Z]$/.test(doc)) return errorNie(doc);
  if (/^[ABCDEFGHJNPQRSUVW]\d{7}[0-9A-J]$/.test(doc)) return errorCif(doc);

  return (
    `El DNI/NIF "${doc}" no tiene un formato válido. ` +
    'Debe ser un DNI (8 números y letra), un NIE (X, Y o Z, 7 números y letra) ' +
    'o un CIF (letra, 7 números y un número o letra de control)'
  );
}

// Comprobación sencilla: algo@algo.algo, sin espacios
export function validarEmail(email) {
  if (email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return `El email "${email}" no tiene un formato válido (ejemplo: nombre@empresa.com)`;
  }
  return null;
}

// La fecha de una factura nueva no puede ser anterior a la de la última factura emitida.
// Las fechas van como texto 'AAAA-MM-DD', así que se pueden comparar directamente como texto.
export function validarFechaPosterior(fecha, fechaUltima) {
  if (fechaUltima && fecha < fechaUltima) {
    // '2026-10-13' -> '13/10/2026' para que el mensaje se lea como una fecha española
    const [anio, mes, dia] = fechaUltima.split('-');
    return (
      `La fecha de la factura no puede ser anterior a la de la última factura (${dia}/${mes}/${anio}). ` +
      'La ley obliga a que la numeración y las fechas de las facturas vayan en orden'
    );
  }
  return null;
}
