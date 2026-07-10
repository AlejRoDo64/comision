import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { ParametrizacionService } from './parametrizacion.service';
import { CrearParametrizacionDto } from './dto/crear-parametrizacion.dto';
import { ActualizarParametrizacionDto } from './dto/actualizar-parametrizacion.dto';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { JwtPayload } from '../../auth/strategies/jwt.strategy';
import { Roles } from '../../common/decorators/roles.decorator';

@ApiTags('Parametrización')
@ApiBearerAuth()
@Controller('parametrizacion')
export class ParametrizacionController {
  constructor(private readonly svc: ParametrizacionService) {}

  @Get('cargos')
  @ApiOperation({ summary: 'Catálogo oficial de cargos comisionables (Midasoft)' })
  catalogoCargos() {
    return this.svc.catalogoCargos();
  }

  @Get('vigente')
  @ApiOperation({
    summary: 'Parametrización vigente de un cargo en una fecha dada (HU-02)',
  })
  @ApiQuery({ name: 'codigoOficio', required: true, example: '104608' })
  @ApiQuery({ name: 'fecha', required: true, example: '2026-06-15' })
  vigente(
    @Query('codigoOficio') codigoOficio: string,
    @Query('fecha') fecha: string,
  ) {
    return this.svc.findVigente(codigoOficio, fecha);
  }

  @Get()
  @ApiOperation({ summary: 'Listar parametrizaciones (filtrables por período y cargo)' })
  @ApiQuery({ name: 'idPeriodo', required: false })
  @ApiQuery({ name: 'codigoOficio', required: false })
  findAll(
    @Query('idPeriodo') idPeriodo?: string,
    @Query('codigoOficio') codigoOficio?: string,
  ) {
    return this.svc.findAll(idPeriodo, codigoOficio);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener una parametrización con sus rangos' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.svc.findOne(id);
  }

  @Post()
  @Roles('ADMINISTRADOR', 'PROFESIONAL_COMISIONES')
  @ApiOperation({ summary: 'Crear parametrización de comisión (cargo + período)' })
  create(@Body() dto: CrearParametrizacionDto, @CurrentUser() user: JwtPayload) {
    return this.svc.create(dto, user?.email ?? 'sistema');
  }

  @Patch(':id')
  @Roles('ADMINISTRADOR', 'PROFESIONAL_COMISIONES')
  @ApiOperation({
    summary: 'Actualizar parametrización (motivo obligatorio, reemplaza rangos si vienen)',
  })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: ActualizarParametrizacionDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.svc.update(id, dto, user?.email ?? 'sistema');
  }

  @Patch(':id/desactivar')
  @Roles('ADMINISTRADOR', 'PROFESIONAL_COMISIONES')
  @ApiOperation({ summary: 'Desactivar parametrización (conserva histórico)' })
  desactivar(@Param('id', ParseUUIDPipe) id: string, @CurrentUser() user: JwtPayload) {
    return this.svc.desactivar(id, user?.email ?? 'sistema');
  }

  @Delete(':id')
  @Roles('ADMINISTRADOR')
  @ApiOperation({
    summary: 'Eliminar parametrización (solo configuraciones creadas por error)',
  })
  remove(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.svc.remove(id, user?.email ?? 'sistema');
  }
}