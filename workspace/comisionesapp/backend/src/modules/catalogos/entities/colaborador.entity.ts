import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Tienda } from './tienda.entity';

@Entity('colaborador')
export class Colaborador {
  @PrimaryGeneratedColumn('uuid', { name: 'id_colaborador' })
  idColaborador: string;

  // Clave foránea al sistema Midasoft — usada para correlacionar marcaciones y novedades
  @Column({ name: 'id_midasoft', length: 20, unique: true })
  idMidasoft: string;

  @Column({ length: 100 })
  nombres: string;

  @Column({ length: 100 })
  apellidos: string;

  @Column({ name: 'tipo_documento', length: 5 })
  tipoDocumento: string;

  @Column({ name: 'numero_documento', length: 20, unique: true })
  numeroDocumento: string;

  // Texto libre hasta HU-2 (Parametrización de cargos) que introduce la entidad Cargo
  @Column({ length: 100 })
  cargo: string;

  @ManyToOne(() => Tienda)
  @JoinColumn({ name: 'id_tienda' })
  tienda: Tienda;

  @Column({ default: true })
  activo: boolean;
}
