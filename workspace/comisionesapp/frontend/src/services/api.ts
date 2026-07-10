import axios from 'axios';
import router from '@/router';

// ── Instancia base ────────────────────────────────────────────────────
const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
});

// ── Interceptor de petición: adjunta Bearer token automáticamente ─────
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// ── Interceptor de respuesta: maneja 401 (token expirado / inválido) ──
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Import dinámico para evitar ciclo api.ts ↔ stores/auth.ts;
      // logout() limpia store y localStorage de forma consistente.
      const { useAuthStore } = await import('@/stores/auth');
      useAuthStore().logout();
      router.push('/login');
    }
    return Promise.reject(error);
  },
);

/** Extrae un mensaje legible de un error de axios / class-validator. */
export function obtenerMensajeError(e: unknown, porDefecto = 'Error inesperado'): string {
  if (axios.isAxiosError(e)) {
    const msg = e.response?.data?.message;
    if (Array.isArray(msg)) return msg.join(' · ');
    if (typeof msg === 'string') return msg;
  }
  if (e instanceof Error && e.message) return e.message;
  return porDefecto;
}

// ── Tipos ─────────────────────────────────────────────────────────────
/** Roles habilitados en el sistema — HU-0223 */
export type RolUsuario = 'ADMINISTRADOR' | 'PROFESIONAL_COMISIONES';

export interface UsuarioAutenticado {
  id: number;
  email: string;
  nombre: string;
  rol: RolUsuario;
}

export interface LoginResponse {
  access_token: string;
  user: UsuarioAutenticado;
}

// ── Auth ──────────────────────────────────────────────────────────────
export const authApi = {
  login: (email: string, password: string) =>
    api.post<LoginResponse>('/auth/login', { email, password }).then((r) => r.data),

  me: () => api.get<UsuarioAutenticado>('/auth/me').then((r) => r.data),
};

// ── Tipos — Calendarios ───────────────────────────────────────────────
export interface Calendario {
  idCalendario: string;
  nombre: string;
  anio: number;
  estadoActivo: boolean;
  periodos?: Periodo[];
}

export interface Periodo {
  idPeriodo: string;
  codigo: string;
  fechaInicio: string;
  fechaFin: string;
  estadoOperativo: 'Abierto' | 'EnCurso' | 'Liquidado' | 'Cerrado';
  calendario?: { idCalendario: string; nombre: string };
}

export interface CrearCalendarioDto {
  nombre: string;
  anio: number;
  estadoActivo?: boolean;
}

export interface CrearPeriodoDto {
  idCalendario: string;
  /** Opcional: si se omite, el backend lo genera desde la fecha fin (ej. ENE-2027). */
  codigo?: string;
  fechaInicio: string;
  fechaFin: string;
}

// ── Tipos — Parametrización ───────────────────────────────────────────
export type TipoLiquidacion = 'Individual' | 'GlobalTienda' | 'GlobalGrupoTiendas';
export type TipoDistribucion = 'Individual' | 'Proporcional';
export type TipoAfectacion = 'HorasLaboradas' | 'NovedadesDiarias';
export type EstrategiaTipoDescuento = 'CORPORATIVO' | 'REAL';

export interface CargoOficial {
  codigo: string;
  nombre: string;
  afectacion: TipoAfectacion;
}

export interface RangoComision {
  idRango: string;
  desdePorc: number;
  hastaPorc: number | null;
  comisionPorc: number;
}

export interface RangoInput {
  desdePorc: number;
  hastaPorc?: number | null;
  comisionPorc: number;
}

export interface ParametrizacionCargo {
  idParametrizacion: string;
  codigoOficio: string;
  nombreCargo: string;
  periodo: Periodo & { calendario?: { idCalendario: string; nombre: string } };
  tipoLiquidacion: TipoLiquidacion;
  tipoDistribucion: TipoDistribucion;
  porcLinea: number;
  porcPromocion: number;
  porcEstrategia: number;
  validarPresupuesto: boolean;
  validarCrecimiento: boolean;
  tipoAfectacion: TipoAfectacion;
  vigenciaDesde: string | null;
  vigenciaHasta: string | null;
  estrategiaTipoDescuento: EstrategiaTipoDescuento | null;
  estrategiaPorcDescuentoCorporativo: number | null;
  rangos: RangoComision[];
  estadoActivo: boolean;
  motivo: string;
  usuarioCambio: string;
  updatedAt: string;
}

export interface CrearParametrizacionDto {
  codigoOficio: string;
  idPeriodo: string;
  tipoLiquidacion: TipoLiquidacion;
  tipoDistribucion: TipoDistribucion;
  porcLinea: number;
  porcPromocion: number;
  porcEstrategia: number;
  validarPresupuesto?: boolean;
  validarCrecimiento?: boolean;
  tipoAfectacion: TipoAfectacion;
  vigenciaDesde?: string;
  vigenciaHasta?: string;
  estrategiaTipoDescuento?: EstrategiaTipoDescuento;
  estrategiaPorcDescuentoCorporativo?: number;
  rangos: RangoInput[];
  motivo: string;
}

// ── Tipos — Presupuesto y Crecimiento ───────────────────────────────
export type TipoPresupuesto = 'INDIVIDUAL' | 'TIENDA' | 'GRUPO';

export interface Presupuesto {
  idPresupuesto: string;
  codigoOficio: string;
  periodo: { idPeriodo: string; codigo: string };
  tienda: { idTienda: string; codigo: string; nombre: string } | null;
  tipo: TipoPresupuesto;
  valor: number;
}

export interface RangoTabla {
  idRango: string;
  codigoOficio: string;
  periodo: { idPeriodo: string; codigo: string };
  desdePorc: number;
  hastaPorc: number | null;
  porcLinea: number;
  porcPromocion: number;
}

export interface RangoCrecimiento {
  idRango: string;
  codigoOficio: string;
  periodo: { idPeriodo: string; codigo: string };
  desdePorcCrec: number;
  hastaPorcCrec: number | null;
  porcLinea: number;
  porcPromocion: number;
}

// ── Calendarios API ───────────────────────────────────────────────────
export const calendariosApi = {
  getAll: () => api.get<Calendario[]>('/calendarios').then((r) => r.data),
  getOne: (id: string) => api.get<Calendario>(`/calendarios/${id}`).then((r) => r.data),
  create: (dto: CrearCalendarioDto) =>
    api.post<Calendario>('/calendarios', dto).then((r) => r.data),
  update: (id: string, dto: Partial<CrearCalendarioDto>) =>
    api.patch<Calendario>(`/calendarios/${id}`, dto).then((r) => r.data),
  remove: (id: string) =>
    api.delete<{ mensaje: string }>(`/calendarios/${id}`).then((r) => r.data),
};

// ── Periodos API ──────────────────────────────────────────────────────
export interface GenerarAnioDto {
  /** El año ya no se pide — se toma del calendario (CRIT-6 fix). */
  patron?: { diaInicio?: number; diaFin?: number };
}

export const periodosApi = {
  getByCalendario: (idCalendario: string) =>
    api.get<Periodo[]>(`/calendarios/${idCalendario}/periodos`).then((r) => r.data),
  create: (dto: CrearPeriodoDto) =>
    api.post<Periodo>('/calendarios/periodos', dto).then((r) => r.data),
  generarAnio: (idCalendario: string, dto: GenerarAnioDto) =>
    api
      .post<Periodo[]>(`/calendarios/${idCalendario}/periodos/generar-anio`, dto)
      .then((r) => r.data),
  update: (id: string, dto: Partial<Omit<CrearPeriodoDto, 'idCalendario'>>) =>
    api.patch<Periodo>(`/calendarios/periodos/${id}`, dto).then((r) => r.data),
  remove: (id: string) =>
    api.delete<{ mensaje: string }>(`/calendarios/periodos/${id}`).then((r) => r.data),
};

// ── Integraciones API (solo lectura: INDICADORES + Midasoft) ─────────
export type FilaDatos = Record<string, unknown>;

export const integracionesApi = {
  comisionesDetalle: (fechaInicial: string, fechaFinal: string) =>
    api
      .get<FilaDatos[]>('/integraciones/comisiones/detalle', { params: { fechaInicial, fechaFinal } })
      .then((r) => r.data),
  comisionesResumen: (fechaInicial: string, fechaFinal: string) =>
    api
      .get<FilaDatos[]>('/integraciones/comisiones/resumen', { params: { fechaInicial, fechaFinal } })
      .then((r) => r.data),
  empleados: () =>
    api
      .get<FilaDatos[] | { data?: FilaDatos[]; empleados?: FilaDatos[] }>(
        '/integraciones/midasoft/empleados',
      )
      .then((r) => r.data),
};

// ── Parametrización API ───────────────────────────────────────────────
export const parametrizacionApi = {
  catalogoCargos: () =>
    api.get<CargoOficial[]>('/parametrizacion/cargos').then((r) => r.data),
  vigente: (codigoOficio: string, fecha: string) =>
    api
      .get<ParametrizacionCargo | null>('/parametrizacion/vigente', {
        params: { codigoOficio, fecha },
      })
      .then((r) => r.data),
  getAll: (filtros?: { idPeriodo?: string; codigoOficio?: string }) =>
    api.get<ParametrizacionCargo[]>('/parametrizacion', { params: filtros }).then((r) => r.data),
  getOne: (id: string) =>
    api.get<ParametrizacionCargo>(`/parametrizacion/${id}`).then((r) => r.data),
  create: (dto: CrearParametrizacionDto) =>
    api.post<ParametrizacionCargo>('/parametrizacion', dto).then((r) => r.data),
  update: (id: string, dto: Partial<CrearParametrizacionDto> & { motivo: string }) =>
    api.patch<ParametrizacionCargo>(`/parametrizacion/${id}`, dto).then((r) => r.data),
  desactivar: (id: string) =>
    api.patch<ParametrizacionCargo>(`/parametrizacion/${id}/desactivar`, {}).then((r) => r.data),
  remove: (id: string) =>
    api.delete<{ mensaje: string }>(`/parametrizacion/${id}`).then((r) => r.data),
};

// ── Presupuestos (valores) API ────────────────────────────────────────
export interface CrearPresupuestoDto {
  codigoOficio: string;
  idPeriodo: string;
  idTienda?: string;
  tipo: TipoPresupuesto;
  valor: number;
}

export const presupuestosApi = {
  getAll: (filtros?: { idPeriodo?: string; codigoOficio?: string; idTienda?: string }) =>
    api.get<Presupuesto[]>('/parametrizacion/presupuestos', { params: filtros }).then((r) => r.data),
  create: (dto: CrearPresupuestoDto) =>
    api.post<Presupuesto>('/parametrizacion/presupuestos', dto).then((r) => r.data),
  update: (id: string, dto: Partial<CrearPresupuestoDto>) =>
    api.patch<Presupuesto>(`/parametrizacion/presupuestos/${id}`, dto).then((r) => r.data),
  remove: (id: string) =>
    api.delete<{ mensaje: string }>(`/parametrizacion/presupuestos/${id}`).then((r) => r.data),
};

// ── Rangos de presupuesto (cumplimiento) y crecimiento API ────────────
export interface RangoTablaInput {
  desdePorc: number;
  hastaPorc?: number | null;
  porcLinea: number;
  porcPromocion: number;
}

export interface ReplaceRangosDto {
  codigoOficio: string;
  idPeriodo: string;
  rangos: RangoTablaInput[];
}

export const presupuestoRangosApi = {
  getAll: (filtros?: { idPeriodo?: string; codigoOficio?: string }) =>
    api.get<RangoTabla[]>('/parametrizacion/presupuestos-rangos', { params: filtros }).then((r) => r.data),
  replace: (dto: ReplaceRangosDto) =>
    api.post<RangoTabla[]>('/parametrizacion/presupuestos-rangos', dto).then((r) => r.data),
  removeAll: (codigoOficio: string, idPeriodo: string) =>
    api
      .delete<{ mensaje: string }>(
        `/parametrizacion/presupuestos-rangos/${codigoOficio}/${idPeriodo}`,
      )
      .then((r) => r.data),
};

export const crecimientoRangosApi = {
  getAll: (filtros?: { idPeriodo?: string; codigoOficio?: string }) =>
    api.get<RangoCrecimiento[]>('/parametrizacion/crecimiento-rangos', { params: filtros }).then((r) => r.data),
  replace: (dto: ReplaceRangosDto) =>
    api.post<RangoCrecimiento[]>('/parametrizacion/crecimiento-rangos', dto).then((r) => r.data),
  removeAll: (codigoOficio: string, idPeriodo: string) =>
    api
      .delete<{ mensaje: string }>(
        `/parametrizacion/crecimiento-rangos/${codigoOficio}/${idPeriodo}`,
      )
      .then((r) => r.data),
};

// ── Liquidación (HU-03) ────────────────────────────────────────────
export type EstadoLiquidacion = 'EN_CURSO' | 'LIQUIDADO' | 'ERROR' | 'CERRADO';

export interface Liquidacion {
  idLiquidacion: string;
  periodo: { idPeriodo: string; codigo: string };
  estado: EstadoLiquidacion;
  fechaInicio: string;
  fechaFin: string | null;
  fechaCierre: string | null;
  usuarioEjecuta: string;
  usuarioCierre: string | null;
  totalColaboradores: number | null;
  totalTiendas: number | null;
  totalComision: number | null;
  archivoPlanoPath: string | null;
}

export interface Elegibilidad {
  elegible: boolean;
  motivo?: string;
  periodoAnteriorCerrado: boolean;
  parametrizacionVigente: boolean;
}

export const liquidacionApi = {
  getAll: () => api.get<Liquidacion[]>('/liquidacion').then((r) => r.data),
  getOne: (id: string) => api.get<Liquidacion>(`/liquidacion/${id}`).then((r) => r.data),
  elegibilidad: (idPeriodo: string) =>
    api.get<Elegibilidad>(`/liquidacion/elegibilidad/${idPeriodo}`).then((r) => r.data),
  ejecutar: (idPeriodo: string) =>
    api.post<Liquidacion>('/liquidacion/ejecutar', { idPeriodo }).then((r) => r.data),
  cerrar: (id: string) =>
    api.patch<Liquidacion>(`/liquidacion/${id}/cerrar`, {}).then((r) => r.data),
  /** Descarga el archivo plano de nómina (HU-03) como blob. */
  descargarArchivo: (id: string) =>
    api.get<Blob>(`/liquidacion/${id}/archivo`, { responseType: 'blob' }),
};

// ── Trazabilidad (HU-04) ──────────────────────────────────────────
export interface Colaborador {
  idColaborador: string;
  idMidasoft: string;
  nombres: string;
  apellidos: string;
  tipoDocumento: string;
  numeroDocumento: string;
  cargo: string;
  idTienda: string | null;
  activo: boolean;
}

export const colaboradoresApi = {
  getAll: () => api.get<Colaborador[]>('/catalogos/colaboradores').then((r) => r.data),
};

// ── Catálogos derivados del API Midasoft (tienda → cargos) ────────
export interface TiendaCcosto {
  ccosto: string;
  nombre: string;
}

export interface CargoTienda {
  codigo: string;
  nombre: string;
}

export const catalogosApi = {
  tiendas: () => api.get<TiendaCcosto[]>('/catalogos/tiendas').then((r) => r.data),
  cargosPorTienda: (ccosto: string) =>
    api.get<CargoTienda[]>(`/catalogos/cargos-por-tienda/${ccosto}`).then((r) => r.data),
};

export interface FiltrosTrazabilidad {
  idCalendario?: string;
  anio?: number;
  idPeriodo?: string;
  idLiquidacion?: string;
  idColaborador?: string;
  codigoOficio?: string;
  idTienda?: string;
  tipoLiquidacion?: 'Individual' | 'GlobalTienda' | 'GlobalGrupoTiendas';
  tipoDistribucion?: 'Individual' | 'Proporcional';
  comisionMin?: number;
  comisionMax?: number;
}

export interface ResumenTrazabilidad {
  idLiquidacion: string;
  idPeriodo: string;
  periodoCodigo: string;
  estado: EstadoLiquidacion;
  totalColaboradores: number;
  totalTiendas: number;
  totalComision: number;
  fechaInicio: string;
  fechaCierre: string | null;
}

export interface DetalleTrazabilidad {
  idLiquidacion: string;
  idColaborador: string;
  idCargo: string;
  idTienda: string | null;
  codigoTienda: string | null;
  periodoCodigo: string;
  parametrizacion: {
    tipoLiquidacion: string;
    tipoDistribucion: string;
    porcLinea: number;
    porcPromocion: number;
    porcEstrategia: number;
    estrategiaTipoDescuento: string | null;
    estrategiaPorcDescuentoCorporativo: number | null;
  } | null;
  base: {
    ventaBruta: number;
    ventaSinIva: number;
    comisionBancaria: number;
    ventaNeta: number;
    porcentajeAplicado: number;
    comision: number;
    diasLaborados: number | null;
    horasValidas: number | null;
    diasExcluidos: number | null;
    motivoExclusion: string | null;
    cumplePresupuesto: number | null;
    cumpleCrecimiento: number | null;
  };
  afectacion: {
    subperiodoId: string;
    fechaInicioSub: string;
    fechaFinSub: string;
    motivo: string;
  };
  desglose: Array<{
    tipoVenta: 'LINEA' | 'LINEA_ESTRATEGIA' | 'PROMOCION';
    ventaBruta: number;
    ventaSinIva: number;
    comisionBancaria: number;
    ventaNeta: number;
    porcentajeAplicado: number;
    comision: number;
  }>;
}

export const trazabilidadApi = {
  resumen: (filtros: FiltrosTrazabilidad) =>
    api.post<ResumenTrazabilidad[]>('/trazabilidad/resumen', filtros).then((r) => r.data),
  detalle: (idLiquidacion: string, idColaborador: string) =>
    api
      .get<DetalleTrazabilidad | null>(
        `/trazabilidad/detalle/${idLiquidacion}/${idColaborador}`,
      )
      .then((r) => r.data),
  colaboradores: (idLiquidacion: string) =>
    api.get<string[]>(`/trazabilidad/colaboradores/${idLiquidacion}`).then((r) => r.data),
  // Descarga autenticada (un enlace directo no llevaría el Bearer token)
  exportarCsv: async (idLiquidacion: string) => {
    const { data } = await api.get<Blob>(`/trazabilidad/exportar/${idLiquidacion}`, {
      responseType: 'blob',
    });
    const url = URL.createObjectURL(data);
    const a = document.createElement('a');
    a.href = url;
    a.download = `trazabilidad_${idLiquidacion}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  },
};
