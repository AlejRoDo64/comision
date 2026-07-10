import { Global, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LogCambioEstructural, TipoEntidadLog, AccionLog } from './log-cambio-estructural.entity';
import { LogEstructuralService } from './log-estructural.service';

export { LogCambioEstructural, TipoEntidadLog, AccionLog };
export { LogEstructuralService } from './log-estructural.service';
export type { RegistroLogParams } from './log-estructural.service';

/**
 * Módulo global de auditoría estructural.
 *
 * Se importa UNA vez en AppModule y queda disponible en todos los
 * módulos sin necesidad de re-importar. Cualquier servicio de dominio
 * (calendarios, parametrización, etc.) puede inyectar LogEstructuralService.
 */
@Global()
@Module({
  imports: [TypeOrmModule.forFeature([LogCambioEstructural])],
  providers: [LogEstructuralService],
  exports: [LogEstructuralService],
})
export class AuditModule {}