import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
} from 'typeorm';

export enum TipoEntidadLog {
  CALENDARIO = 'CALENDARIO',
  PERIODO = 'PERIODO',
  PARAMETRIZACION = 'PARAMETRIZACION',
}

export enum AccionLog {
  CREATE = 'CREATE',
  UPDATE = 'UPDATE',
  DELETE = 'DELETE',
}

/**
 * Log de auditoría estructural sobre entidades de configuración (HU-01).
 * Cualquier create / update / delete debe generar un registro aquí con
 * usuario, fecha, datos anteriores y nuevos.
 *
 * Vive en common/audit/ para que cualquier módulo (calendarios,
 * parametrización, liquidación) pueda usarlo sin acoplamiento.
 */
@Entity('log_cambios_estructurales')
@Index('IX_log_entidad', ['tipoEntidad', 'idEntidad'])
@Index('IX_log_fecha', ['fecha'])
export class LogCambioEstructural {
  @PrimaryGeneratedColumn('uuid', { name: 'id_log' })
  idLog: string;

  @Column({ name: 'tipo_entidad', type: 'varchar', length: 20 })
  tipoEntidad: TipoEntidadLog;

  @Column({ name: 'id_entidad', type: 'uniqueidentifier' })
  idEntidad: string;

  @Column({ type: 'varchar', length: 20 })
  accion: AccionLog;

  /** Snapshot del estado anterior (JSON serializado). NULL en CREATE. */
  @Column({ name: 'datos_anteriores', type: 'nvarchar', length: 'max', nullable: true })
  datosAnteriores: string | null;

  /** Snapshot del estado nuevo (JSON serializado). NULL en DELETE. */
  @Column({ name: 'datos_nuevos', type: 'nvarchar', length: 'max', nullable: true })
  datosNuevos: string | null;

  @Column({ type: 'nvarchar', length: 100 })
  usuario: string;

  @CreateDateColumn({ name: 'fecha' })
  fecha: Date;

  @Column({ type: 'nvarchar', length: 500, nullable: true })
  motivo: string | null;
}