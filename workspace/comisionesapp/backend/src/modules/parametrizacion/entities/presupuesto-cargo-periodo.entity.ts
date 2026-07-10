import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Tienda } from '../../catalogos/entities/tienda.entity';
import { Periodo } from '../../calendarios/entities/periodo.entity';

export enum TipoPresupuesto {
  INDIVIDUAL = 'INDIVIDUAL',
  TIENDA = 'TIENDA',
  GRUPO = 'GRUPO',
}

/**
 * Valor presupuestado por cargo + período (HU-02 — Validación por presupuesto).
 * Una fila por cada combinación (cargo, período, tienda?, tipo).
 * Si idTienda es NULL, el valor aplica al global del grupo configurado en el cargo.
 */
@Entity('presupuesto_cargo_periodo')
@Index('IX_pres_cargo_periodo', ['codigoOficio', 'periodo'])
@Index('IX_pres_tienda', ['tienda'])
export class PresupuestoCargoPeriodo {
  @PrimaryGeneratedColumn('uuid', { name: 'id_presupuesto' })
  idPresupuesto: string;

  @Column({ name: 'codigo_oficio', length: 10 })
  codigoOficio: string;

  @ManyToOne(() => Periodo, { onDelete: 'NO ACTION', eager: true })
  @JoinColumn({ name: 'id_periodo' })
  periodo: Periodo;

  @ManyToOne(() => Tienda, { onDelete: 'NO ACTION', nullable: true, eager: true })
  @JoinColumn({ name: 'id_tienda' })
  tienda: Tienda | null;

  @Column({ type: 'varchar', length: 20 })
  tipo: TipoPresupuesto;

  @Column({ type: 'decimal', precision: 18, scale: 2 })
  valor: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}