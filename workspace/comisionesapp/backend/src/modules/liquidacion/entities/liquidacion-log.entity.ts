import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Liquidacion } from './liquidacion.entity';

export enum NivelLog {
  INFO  = 'INFO',
  OK    = 'OK',
  WARN  = 'WARN',
  ERROR = 'ERROR',
}

/**
 * Log detallado de la ejecución de la liquidación (HU-03).
 * Cada paso del motor deja un registro: validación, consumo ICG, normalización,
 * cálculo, distribución, archivo plano, etc.
 */
@Entity('liquidacion_log')
@Index('IX_liq_log_liq', ['idLiquidacion', 'fecha'])
export class LiquidacionLog {
  @PrimaryGeneratedColumn('uuid', { name: 'id_log' })
  idLog: string;

  @ManyToOne(() => Liquidacion, (l) => l.logs, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'id_liquidacion' })
  liquidacion: Liquidacion;

  @Column({ name: 'id_liquidacion', type: 'uniqueidentifier' })
  idLiquidacion: string;

  @Column({ type: 'varchar', length: 50 })
  paso: string;

  @Column({ type: 'varchar', length: 20, default: NivelLog.INFO })
  nivel: NivelLog;

  @Column({ type: 'nvarchar', length: 'max' })
  mensaje: string;

  @Column({ name: 'detalle_json', type: 'nvarchar', length: 'max', nullable: true })
  detalleJson: string | null;

  @Column({ type: 'int', name: 'duracion_ms', nullable: true })
  duracionMs: number | null;

  @CreateDateColumn({ name: 'fecha' })
  fecha: Date;
}