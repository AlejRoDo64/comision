import { Injectable, OnModuleInit } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { IUser } from '../interfaces/user.interface';

/**
 * Repositorio en memoria — reemplazar por TypeOrmUsersRepository cuando se asigne la BD.
 * Los hashes se generan al iniciar el módulo para que no queden contraseñas en texto plano.
 */
@Injectable()
export class UsersMockRepository implements OnModuleInit {
  private usuarios: IUser[] = [];

  async onModuleInit() {
    const salt = 10;
    this.usuarios = [
      {
        id: 1,
        nombre: 'Administrador',
        email: 'admin@permoda.com',
        password: await bcrypt.hash('Admin123!', salt),
        rol: 'ADMIN',
        activo: true,
        creadoEn: new Date().toISOString(),
      },
      {
        id: 2,
        nombre: 'Vendedor Demo',
        email: 'vendedor@permoda.com',
        password: await bcrypt.hash('Vendedor123!', salt),
        rol: 'VENDEDOR',
        activo: true,
        creadoEn: new Date().toISOString(),
      },
    ];
  }

  async findByEmail(email: string): Promise<IUser | null> {
    return this.usuarios.find((u) => u.email === email && u.activo) ?? null;
  }

  async findById(id: number): Promise<IUser | null> {
    return this.usuarios.find((u) => u.id === id) ?? null;
  }
}
