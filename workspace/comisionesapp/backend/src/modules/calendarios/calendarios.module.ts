import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Calendario } from './entities/calendario.entity';
import { Periodo } from './entities/periodo.entity';
import { CalendariosService } from './calendarios.service';
import { CalendariosController } from './calendarios.controller';
import { AuditModule } from '../../common/audit/audit.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Calendario, Periodo]),
    AuditModule,   // LogEstructuralService viene global, pero lo declaramos aquí
                   // explícitamente para que NestJS rastree la dependencia.
  ],
  controllers: [CalendariosController],
  providers: [CalendariosService],
  exports: [TypeOrmModule, CalendariosService],
})
export class CalendariosModule {}