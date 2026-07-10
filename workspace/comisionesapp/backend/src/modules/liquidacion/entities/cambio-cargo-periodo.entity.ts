import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Periodo } from '../../calendarios/entities/periodo.entity';
import { Tienda } from '../../catalogos/entities/tienda.entity';

export enum TipoCambio {
  CAMBIO_CARGO = 'CAMBIO_CARGO',
  TRASLADO_CC  = 'TRASLADO_CC',
}

/**
 * Cambio estructural (cargo o centro de costo) detectado durante un período.
 * Se carga desde Midasoft o manualmente. La liquidación los usa para fragmentar
 * el período en subperíodos (HU-03).
 */
@Entity('cambio_cargo_periodo')
@Index('IX_cambio_colab', ['idColaborador', 'idPeriodo'])
export class CambioCargoPeriodo {
  @PrimaryGeneratedColumn('uuid', { name: 'id_cambio' })
  idCambio: string;

  @Column({ name: 'id_colaborador', length: 20 })
  idColaborador: string;

  @ManyToOne(() => Periodo, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'id_periodo' })
  periodo: Periodo;

  @Column({ name: 'id_periodo', type: 'uniqueidentifier' })
  idPeriodo: string;

  @Column({ type: 'date', name: 'fecha_cambio' })
  fechaCambio: string;

  @Column({ name: 'tipo_cambio', type: 'varchar', length: 20 })
  tipoCambio: TipoCambio;

  @Column({ name: 'cargo_anterior', length: 10, nullable: true })
  cargoAnterior: string | null;

  @Column({ name: 'cargo_nuevo', length: 10, nullable: true })
  cargoNuevo: string | null;

  @ManyToOne(() => Tienda, { onDelete: 'NO ACTION', nullable: true })
  @JoinColumn({ name: 'tienda_anterior' })
  tiendaAnteriorRef: Tienda | null;

  @Column({ name: 'tienda_anterior', type: 'uniqueidentifier', nullable: true })
  tiendaAnterior: string | null;

  @ManyToOne(() => Tienda, { onDelete: 'NO ACTION', nullable: true })
  @JoinColumn({ name: 'tienda_nueva' })
  tiendaNuevaRef: Tienda | null;

  @Column({ name: 'tienda_nueva', type: 'uniqueidentifier', nullable: true })
  tiendaNueva: string | null;

  @Column({ name: 'centro_costo_anterior', length: 50, nullable: true })
  centroCostoAnterior: string | null;

  @Column({ name: 'centro_costo_nuevo', length: 50, nullable: true })
  centroCostoNuevo: string | null;

  @Column({ type: 'varchar', length: 20, default: 'Midasoft' })
  fuente: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}