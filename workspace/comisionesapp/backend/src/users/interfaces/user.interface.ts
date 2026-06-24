export interface IUser {
  id: number;
  nombre: string;
  email: string;
  password: string;
  rol: 'ADMIN' | 'VENDEDOR' | 'VIEWER';
  activo: boolean;
  creadoEn: string;
}

export type IUserPublico = Omit<IUser, 'password'>;
