/** Roles habilitados en el sistema — HU-0223 */
export const ROLES_USUARIO = ['ADMINISTRADOR', 'PROFESIONAL_COMISIONES'] as const;
export type RolUsuario = (typeof ROLES_USUARIO)[number];

export interface IUser {
  id: number;
  nombre: string;
  email: string;
  password: string;
  rol: RolUsuario;
  activo: boolean;
  creadoEn: string;
}

