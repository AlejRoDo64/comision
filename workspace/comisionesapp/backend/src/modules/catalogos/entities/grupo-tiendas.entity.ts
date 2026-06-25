import {
  Column,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Tienda } from './tienda.entity';

@Entity('grupo_tiendas')
export class GrupoTiendas {
  @PrimaryGeneratedColumn('uuid', { name: 'id_grupo' })
  idGrupo: string;

  @Column({ length: 20, unique: true })
  codigo: string;

  @Column({ length: 100 })
  nombre: string;

  @OneToMany(() => Tienda, (t) => t.grupoTiendas)
  tiendas: Tienda[];
}
