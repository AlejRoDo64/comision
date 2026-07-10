import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
} from '@nestjs/common';
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
  @Roles('PROFESIONAL_COMISIONES')
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

  @Patch(':id/cerrar')
  @Roles('PROFESIONAL_COMISIONES')
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
}