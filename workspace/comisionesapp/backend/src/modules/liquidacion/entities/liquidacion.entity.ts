import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Periodo } from '../../calendarios/entities/periodo.entity';
import { LiquidacionDetalle } from './liquidacion-detalle.entity';
import { LiquidacionLog } from './liquidacion-log.entity';

export enum EstadoLiquidacion {
  EN_CURSO   = 'EN_CURSO',
  LIQUIDADO  = 'LIQUIDADO',
  ERROR      = 'ERROR',
  CERRADO    = 'CERRADO',
  /** Detenida por el usuario durante la ejecución (HU-03: botón Detener). */
  CANCELADA  = 'CANCELADA',
}

/**
 * Cabecera de cada ejecución del motor de liquidación para un período (HU-03).
 * Una fila por ejecución — el motor puede ejecutarse varias veces si hay error
 * y se reintenta. Solo una liquidación activa (EN_CURSO o LIQUIDADO) por
 * período se permite vía índice único filtrado en BD.
 */
@Entity('liquidacion')
@Index('IX_liq_periodo', ['periodo'])
@Index('IX_liq_estado',   ['estado'])
export class Liquidacion {
  @PrimaryGeneratedColumn('uuid', { name: 'id_liquidacion' })
  idLiquidacion: string;

  @ManyToOne(() => Periodo, { onDelete: 'NO ACTION', eager: true })
  @JoinColumn({ name: 'id_periodo' })
  periodo: Periodo;

  @Column({ type: 'varchar', length: 20, default: EstadoLiquidacion.EN_CURSO })
  estado: EstadoLiquidacion;

  @Column({ type: 'datetime2', name: 'fecha_inicio', default: () => 'SYSUTCDATETIME()' })
  fechaInicio: Date;

  @Column({ type: 'datetime2', name: 'fecha_fin', nullable: true })
  fechaFin: Date | null;

  @Column({ type: 'datetime2', name: 'fecha_cierre', nullable: true })
  fechaCierre: Date | null;

  @Column({ name: 'usuario_ejecuta', length: 100 })
  usuarioEjecuta: string;

  @Column({ name: 'usuario_cierre', length: 100, nullable: true })
  usuarioCierre: string | null;

  @Column({ type: 'int', name: 'total_colaboradores', nullable: true })
  totalColaboradores: number | null;

  @Column({ type: 'int', name: 'total_tiendas', nullable: true })
  totalTiendas: number | null;

  @Column({ type: 'decimal', precision: 18, scale: 2, name: 'total_comision', nullable: true })
  totalComision: number | null;

  /** ID de la parametrización vigente usada (referencia). */
  @Column({ name: 'parametrizacion_id', type: 'uniqueidentifier', nullable: true })
  parametrizacionId: string | null;

  /** Snapshot inmutable de la parametrización al momento de liquidar (HU-04). */
  @Column({ name: 'parametrizacion_json', type: 'nvarchar', length: 'max', nullable: true })
  parametrizacionJson: string | null;

  @Column({ name: 'archivo_plano_path', length: 500, nullable: true })
  archivoPlanoPath: string | null;

  @OneToMany(() => LiquidacionDetalle, (d) => d.liquidacion)
  detalles: LiquidacionDetalle[];

  @OneToMany(() => LiquidacionLog, (l) => l.liquidacion)
  logs: LiquidacionLog[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}