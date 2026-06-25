import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Calendario } from './entities/calendario.entity';
import { Periodo } from './entities/periodo.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Calendario, Periodo])],
  exports: [TypeOrmModule],
})
export class CalendariosModule {}
