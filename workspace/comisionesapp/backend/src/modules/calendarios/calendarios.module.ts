import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Calendario } from './entities/calendario.entity';
import { Periodo } from './entities/periodo.entity';
import { CalendariosController } from './calendarios.controller';
import { CalendariosService } from './calendarios.service';

@Module({
  imports: [TypeOrmModule.forFeature([Calendario, Periodo])],
  controllers: [CalendariosController],
  providers: [CalendariosService],
  exports: [TypeOrmModule],
})
export class CalendariosModule {}
