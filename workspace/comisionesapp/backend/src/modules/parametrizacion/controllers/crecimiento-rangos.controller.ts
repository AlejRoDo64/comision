import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { CrecimientoRangosService } from '../services/crecimiento-rangos.service';
import { ReplaceRangosPresupuestoDto } from '../dto/rango-tablas.dto';
import { Roles } from '../../../common/decorators/roles.decorator';

@ApiTags('Parametrización — Rangos de crecimiento')
@ApiBearerAuth()
@Controller('parametrizacion/crecimiento-rangos')
export class CrecimientoRangosController {
  constructor(private readonly svc: CrecimientoRangosService) {}

  @Get()
  @ApiOperation({ summary: 'Listar rangos de crecimiento' })
  @ApiQuery({ name: 'idPeriodo', required: false })
  @ApiQuery({ name: 'codigoOficio', required: false })
  findAll(
    @Query('idPeriodo') idPeriodo?: string,
    @Query('codigoOficio') codigoOficio?: string,
  ) {
    return this.svc.findAll(idPeriodo, codigoOficio);
  }

  @Post()
  @Roles('ADMINISTRADOR', 'PROFESIONAL_COMISIONES')
  @ApiOperation({ summary: 'Reemplazar todos los rangos de un (cargo, período)' })
  replaceAll(@Body() dto: ReplaceRangosPresupuestoDto) {
    return this.svc.replaceAll(dto.codigoOficio, dto.idPeriodo, dto.rangos);
  }

  @Delete(':codigoOficio/:idPeriodo')
  @Roles('ADMINISTRADOR')
  @ApiOperation({ summary: 'Eliminar todos los rangos de un (cargo, período)' })
  removeAll(
    @Param('codigoOficio') codigoOficio: string,
    @Param('idPeriodo') idPeriodo: string,
  ) {
    return this.svc.removeAll(codigoOficio, idPeriodo);
  }
}