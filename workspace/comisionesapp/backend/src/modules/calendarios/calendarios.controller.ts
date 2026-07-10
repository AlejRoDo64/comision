import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CalendariosService } from './calendarios.service';
import { CrearCalendarioDto } from './dto/crear-calendario.dto';
import { ActualizarCalendarioDto } from './dto/actualizar-calendario.dto';
import { CrearPeriodoDto } from './dto/crear-periodo.dto';
import { ActualizarPeriodoDto } from './dto/actualizar-periodo.dto';
import { GenerarAnioPeriodosDto } from './dto/generar-anio-periodos.dto';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { JwtPayload } from '../../auth/strategies/jwt.strategy';
import { Roles } from '../../common/decorators/roles.decorator';

@ApiTags('Calendarios')
@ApiBearerAuth()
@Controller('calendarios')
export class CalendariosController {
  constructor(private readonly svc: CalendariosService) {}

  // ── Calendarios ────────────────────────────────────────────────────

  @Get()
  @ApiOperation({ summary: 'Listar todos los calendarios' })
  findAll() {
    return this.svc.findAllCalendarios();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener calendario con sus períodos' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.svc.findOneCalendario(id);
  }

  @Post()
  @Roles('ADMINISTRADOR', 'PROFESIONAL_COMISIONES')
  @ApiOperation({ summary: 'Crear nuevo calendario' })
  create(@Body() dto: CrearCalendarioDto, @CurrentUser() user: JwtPayload) {
    return this.svc.createCalendario(dto, user?.email ?? 'sistema');
  }

  @Patch(':id')
  @Roles('ADMINISTRADOR', 'PROFESIONAL_COMISIONES')
  @ApiOperation({ summary: 'Actualizar calendario' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: ActualizarCalendarioDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.svc.updateCalendario(id, dto, user?.email ?? 'sistema');
  }

  @Delete(':id')
  @Roles('ADMINISTRADOR')
  @ApiOperation({ summary: 'Eliminar calendario (solo si no tiene períodos)' })
  remove(@Param('id', ParseUUIDPipe) id: string, @CurrentUser() user: JwtPayload) {
    return this.svc.removeCalendario(id, user?.email ?? 'sistema');
  }

  // ── Periodos ───────────────────────────────────────────────────────

  @Get(':id/periodos')
  @ApiOperation({ summary: 'Listar períodos de un calendario' })
  findPeriodos(@Param('id', ParseUUIDPipe) id: string) {
    return this.svc.findPeriodosByCalendario(id);
  }

  @Post('periodos')
  @HttpCode(201)
  @Roles('ADMINISTRADOR', 'PROFESIONAL_COMISIONES')
  @ApiOperation({ summary: 'Crear nuevo período' })
  createPeriodo(@Body() dto: CrearPeriodoDto, @CurrentUser() user: JwtPayload) {
    return this.svc.createPeriodo(dto, user?.email ?? 'sistema');
  }

  @Post(':id/periodos/generar-anio')
  @HttpCode(201)
  @Roles('ADMINISTRADOR', 'PROFESIONAL_COMISIONES')
  @ApiOperation({
    summary: 'Generar masivamente los 12 períodos de un año (patrón 21→20 por defecto)',
  })
  generarAnio(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: GenerarAnioPeriodosDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.svc.generarAnioPeriodos(id, dto, user?.email ?? 'sistema');
  }

  @Patch('periodos/:id')
  @Roles('ADMINISTRADOR', 'PROFESIONAL_COMISIONES')
  @ApiOperation({ summary: 'Actualizar período (solo si está Abierto)' })
  updatePeriodo(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: ActualizarPeriodoDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.svc.updatePeriodo(id, dto, user?.email ?? 'sistema');
  }

  // HU-01: el actor del módulo es el responsable de Compensaciones; la
  // protección real es por datos (solo Abierto y sin liquidaciones asociadas).
  @Delete('periodos/:id')
  @Roles('ADMINISTRADOR', 'PROFESIONAL_COMISIONES')
  @ApiOperation({ summary: 'Eliminar período (solo si está Abierto y sin liquidaciones)' })
  removePeriodo(@Param('id', ParseUUIDPipe) id: string, @CurrentUser() user: JwtPayload) {
    return this.svc.removePeriodo(id, user?.email ?? 'sistema');
  }
}