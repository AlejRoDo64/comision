import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcryptjs';
import { IUser } from '../interfaces/user.interface';

/**
 * Repositorio en memoria — reemplazar por TypeOrmUsersRepository cuando se asigne la BD.
 * Los hashes se generan al iniciar el módulo para que no queden contraseñas en texto plano.
 * Las contraseñas semilla se leen de .env (SEED_*); el fallback aplica solo a desarrollo.
 */
@Injectable()
export class UsersMockRepository implements OnModuleInit {
  private usuarios: IUser[] = [];

  constructor(private readonly config: ConfigService) {}

  async onModuleInit() {
    const salt = 10;
    this.usuarios = [
      {
        id: 1,
        nombre: 'Administrador',
        email: 'admin@permoda.com',
        password: await bcrypt.hash(
          this.config.get<string>('SEED_ADMIN_PASSWORD', 'Admin123!'),
          salt,
        ),
        rol: 'ADMINISTRADOR',
        activo: true,
        creadoEn: new Date().toISOString(),
      },
      {
        id: 2,
        nombre: 'Profesional de Comisiones',
        email: 'comisiones@permoda.com',
        password: await bcrypt.hash(
          this.config.get<string>('SEED_COMISIONES_PASSWORD', 'Comisiones123!'),
          salt,
        ),
        rol: 'PROFESIONAL_COMISIONES',
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
