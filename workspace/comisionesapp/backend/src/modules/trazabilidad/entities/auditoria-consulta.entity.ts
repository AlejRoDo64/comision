import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Liquidacion } from '../../liquidacion/entities/liquidacion.entity';

export enum AccionAuditoria {
  CONSULTA_RESUMEN = 'CONSULTA_RESUMEN',
  DRILLDOWN        = 'DRILLDOWN',
  EXPORTACION      = 'EXPORTACION',
}

/**
 * Auditoría de las acciones en el módulo de trazabilidad (HU-04).
 * Registra cada consulta de resumen, drill-down o exportación.
 */
@Entity('auditoria_consulta')
@Index('IX_aud_usuario', ['usuario', 'fecha'])
@Index('IX_aud_liq',     ['idLiquidacion', 'fecha'])
export class AuditoriaConsulta {
  @PrimaryGeneratedColumn('uuid', { name: 'id_auditoria' })
  idAuditoria: string;

  @ManyToOne(() => Liquidacion, { onDelete: 'CASCADE', nullable: true })
  @JoinColumn({ name: 'id_liquidacion' })
  liquidacion: Liquidacion | null;

  @Column({ name: 'id_liquidacion', type: 'uniqueidentifier', nullable: true })
  idLiquidacion: string | null;

  @Column({ name: 'id_colaborador', length: 20, nullable: true })
  idColaborador: string | null;

  @Column({ type: 'varchar', length: 30 })
  accion: AccionAuditoria;

  @Column({ name: 'filtros_json', type: 'nvarchar', length: 'max', nullable: true })
  filtrosJson: string | null;

  @Column({ length: 100 })
  usuario: string;

  @Column({ type: 'int', name: 'duracion_ms', nullable: true })
  duracionMs: number | null;

  @CreateDateColumn({ name: 'fecha' })
  fecha: Date;
}