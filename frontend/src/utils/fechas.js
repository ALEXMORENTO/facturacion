// '2026-10-13' -> '13/10/2026'
export function formatearFecha(texto) {
  const [anio, mes, dia] = texto.split('-')
  return `${dia}/${mes}/${anio}`
}
