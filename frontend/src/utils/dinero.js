// El backend guarda el dinero en céntimos (números enteros) para no tener errores
// de redondeo con decimales. Estas funciones convierten entre céntimos y texto en euros.

const formatoEuros = new Intl.NumberFormat('es-ES', {
  style: 'currency',
  currency: 'EUR',
  // Sin esto, en español 1234 se escribe sin punto de miles ("1234,56 €")
  useGrouping: 'always',
})

// 1250 -> "12,50 €"
export function centimosAEuros(centimos) {
  return formatoEuros.format(centimos / 100)
}

// "12,50 €" -> 1250
// Acepta "12,50", "12,5", "12", "1.234,56", "12.50" y con o sin "€".
// Devuelve null si el texto no es una cantidad válida.
export function eurosACentimos(texto) {
  let limpio = String(texto).replace(/€/g, '').replace(/\s/g, '')

  if (limpio.includes(',')) {
    // Formato español: el punto separa miles y la coma los decimales
    limpio = limpio.replace(/\./g, '').replace(',', '.')
  } else if (/^\d{1,3}(\.\d{3})+$/.test(limpio)) {
    // "1.234" sin coma: el punto son miles
    limpio = limpio.replace(/\./g, '')
  }

  // Como mucho dos decimales, y sin números negativos
  const partes = limpio.match(/^(\d+)(?:\.(\d{1,2}))?$/)
  if (!partes) return null

  // Calculamos con enteros en vez de multiplicar por 100 (12.29 * 100 = 1228.9999...)
  const euros = Number(partes[1])
  const centimos = Number((partes[2] ?? '').padEnd(2, '0'))
  return euros * 100 + centimos
}
