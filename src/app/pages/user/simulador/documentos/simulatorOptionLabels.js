export const TIPO_OPTIONS = [
  { value: 'A', label: 'A Urbanización' },
  { value: 'B', label: 'B Parcelación' },
  { value: 'C', label: 'C Subdivisión' },
  { value: 'D', label: 'D Construcción' },
  { value: 'E', label: 'E Espacio Público' },
  { value: 'F', label: 'F Reconocimiento' },
  { value: 'G', label: 'G Otras Actuaciones' },
];

export const TRAMITE_OPTIONS = [
  { value: 'A', label: 'A Inicial' },
  { value: 'B', label: 'B Prórroga' },
  { value: 'C', label: 'C Modificación' },
  { value: 'D', label: 'D Revalidación' },
];

export const STANDARD_TRAMITE_CODES = new Set(TRAMITE_OPTIONS.map((option) => option.value));

export const M_URB_OPTIONS = [
  { value: 'A', label: 'A Desarrollo' },
  { value: 'B', label: 'B Saneamiento' },
  { value: 'C', label: 'C Recuperación' },
];

export const M_SUB_OPTIONS = [
  { value: 'A', label: 'A Rural' },
  { value: 'B', label: 'B Urbana' },
  { value: 'C', label: 'C Reloteo' },
];

export const M_LIC_OPTIONS = [
  { value: 'A', label: 'A Obra Nueva' },
  { value: 'B', label: 'B Ampliación' },
  { value: 'C', label: 'C Adecuación' },
  { value: 'D', label: 'D Modificación' },
  { value: 'E', label: 'E Restauración' },
  { value: 'F', label: 'F Reforzamiento' },
  { value: 'G', label: 'G.1 Demolición Total' },
  { value: 'g', label: 'G.2 Demolición Parcial' },
  { value: 'H', label: 'H Reconstrucción' },
  { value: 'I', label: 'I Cerramiento' },
];

export const AREA_OPTIONS = [
  { value: 'A', label: 'A < 2000m²' },
  { value: 'B', label: 'B >= 2000m²' },
  { value: 'C', label: 'C Alcanza 2000m²' },
  { value: 'D', label: 'D 5+ viviendas' },
];

export const CULTURAL_OPTIONS = [
  { value: 'A', label: 'A Sí' },
  { value: 'B', label: 'B No' },
];

export const USOS_OPTIONS = [
  { value: 'A', label: 'A Vivienda' },
  { value: 'B', label: 'B Comercio' },
  { value: 'C', label: 'C Institucional' },
  { value: 'D', label: 'D Industrial' },
];

export const VIVIENDA_OPTIONS = [
  { value: 'A', label: 'A VIP' },
  { value: 'B', label: 'B VIS' },
  { value: 'C', label: 'C NO VIS' },
];

export const SIMULATOR_OPTIONS_BY_FIELD = {
  tipo: TIPO_OPTIONS,
  tramite: TRAMITE_OPTIONS,
  m_urb: M_URB_OPTIONS,
  m_sub: M_SUB_OPTIONS,
  m_lic: M_LIC_OPTIONS,
  area: AREA_OPTIONS,
  cultural: CULTURAL_OPTIONS,
  usos: USOS_OPTIONS,
  vivienda: VIVIENDA_OPTIONS,
};

export function getSimulatorOptionLabel(field, value) {
  if (!value) return 'Sin seleccionar';
  return SIMULATOR_OPTIONS_BY_FIELD[field]?.find((option) => option.value === value)?.label || value;
}
