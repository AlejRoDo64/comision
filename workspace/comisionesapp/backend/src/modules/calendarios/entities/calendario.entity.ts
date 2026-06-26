import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Periodo } from './periodo.entity';

@Entity('calendario')
@Index('idx_calendario_anio', ['anio'])
@Index('uq_calendario_nombre_anio', ['nombre', 'anio'], { unique: true })
export class Calendario {
  @PrimaryGeneratedColumn('uuid', { name: 'id_calendario' })
  idCalendario: string;

  @Column({ length: 150 })
  nombre: string;

  @Column({ type: 'int' })
  anio: number;

  @Column({ name: 'estado_activo', default: true })
  estadoActivo: boolean;

  @OneToMany(() => Periodo, (p) => p.calendario, { cascade: true })
  periodos: Periodo[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
