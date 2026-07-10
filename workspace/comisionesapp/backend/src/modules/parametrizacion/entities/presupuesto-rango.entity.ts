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
 * Tabla de % de comisión aplicada según cumplimiento de presupuesto (HU-02).
 * Caso de uso: Staff Comercial — 5 rangos por cumplimiento del presupuesto.
 */
@Entity('presupuesto_rango_comision')
@Index('IX_pres_rango_orden', ['codigoOficio', 'periodo', 'desdePorc'])
export class PresupuestoRangoComision {
  @PrimaryGeneratedColumn('uuid', { name: 'id_rango' })
  idRango: string;

  @Column({ name: 'codigo_oficio', length: 10 })
  codigoOficio: string;

  @ManyToOne(() => Periodo, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'id_periodo' })
  periodo: Periodo;

  @Column({ type: 'decimal', precision: 7, scale: 2, name: 'desde_porc' })
  desdePorc: number;

  /** NULL = infinito (último rango abierto). */
  @Column({ type: 'decimal', precision: 7, scale: 2, name: 'hasta_porc', nullable: true })
  hastaPorc: number | null;

  @Column({ type: 'decimal', precision: 7, scale: 4, name: 'porc_linea' })
  porcLinea: number;

  @Column({ type: 'decimal', precision: 7, scale: 4, name: 'porc_promocion' })
  porcPromocion: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}