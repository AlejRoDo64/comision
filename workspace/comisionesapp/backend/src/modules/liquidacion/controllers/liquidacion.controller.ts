import {
  Body,
  Controller,
  Get,
  Header,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Res,
} from '@nestjs/common';
import type { Response } from 'express';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiProperty, ApiTags } from '@nestjs/swagger';
import { LiquidacionService } from '../services/liquidacion.service';
import { CurrentUser } from '../../../auth/decorators/current-user.decorator';
import { JwtPayload } from '../../../auth/strategies/jwt.strategy';
import { Roles } from '../../../common/decorators/roles.decorator';
import { IsNotEmpty, IsString } from 'class-validator';

class EjecutarLiquidacionDto {
  @ApiProperty({
    description: 'UUID del período o su código generado (ej. "2026-P01")',
    example: '2026-P01',
  })
  @IsString()
  @IsNotEmpty()
  idPeriodo: string;
}

@ApiTags('Liquidación (HU-03)')
@ApiBearerAuth()
@Controller('liquidacion')
export class LiquidacionController {
  constructor(private readonly svc: LiquidacionService) {}

  @Get('elegibilidad/:idPeriodo')
  @ApiOperation({ summary: 'Verificar si un período es elegible para liquidación' })
  @ApiParam({
    name: 'idPeriodo',
    description: 'UUID del período o su código generado (ej. "2026-P01")',
  })
  async elegibilidad(@Param('idPeriodo') idPeriodo: string) {
    return this.svc.verificarElegibilidad(idPeriodo);
  }

  @Post('ejecutar')
  @Roles('ADMINISTRADOR', 'PROFESIONAL_COMISIONES')
  @ApiOperation({
    summary: 'Ejecutar liquidación automática del período (síncrono)',
  })
  ejecutar(
    @Body() dto: EjecutarLiquidacionDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.svc.ejecutar({
      idPeriodo: dto.idPeriodo,
      usuario: user?.email ?? 'sistema',
    });
  }

  @Post('detener')
  @Roles('ADMINISTRADOR', 'PROFESIONAL_COMISIONES')
  @ApiOperation({
    summary: 'Detener la liquidación en ejecución del período (HU-03 — botón Detener)',
  })
  detener(@Body() dto: EjecutarLiquidacionDto) {
    return this.svc.detener(dto.idPeriodo);
  }

  @Patch(':id/cerrar')
  @Roles('ADMINISTRADOR', 'PROFESIONAL_COMISIONES')
  @ApiOperation({ summary: 'Cerrar una liquidación LIQUIDADO → CERRADO' })
  cerrar(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.svc.cerrar(id, user?.email ?? 'sistema');
  }

  @Get()
  @ApiOperation({ summary: 'Listar todas las liquidaciones' })
  findAll() {
    return this.svc.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener detalle completo de una liquidación' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.svc.findOne(id);
  }

  @Get(':id/archivo')
  @ApiOperation({ summary: 'Descargar el archivo plano de nómina de la liquidación (HU-03)' })
  @Header('Content-Type', 'text/plain; charset=utf-8')
  async archivo(
    @Param('id', ParseUUIDPipe) id: string,
    @Res({ passthrough: true }) res: Response,
  ): Promise<string> {
    const { nombre, contenido } = await this.svc.obtenerArchivoPlano(id);
    res.setHeader('Content-Disposition', `attachment; filename="${nombre}"`);
    return contenido;
  }
}