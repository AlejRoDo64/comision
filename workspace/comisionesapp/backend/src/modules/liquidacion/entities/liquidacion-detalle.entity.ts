import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { LiquidacionSubperiodo } from './liquidacion-subperiodo.entity';
import { Liquidacion } from './liquidacion.entity';
import { Tienda } from '../../catalogos/entities/tienda.entity';

export enum TipoVenta {
  LINEA            = 'LINEA',
  LINEA_ESTRATEGIA = 'LINEA_ESTRATEGIA',
  PROMOCION        = 'PROMOCION',
}

/**
 * Detalle de la liquidación: una fila por (colaborador, subperíodo, tipo de venta).
 * Es la unidad mínima que el motor persiste (HU-03).
 */
@Entity('liquidacion_detalle')
@Index('IX_liq_det_liq',   ['idLiquidacion'])
@Index('IX_liq_det_colab', ['idLiquidacion', 'idColaborador'])
export class LiquidacionDetalle {
  @PrimaryGeneratedColumn('uuid', { name: 'id_detalle' })
  idDetalle: string;

  @ManyToOne(() => Liquidacion, (l) => l.detalles, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'id_liquidacion' })
  liquidacion: Liquidacion;

  @Column({ name: 'id_liquidacion', type: 'uniqueidentifier' })
  idLiquidacion: string;

  // NO ACTION: la ruta CASCADE ya existe vía liquidacion; SQL Server rechaza
  // rutas de cascada múltiples (error 1785). El borrado de la liquidación
  // elimina detalles y subperíodos en la misma operación por sus FKs directas.
  @ManyToOne(() => LiquidacionSubperiodo, { onDelete: 'NO ACTION' })
  @JoinColumn({ name: 'id_subperiodo' })
  subperiodo: LiquidacionSubperiodo;

  @Column({ name: 'id_subperiodo', type: 'uniqueidentifier' })
  idSubperiodo: string;

  // Cédula del vendedor tal como llega de ICG (Cedula nvarchar(100))
  @Column({ name: 'id_colaborador', length: 100 })
  idColaborador: string;

  // Codigo_Oficio Midasoft llega como nvarchar(20)
  @Column({ name: 'id_cargo', length: 20 })
  idCargo: string;

  @ManyToOne(() => Tienda, { onDelete: 'NO ACTION', nullable: true, eager: true })
  @JoinColumn({ name: 'id_tienda' })
  tienda: Tienda | null;

  @Column({ name: 'id_tienda', type: 'uniqueidentifier', nullable: true })
  idTienda: string | null;

  // Código de tienda del origen (CO de ICG, nvarchar(50)). id_tienda (GUID del
  // catálogo local) solo se llena cuando la tienda existe sincronizada.
  @Column({ name: 'codigo_tienda', length: 50, nullable: true })
  codigoTienda: string | null;

  @Column({ name: 'tipo_venta', type: 'varchar', length: 30 })
  tipoVenta: TipoVenta;

  @Column({ type: 'decimal', precision: 18, scale: 2, name: 'venta_bruta' })
  ventaBruta: number;

  @Column({ type: 'decimal', precision: 18, scale: 2, name: 'venta_sin_iva' })
  ventaSinIva: number;

  @Column({ type: 'decimal', precision: 18, scale: 2, name: 'comision_bancaria', default: 0 })
  comisionBancaria: number;

  @Column({ type: 'decimal', precision: 18, scale: 2, name: 'venta_neta' })
  ventaNeta: number;

  @Column({ type: 'decimal', precision: 7, scale: 4, name: 'porcentaje_aplicado' })
  porcentajeAplicado: number;

  @Column({ type: 'decimal', precision: 18, scale: 2 })
  comision: number;

  @Column({ type: 'int', name: 'dias_laborados', nullable: true })
  diasLaborados: number | null;

  @Column({ type: 'decimal', precision: 7, scale: 2, name: 'horas_validas', nullable: true })
  horasValidas: number | null;

  @Column({ type: 'int', name: 'dias_excluidos', nullable: true })
  diasExcluidos: number | null;

  @Column({ name: 'motivo_exclusion', length: 200, nullable: true })
  motivoExclusion: string | null;

  @Column({ type: 'decimal', precision: 7, scale: 4, name: 'cumple_presupuesto', nullable: true })
  cumplePresupuesto: number | null;

  @Column({ type: 'decimal', precision: 7, scale: 4, name: 'cumple_crecimiento', nullable: true })
  cumpleCrecimiento: number | null;
}