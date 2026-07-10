import { Controller, Get, Param } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CatalogosService } from './catalogos.service';

@ApiTags('Catálogos')
@ApiBearerAuth()
@Controller('catalogos')
export class CatalogosController {
  constructor(private readonly svc: CatalogosService) {}

  @Get('colaboradores')
  @ApiOperation({ summary: 'Listar colaboradores del catálogo local (BD propia)' })
  colaboradores() {
    return this.svc.colaboradores();
  }

  @Get('tiendas')
  @ApiOperation({
    summary: 'Tiendas (centros de costo) derivadas del API de empleados Midasoft',
  })
  tiendas() {
    return this.svc.tiendasMidasoft();
  }

  @Get('cargos-por-tienda/:ccosto')
  @ApiOperation({
    summary: 'Cargos vinculados al centro de costo de la tienda (desde el API de empleados)',
  })
  cargosPorTienda(@Param('ccosto') ccosto: string) {
    return this.svc.cargosPorCcosto(ccosto);
  }
}
