import {
  Body,
  Controller,
  Get,
  Header,
  Param,
  ParseUUIDPipe,
  Post,
  Query,
  Res,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import type { Response } from 'express';
import { TrazabilidadService } from '../services/trazabilidad.service';
import { FiltrosTrazabilidadDto } from '../dto/filtros-trazabilidad.dto';
import { CurrentUser } from '../../../auth/decorators/current-user.decorator';
import { JwtPayload } from '../../../auth/strategies/jwt.strategy';

@ApiTags('Trazabilidad (HU-04)')
@ApiBearerAuth()
@Controller('trazabilidad')
export class TrazabilidadController {
  constructor(private readonly svc: TrazabilidadService) {}

  @Post('resumen')
  @ApiOperation({
    summary: 'Resumen de liquidaciones con filtros combinables (HU-04)',
  })
  resumen(
    @Body() filtros: FiltrosTrazabilidadDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.svc.resumen(filtros ?? {}, user?.email ?? 'sistema');
  }

  @Get('detalle/:idLiquidacion/:idColaborador')
  @ApiOperation({
    summary: 'Drill-down por colaborador dentro de una liquidación',
  })
  drillDown(
    @Param('idLiquidacion', ParseUUIDPipe) idLiquidacion: string,
    @Param('idColaborador') idColaborador: string,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.svc.drillDown(
      idLiquidacion,
      idColaborador,
      user?.email ?? 'sistema',
    );
  }

  @Get('exportar/:idLiquidacion')
  @Header('Content-Type', 'text/csv; charset=utf-8')
  @Header('Content-Disposition', 'attachment; filename="trazabilidad.csv"')
  @ApiOperation({ summary: 'Exportar detalle de liquidación a CSV' })
  async exportar(
    @Param('idLiquidacion', ParseUUIDPipe) idLiquidacion: string,
    @Res() res: Response,
    @CurrentUser() user: JwtPayload,
  ): Promise<void> {
    const csv = await this.svc.exportarCsv(idLiquidacion, user?.email ?? 'sistema');
    res.send(csv);
  }

  @Get('colaboradores/:idLiquidacion')
  @ApiOperation({
    summary: 'Lista los IDs de colaboradores con detalle en una liquidación',
  })
  colaboradores(
    @Param('idLiquidacion', ParseUUIDPipe) idLiquidacion: string,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.svc.listarColaboradores(idLiquidacion, user?.email ?? 'sistema');
  }
}