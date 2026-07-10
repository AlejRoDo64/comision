import { Controller, Get, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { IndicadoresService } from './indicadores.service';
import { MidasoftService } from './midasoft.service';
import { RangoFechasQueryDto } from './dto/rango-fechas-query.dto';

@ApiTags('Integraciones (solo lectura)')
@ApiBearerAuth()
@Controller('integraciones')
export class IntegracionesController {
  constructor(
    private readonly indicadores: IndicadoresService,
    private readonly midasoft: MidasoftService,
  ) {}

  @Get('comisiones/detalle')
  @ApiOperation({ summary: 'Detalle comisiones POS desde INDICADORES (SP_GetPOSCommissionsDetail)' })
  detalle(@Query() rango: RangoFechasQueryDto) {
    return this.indicadores.comisionesDetalle(rango.fechaInicial, rango.fechaFinal);
  }

  @Get('comisiones/resumen')
  @ApiOperation({ summary: 'Resumen comisiones POS desde INDICADORES (SP_GetPOSCommissionsSummary)' })
  resumen(@Query() rango: RangoFechasQueryDto) {
    return this.indicadores.comisionesResumen(rango.fechaInicial, rango.fechaFinal);
  }

  @Get('midasoft/empleados')
  @ApiOperation({ summary: 'Base de empleados Permoda desde API Midasoft' })
  empleados() {
    return this.midasoft.empleados();
  }
}
