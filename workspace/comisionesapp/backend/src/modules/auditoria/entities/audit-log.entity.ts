import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
} from 'typeorm';

export enum AuditAction {
  CREATE = 'CREATE',
  UPDATE = 'UPDATE',
  DELETE = 'DELETE',
}

@Entity('audit_log')
@Index('idx_audit_entity', ['entityName', 'entityId'])
@Index('idx_audit_changed_at', ['changedAt'])
export class AuditLog {
  @PrimaryGeneratedColumn('uuid', { name: 'id_audit_log' })
  idAuditLog: string;

  @Column({ name: 'entity_name', length: 100 })
  entityName: string;

  @Column({ name: 'entity_id', type: 'varchar', length: 36 })
  entityId: string;

  @Column({ type: 'varchar', length: 20 })
  action: AuditAction;

  @Column({ name: 'old_value', type: 'json', nullable: true })
  oldValue?: Record<string, unknown>;

  @Column({ name: 'new_value', type: 'json', nullable: true })
  newValue?: Record<string, unknown>;

  @Column({ name: 'changed_by', length: 120, nullable: true })
  changedBy?: string;

  @CreateDateColumn({ name: 'changed_at' })
  changedAt: Date;
}
