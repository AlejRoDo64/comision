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
import { Periodo } from '../../calendarios/entities/periodo.entity';

/**
 * Tabla de % de comisión aplicada según % de crecimiento de ventas (HU-02).
 * Compara ventas del período actual contra el período base equivalente.
 */
@Entity('crecimiento_rango')
@Index('IX_crec_orden', ['codigoOficio', 'periodo', 'desdePorcCrec'])
export class CrecimientoRango {
  @PrimaryGeneratedColumn('uuid', { name: 'id_rango' })
  idRango: string;

  @Column({ name: 'codigo_oficio', length: 10 })
  codigoOficio: string;

  @ManyToOne(() => Periodo, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'id_periodo' })
  periodo: Periodo;

  @Column({ type: 'decimal', precision: 7, scale: 2, name: 'desde_porc_crec' })
  desdePorcCrec: number;

  /** NULL = infinito (último rango abierto). */
  @Column({ type: 'decimal', precision: 7, scale: 2, name: 'hasta_porc_crec', nullable: true })
  hastaPorcCrec: number | null;

  @Column({ type: 'decimal', precision: 7, scale: 4, name: 'porc_linea' })
  porcLinea: number;

  @Column({ type: 'decimal', precision: 7, scale: 4, name: 'porc_promocion' })
  porcPromocion: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}