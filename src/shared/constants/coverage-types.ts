/**
 * Tipos de cobertura - coinciden con seed del backend (migrations/20240104_seed_coverage_types.sql)
 * Si el backend expone GET /api/v1/plans/coverage-types, se puede reemplazar por fetch.
 */

export interface CoverageTypeOption {
  id: string;
  name: string;
  description?: string;
}

export const COVERAGE_TYPES: CoverageTypeOption[] = [
  { id: '01HQCOVTYPE00000000001', name: 'Consultas Veterinarias', description: 'Consultas médicas generales y especializadas' },
  { id: '01HQCOVTYPE00000000002', name: 'Exámenes de Laboratorio', description: 'Análisis de sangre, orina, radiografías, ecografías' },
  { id: '01HQCOVTYPE00000000003', name: 'Cirugías', description: 'Intervenciones quirúrgicas programadas y de emergencia' },
  { id: '01HQCOVTYPE00000000004', name: 'Hospitalización', description: 'Estadía en clínica veterinaria con monitoreo' },
  { id: '01HQCOVTYPE00000000005', name: 'Medicamentos', description: 'Fármacos recetados y tratamientos médicos' },
  { id: '01HQCOVTYPE00000000006', name: 'Urgencias', description: 'Atención de emergencia 24/7' },
  { id: '01HQCOVTYPE00000000007', name: 'Prevención', description: 'Vacunas, desparasitación, chequeos anuales' },
  { id: '01HQCOVTYPE00000000008', name: 'Dental', description: 'Limpiezas dentales y tratamientos odontológicos' },
  { id: '01HQCOVTYPE00000000009', name: 'Terapias', description: 'Fisioterapia, rehabilitación, terapias complementarias' },
  { id: '01HQCOVTYPE00000000010', name: 'Nutrición', description: 'Consultas nutricionales y alimentos medicados' },
];
