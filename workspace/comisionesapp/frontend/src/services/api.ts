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
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('access_token');
      localStorage.removeItem('auth_user');
      router.push('/login');
    }
    return Promise.reject(error);
  },
);

// ── Tipos ─────────────────────────────────────────────────────────────
export interface UsuarioAutenticado {
  id: number;
  email: string;
  nombre: string;
  rol: string;
}

export interface LoginResponse {
  access_token: string;
  user: UsuarioAutenticado;
}

export interface Producto {
  id: number;
  nombre: string;
  descripcion: string;
  precio: number;
  stock: number;
  creadoEn: string;
}

export interface CrearProductoDto {
  nombre: string;
  descripcion: string;
  precio: number;
  stock: number;
}

export interface Periodo {
  idPeriodo: string;
  calendarioId: string;
  codigo: string;
  fechaInicio: string;
  fechaFin: string;
  estadoOperativo: string;
}

export interface Calendario {
  idCalendario: string;
  nombre: string;
  anio: number;
  estadoActivo: boolean;
  periodos: Periodo[];
}

export interface CrearPeriodoDto {
  codigo: string;
  fechaInicio: string;
  fechaFin: string;
}

// ── Auth ──────────────────────────────────────────────────────────────
export const authApi = {
  login: (email: string, password: string) =>
    api.post<LoginResponse>('/auth/login', { email, password }).then((r) => r.data),

  me: () => api.get<UsuarioAutenticado>('/auth/me').then((r) => r.data),
};

// ── Productos ─────────────────────────────────────────────────────────
export const productosApi = {
  getAll: () => api.get<Producto[]>('/productos').then((r) => r.data),
  getOne: (id: number) => api.get<Producto>(`/productos/${id}`).then((r) => r.data),
  create: (dto: CrearProductoDto) => api.post<Producto>('/productos', dto).then((r) => r.data),
  update: (id: number, dto: Partial<CrearProductoDto>) =>
    api.patch<Producto>(`/productos/${id}`, dto).then((r) => r.data),
  remove: (id: number) =>
    api.delete<{ mensaje: string }>(`/productos/${id}`).then((r) => r.data),
};

export const calendariosApi = {
  getAll: () => api.get<Calendario[]>('/calendarios').then((r) => r.data),
  createPeriodo: (idCalendario: string, dto: CrearPeriodoDto) =>
    api.post<Periodo>(`/calendarios/${idCalendario}/periodos`, dto).then((r) => r.data),
};
