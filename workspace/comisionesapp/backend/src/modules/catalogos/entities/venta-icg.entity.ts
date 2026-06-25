import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Tienda } from './tienda.entity';

export enum TipoVenta {
  LINEA = 'LINEA',
  LINEA_ESTRATEGIA = 'LINEA_ESTRATEGIA',
  PROMOCION = 'PROMOCION',
}

/**
 * Insumo bruto de ventas proveniente del sistema ICG.
 * La normalización financiera (quitar IVA, descontar comisión bancaria)
 * es responsabilidad del motor de liquidación (HU-3).
 */
@Entity('venta_icg')
export class VentaICG {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'date' })
  fecha: string;

  @ManyToOne(() => Tienda)
  @JoinColumn({ name: 'id_tienda' })
  tienda: Tienda;

  // Referencia al colaborador en Midasoft — no es FK para permitir datos de integraciones
  @Column({ name: 'id_colaborador_midasoft', length: 20 })
  idColaboradorMidasoft: string;

  @Column({ name: 'tipo_venta', type: 'varchar', length: 30 })
  tipoVenta: TipoVenta;

  // Importe bruto tal como viene de ICG — puede o no incluir IVA
  @Column({ type: 'decimal', precision: 18, scale: 4 })
  importe: number;

  @Column({ name: 'incluye_iva', default: true })
  incluyeIva: boolean;

  // 0 = sin comisión bancaria; 0.032 = 3.2%
  @Column({
    name: 'tasa_comision_bancaria',
    type: 'decimal',
    precision: 6,
    scale: 4,
    default: '0',
  })
  tasaComisionBancaria: number;
}
