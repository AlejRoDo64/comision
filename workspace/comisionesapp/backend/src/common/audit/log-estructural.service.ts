import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import {
  LogCambioEstructural,
  TipoEntidadLog,
  AccionLog,
} from './log-cambio-estructural.entity';

export interface RegistroLogParams {
  tipoEntidad: TipoEntidadLog;
  idEntidad: string;
  accion: AccionLog;
  datosAnteriores?: unknown;
  datosNuevos?: unknown;
  usuario: string;
  motivo?: string;
}

/**
 * Servicio de auditoría estructural (HU-01).
 * Cualquier cambio sobre entidades de configuración debe registrarse aquí.
 * Disponible globalmente (módulo AuditModule con @Global).
 *
 * Soporta dos modos:
 *  - registrar(params)  → usa su propio repository (auto-commit)
 *  - registrar(params, manager) → usa el EntityManager de una transacción externa
 */
@Injectable()
export class LogEstructuralService {
  constructor(
    @InjectRepository(LogCambioEstructural)
    private readonly repo: Repository<LogCambioEstructural>,
  ) {}

  async registrar(params: RegistroLogParams, manager?: EntityManager): Promise<void> {
    const repo = manager
      ? manager.getRepository(LogCambioEstructural)
      : this.repo;

    await repo.save(
      repo.create({
        tipoEntidad: params.tipoEntidad,
        idEntidad: params.idEntidad,
        accion: params.accion,
        datosAnteriores: this.safeStringify(params.datosAnteriores),
        datosNuevos: this.safeStringify(params.datosNuevos),
        usuario: params.usuario,
        motivo: params.motivo ?? null,
      }),
    );
  }

  /** Serializa a JSON; null si el valor es undefined. */
  private safeStringify(value: unknown): string | null {
    if (value === undefined) return null;
    try {
      return JSON.stringify(value, (_k, v) => (v instanceof Date ? v.toISOString() : v));
    } catch {
      return null;
    }
  }
}