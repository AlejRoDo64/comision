import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Liquidacion } from './liquidacion.entity';
import { Tienda } from '../../catalogos/entities/tienda.entity';

export enum MotivoSubperiodo {
  INICIAL       = 'INICIAL',
  CAMBIO_CARGO  = 'CAMBIO_CARGO',
  TRASLADO_CC   = 'TRASLADO_CC',
}

/**
 * Subperíodo: fragmento de un período del colaborador.
 * Si un colaborador no tuvo cambios durante el período, tiene 1 subperíodo (INICIAL).
 * Si tuvo un cambio de cargo el 15 de junio, tiene 2 subperíodos.
 * (HU-03 — fragmentación por cambios estructurales.)
 */
@Entity('liquidacion_subperiodo')
@Index('IX_liq_sub_colab', ['idLiquidacion', 'idColaborador'])
export class LiquidacionSubperiodo {
  @PrimaryGeneratedColumn('uuid', { name: 'id_subperiodo' })
  idSubperiodo: string;

  @ManyToOne(() => Liquidacion, (l) => l.detalles, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'id_liquidacion' })
  liquidacion: Liquidacion;

  @Column({ name: 'id_liquidacion', type: 'uniqueidentifier' })
  idLiquidacion: string;

  // Cédula del vendedor tal como llega de ICG (Cedula nvarchar(100))
  @Column({ name: 'id_colaborador', length: 100 })
  idColaborador: string;

  @Column({ type: 'date', name: 'fecha_inicio' })
  fechaInicio: string;

  @Column({ type: 'date', name: 'fecha_fin' })
  fechaFin: string;

  // Codigo_Oficio Midasoft llega como nvarchar(20)
  @Column({ name: 'id_cargo', length: 20 })
  idCargo: string;

  @Column({ name: 'id_centro_costo', length: 50, nullable: true })
  idCentroCosto: string | null;

  @ManyToOne(() => Tienda, { onDelete: 'NO ACTION', nullable: true, eager: true })
  @JoinColumn({ name: 'id_tienda' })
  tienda: Tienda | null;

  @Column({ name: 'id_tienda', type: 'uniqueidentifier', nullable: true })
  idTienda: string | null;

  // Código de tienda del origen (CO de ICG, nvarchar(50)). id_tienda (GUID del
  // catálogo local) solo se llena cuando la tienda existe sincronizada.
  @Column({ name: 'codigo_tienda', length: 50, nullable: true })
  codigoTienda: string | null;

  @Column({ type: 'varchar', length: 20, default: MotivoSubperiodo.INICIAL })
  motivo: MotivoSubperiodo;
}