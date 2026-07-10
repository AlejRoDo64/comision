import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ParametrizacionCargo } from './parametrizacion-cargo.entity';

/**
 * Rango de comisión por cumplimiento, hijo de una parametrización
 * (es decir, de un cargo + período de vigencia).
 */
@Entity('rango_comision')
export class RangoComision {
  @PrimaryGeneratedColumn('uuid', { name: 'id_rango' })
  idRango: string;

  @ManyToOne(() => ParametrizacionCargo, (p) => p.rangos, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'id_parametrizacion' })
  parametrizacion: ParametrizacionCargo;

  /** Cumplimiento desde (%) — inclusivo. */
  @Column({ type: 'decimal', precision: 7, scale: 2, name: 'desde_porc' })
  desdePorc: number;

  /** Cumplimiento hasta (%) — null = infinito. */
  @Column({ type: 'decimal', precision: 7, scale: 2, name: 'hasta_porc', nullable: true })
  hastaPorc: number | null;

  /** % de comisión que aplica dentro del rango. */
  @Column({ type: 'decimal', precision: 7, scale: 4, name: 'comision_porc' })
  comisionPorc: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
