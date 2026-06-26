import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CalendariosService } from './calendarios.service';
import { CrearPeriodoDto } from './dto/crear-periodo.dto';

@ApiTags('Calendarios')
@ApiBearerAuth()
@Controller('calendarios')
export class CalendariosController {
  constructor(private readonly calendariosService: CalendariosService) {}

  @Get()
  @ApiOperation({ summary: 'Listar calendarios con sus periodos' })
  findAll() {
    return this.calendariosService.findAll();
  }

  @Get(':idCalendario')
  @ApiOperation({ summary: 'Obtener calendario por ID' })
  findOne(@Param('idCalendario') idCalendario: string) {
    return this.calendariosService.findOne(idCalendario);
  }

  @Post(':idCalendario/periodos')
  @ApiOperation({ summary: 'Crear periodo abierto dentro de un calendario' })
  createPeriodo(
    @Param('idCalendario') idCalendario: string,
    @Body() dto: CrearPeriodoDto,
  ) {
    return this.calendariosService.createPeriodo(idCalendario, dto);
  }
}
