import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Periodo } from '../../calendarios/entities/periodo.entity';
import { RangoComision } from './rango-comision.entity';

export enum TipoLiquidacion {
  INDIVIDUAL = 'Individual',
  GLOBAL_TIENDA = 'GlobalTienda',
  GLOBAL_GRUPO = 'GlobalGrupoTiendas',
}

export enum TipoDistribucion {
  INDIVIDUAL = 'Individual',
  PROPORCIONAL = 'Proporcional',
}

export enum TipoAfectacion {
  HORAS = 'HorasLaboradas',
  NOVEDADES = 'NovedadesDiarias',
}

/** Origen del % de descuento aplicado a Línea Estrategia (HU-02). */
export enum EstrategiaTipoDescuento {
  CORPORATIVO = 'CORPORATIVO',
  REAL = 'REAL',
}

/**
 * Configuración estructural de comisiones (HU-02).
 * Una configuración por CARGO (código de oficio Midasoft) y PERÍODO de vigencia.
 * El motor de liquidación (HU-03) consume esta parametrización sin modificarla.
 */
@Entity('parametrizacion_cargo')
export class ParametrizacionCargo {
  @PrimaryGeneratedColumn('uuid', { name: 'id_parametrizacion' })
  idParametrizacion: string;

  /** Código de oficio oficial de Midasoft (ej. 104608). Solo referencia, no edición. */
  @Column({ name: 'codigo_oficio', length: 10 })
  codigoOficio: string;

  @Column({ name: 'nombre_cargo', length: 100 })
  nombreCargo: string;

  /** Período de vigencia de esta configuración (calendario + período). */
  @ManyToOne(() => Periodo, { onDelete: 'NO ACTION', eager: true })
  @JoinColumn({ name: 'id_periodo' })
  periodo: Periodo;

  @Column({ name: 'tipo_liquidacion', type: 'varchar', length: 30 })
  tipoLiquidacion: TipoLiquidacion;

  @Column({ name: 'tipo_distribucion', type: 'varchar', length: 20 })
  tipoDistribucion: TipoDistribucion;

  // ── Porcentajes por tipo de venta ──────────────────────────────────
  @Column({ type: 'decimal', precision: 7, scale: 4, name: 'porc_linea', default: 0 })
  porcLinea: number;

  @Column({ type: 'decimal', precision: 7, scale: 4, name: 'porc_promocion', default: 0 })
  porcPromocion: number;

  @Column({ type: 'decimal', precision: 7, scale: 4, name: 'porc_estrategia', default: 0 })
  porcEstrategia: number;

  // ── Condiciones de validación ──────────────────────────────────────
  @Column({ name: 'validar_presupuesto', default: false })
  validarPresupuesto: boolean;

  @Column({ name: 'validar_crecimiento', default: false })
  validarCrecimiento: boolean;

  /** Afectación excluyente: HorasLaboradas XOR NovedadesDiarias (regla HU-02). */
  @Column({ name: 'tipo_afectacion', type: 'varchar', length: 20 })
  tipoAfectacion: TipoAfectacion;

  // ── Vigencia de esta configuración (HU-02) ────────────────────────
  /** Desde-hasta define cuándo esta parametrización aplica. NULL = sin tope. */
  @Column({ type: 'date', name: 'vigencia_desde', nullable: true })
  vigenciaDesde: string | null;

  @Column({ type: 'date', name: 'vigencia_hasta', nullable: true })
  vigenciaHasta: string | null;

  // ── Línea Estrategia con descuento (HU-02) ────────────────────────
  @Column({
    name: 'estrategia_tipo_descuento',
    type: 'varchar',
    length: 20,
    nullable: true,
  })
  estrategiaTipoDescuento: EstrategiaTipoDescuento | null;

  /** % de descuento corporativo que se resta a porcLinea para obtener porcEstrategia. */
  @Column({
    name: 'estrategia_porc_descuento_corporativo',
    type: 'decimal',
    precision: 7,
    scale: 4,
    nullable: true,
  })
  estrategiaPorcDescuentoCorporativo: number | null;

  // ── Rangos de comisión por cumplimiento ────────────────────────────
  @OneToMany(() => RangoComision, (r) => r.parametrizacion, { cascade: true, eager: true })
  rangos: RangoComision[];

  // ── Auditoría / control de cambios ─────────────────────────────────
  @Column({ name: 'estado_activo', default: true })
  estadoActivo: boolean;

  @Column({ length: 300 })
  motivo: string;

  @Column({ name: 'usuario_cambio', length: 100 })
  usuarioCambio: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
