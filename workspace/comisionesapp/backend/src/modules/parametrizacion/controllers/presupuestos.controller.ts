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
import { PresupuestosService } from '../services/presupuestos.service';
import {
  CrearPresupuestoDto,
  ActualizarPresupuestoDto,
} from '../dto/presupuesto.dto';
import { Roles } from '../../../common/decorators/roles.decorator';

@ApiTags('Parametrización — Presupuestos')
@ApiBearerAuth()
@Controller('parametrizacion/presupuestos')
export class PresupuestosController {
  constructor(private readonly svc: PresupuestosService) {}

  @Get()
  @ApiOperation({ summary: 'Listar presupuestos (filtros opcionales)' })
  @ApiQuery({ name: 'idPeriodo', required: false })
  @ApiQuery({ name: 'codigoOficio', required: false })
  @ApiQuery({ name: 'idTienda', required: false })
  findAll(
    @Query('idPeriodo') idPeriodo?: string,
    @Query('codigoOficio') codigoOficio?: string,
    @Query('idTienda') idTienda?: string,
  ) {
    return this.svc.findAll(idPeriodo, codigoOficio, idTienda);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Consultar un presupuesto por id' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.svc.findOne(id);
  }

  @Post()
  @Roles('ADMINISTRADOR', 'PROFESIONAL_COMISIONES')
  @ApiOperation({ summary: 'Crear presupuesto por cargo/período' })
  create(@Body() dto: CrearPresupuestoDto) {
    return this.svc.create(dto);
  }

  @Patch(':id')
  @Roles('ADMINISTRADOR', 'PROFESIONAL_COMISIONES')
  @ApiOperation({ summary: 'Actualizar presupuesto' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: ActualizarPresupuestoDto,
  ) {
    return this.svc.update(id, dto);
  }

  @Delete(':id')
  @Roles('ADMINISTRADOR')
  @ApiOperation({ summary: 'Eliminar presupuesto' })
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.svc.remove(id);
  }
}