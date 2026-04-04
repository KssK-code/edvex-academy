/**
 * Tutoría (TUT*) accesible con meses_desbloqueados = 0; resto según mes del contenido.
 */
export function alumnoPuedeAccederEvaluacion(
  codigoMateria: string,
  numeroMes: number,
  mesesDesbloqueados: number
): boolean {
  if (codigoMateria.startsWith('TUT')) return true
  return numeroMes <= mesesDesbloqueados
}
