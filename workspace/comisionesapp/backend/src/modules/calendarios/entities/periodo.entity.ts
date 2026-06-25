import {
  Column,
  CreateDateColumn,
  Entity,
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
export class Periodo {
  @PrimaryGeneratedColumn('uuid', { name: 'id_periodo' })
  idPeriodo: string;

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
