import { Controller, Get } from '@nestjs/common';
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
}
