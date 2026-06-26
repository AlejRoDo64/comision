import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CrearPeriodoDto } from './dto/crear-periodo.dto';
import { Calendario } from './entities/calendario.entity';
import { EstadoOperativo, Periodo } from './entities/periodo.entity';

@Injectable()
export class CalendariosService {
  constructor(
    @InjectRepository(Calendario)
    private readonly calendariosRepo: Repository<Calendario>,
    @InjectRepository(Periodo)
    private readonly periodosRepo: Repository<Periodo>,
  ) {}

  findAll(): Promise<Calendario[]> {
    return this.calendariosRepo.find({
      relations: { periodos: true },
      order: { anio: 'DESC', nombre: 'ASC', periodos: { fechaInicio: 'ASC' } },
    });
  }

  async findOne(idCalendario: string): Promise<Calendario> {
    const calendario = await this.calendariosRepo.findOne({
      where: { idCalendario },
      relations: { periodos: true },
      order: { periodos: { fechaInicio: 'ASC' } },
    });

    if (!calendario) throw new NotFoundException('Calendario no encontrado');
    return calendario;
  }

  async createPeriodo(idCalendario: string, dto: CrearPeriodoDto): Promise<Periodo> {
    const calendario = await this.findOne(idCalendario);
    this.validarRangoFechas(dto.fechaInicio, dto.fechaFin);
    await this.validarSinSolapamiento(idCalendario, dto.fechaInicio, dto.fechaFin);

    const periodo = this.periodosRepo.create({
      calendario,
      calendarioId: idCalendario,
      codigo: dto.codigo,
      fechaInicio: dto.fechaInicio,
      fechaFin: dto.fechaFin,
      estadoOperativo: EstadoOperativo.ABIERTO,
    });

    return this.periodosRepo.save(periodo);
  }

  private validarRangoFechas(fechaInicio: string, fechaFin: string): void {
    if (fechaFin < fechaInicio) {
      throw new BadRequestException('La fecha fin debe ser mayor o igual a la fecha inicio');
    }
  }

  private async validarSinSolapamiento(
    calendarioId: string,
    fechaInicio: string,
    fechaFin: string,
  ): Promise<void> {
    const total = await this.periodosRepo
      .createQueryBuilder('periodo')
      .where('periodo.calendarioId = :calendarioId', { calendarioId })
      .andWhere('periodo.fechaInicio <= :fechaFin', { fechaFin })
      .andWhere('periodo.fechaFin >= :fechaInicio', { fechaInicio })
      .getCount();

    if (total > 0) {
      throw new BadRequestException('El periodo se solapa con otro periodo del mismo calendario');
    }
  }
}
