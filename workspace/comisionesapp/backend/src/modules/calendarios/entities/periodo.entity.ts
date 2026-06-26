import {
  Check,
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Calendario } from './calendario.entity';

export enum EstadoOperativo {
  ABIERTO = 'Abierto',
  EN_CURSO = 'EnCurso',
  LIQUIDADO = 'Liquidado',
  CERRADO = 'Cerrado',
}

@Entity('periodo')
@Check('chk_periodo_rango_fechas', 'fecha_fin >= fecha_inicio')
@Index('idx_periodo_calendario_fechas', ['calendarioId', 'fechaInicio', 'fechaFin'])
@Index('uq_periodo_calendario_codigo', ['calendarioId', 'codigo'], { unique: true })
export class Periodo {
  @PrimaryGeneratedColumn('uuid', { name: 'id_periodo' })
  idPeriodo: string;

  @Column({ name: 'id_calendario', type: 'varchar', length: 36 })
  calendarioId: string;

  @ManyToOne(() => Calendario, (c) => c.periodos, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'id_calendario' })
  calendario: Calendario;

  @Column({ length: 20 })
  codigo: string;

  @Column({ type: 'date', name: 'fecha_inicio' })
  fechaInicio: string;

  @Column({ type: 'date', name: 'fecha_fin' })
  fechaFin: string;

  // NO editar manualmente — gestionado por el proceso de liquidación (HU-3)
  @Column({
    name: 'estado_operativo',
    type: 'varchar',
    length: 20,
    default: EstadoOperativo.ABIERTO,
  })
  estadoOperativo: EstadoOperativo;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
