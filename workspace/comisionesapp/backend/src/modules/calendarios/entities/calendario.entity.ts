import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Periodo } from './periodo.entity';

@Entity('calendario')
export class Calendario {
  @PrimaryGeneratedColumn('uuid', { name: 'id_calendario' })
  idCalendario: string;

  @Column({ length: 100 })
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
