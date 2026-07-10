import { ConflictException, Injectable, Logger } from '@nestjs/common';
import { DataSource, QueryRunner } from 'typeorm';

/**
 * Lock pesimista a nivel de BD para evitar ejecuciones concurrentes del motor
 * sobre el mismo período (HU-03 — bloqueo de ejecución concurrente).
 *
 * Implementación: `sp_getapplock` de SQL Server sobre un QueryRunner dedicado —
 * garantiza que adquirir y liberar el lock ocurren en la MISMA conexión
 * (con el pool de TypeORM, dos `query()` sueltos pueden caer en conexiones
 * distintas y el lock de sesión no se liberaría).
 * Si el lock no se obtiene en 5s, lanza ConflictException (HTTP 409).
 */
@Injectable()
export class LiquidacionLockService {
  private readonly logger = new Logger(LiquidacionLockService.name);
  private static readonly LOCK_NAME = 'LIQUIDACION_PERIODO';
  private static readonly TIMEOUT_MS = 5_000;

  constructor(private readonly dataSource: DataSource) {}

  /** Ejecuta `fn` bajo un lock exclusivo sobre el período. */
  async ejecutarBajoLock<T>(idPeriodo: string, fn: () => Promise<T>): Promise<T> {
    const lockName = `${LiquidacionLockService.LOCK_NAME}_${idPeriodo}`;
    const runner: QueryRunner = this.dataSource.createQueryRunner();
    await runner.connect();

    try {
      // sp_getapplock devuelve: 0=ok, 1=ok (esperó), -1=timeout, -2=cancel
      const resultado = await runner.query(
        `DECLARE @res INT; ` +
        `EXEC @res = sp_getapplock @Resource = @0, @LockMode = 'Exclusive', ` +
        `  @LockOwner = 'Session', @LockTimeout = @1; ` +
        `SELECT @res AS ok`,
        [lockName, LiquidacionLockService.TIMEOUT_MS],
      );
      const ok = resultado?.[0]?.ok;
      if (ok == null || ok < 0) {
        throw new ConflictException(
          `Ya hay una liquidación en curso para este período. Intente de nuevo cuando termine.`,
        );
      }

      this.logger.log(`Lock adquirido: ${lockName}`);
      try {
        return await fn();
      } finally {
        try {
          await runner.query('EXEC sp_releaseapplock @Resource = @0', [lockName]);
          this.logger.log(`Lock liberado: ${lockName}`);
        } catch (e) {
          this.logger.warn(`Error liberando lock ${lockName}: ${e?.message ?? e}`);
        }
      }
    } finally {
      await runner.release();
    }
  }
}
