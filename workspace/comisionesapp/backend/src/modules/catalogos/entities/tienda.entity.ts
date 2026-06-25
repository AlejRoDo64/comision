import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { GrupoTiendas } from './grupo-tiendas.entity';

@Entity('tienda')
export class Tienda {
  @PrimaryGeneratedColumn('uuid', { name: 'id_tienda' })
  idTienda: string;

  @Column({ length: 10, unique: true })
  codigo: string;

  @Column({ length: 100 })
  nombre: string;

  @Column({ default: true })
  activo: boolean;

  @ManyToOne(() => GrupoTiendas, (g) => g.tiendas)
  @JoinColumn({ name: 'id_grupo' })
  grupoTiendas: GrupoTiendas;
}
