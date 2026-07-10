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
import { PresupuestoRangosService } from '../services/presupuesto-rangos.service';
import { ReplaceRangosPresupuestoDto } from '../dto/rango-tablas.dto';
import { Roles } from '../../../common/decorators/roles.decorator';
import { CurrentUser } from '../../../auth/decorators/current-user.decorator';
import { JwtPayload } from '../../../auth/strategies/jwt.strategy';

@ApiTags('Parametrización — Rangos de presupuesto')
@ApiBearerAuth()
@Controller('parametrizacion/presupuestos-rangos')
export class PresupuestoRangosController {
  constructor(private readonly svc: PresupuestoRangosService) {}

  @Get()
  @ApiOperation({ summary: 'Listar rangos de cumplimiento de presupuesto' })
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
  replaceAll(
    @Body() dto: ReplaceRangosPresupuestoDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.svc.replaceAll(dto.codigoOficio, dto.idPeriodo, dto.rangos, user.email);
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