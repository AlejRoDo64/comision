import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CrearProductoDto } from './dto/crear-producto.dto';
import { ActualizarProductoDto } from './dto/actualizar-producto.dto';
import { ProductosService } from './productos.service';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { JwtPayload } from '../auth/strategies/jwt.strategy';

@ApiTags('Productos')
@ApiBearerAuth()
@Controller('productos')
export class ProductosController {
  constructor(private readonly productosService: ProductosService) {}

  @Get()
  @ApiOperation({ summary: 'Listar todos los productos (requiere JWT)' })
  findAll(@CurrentUser() user: JwtPayload) {
    return this.productosService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener producto por ID (requiere JWT)' })
  @ApiResponse({ status: 404, description: 'Producto no encontrado' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.productosService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Crear nuevo producto (requiere JWT)' })
  create(@Body() dto: CrearProductoDto) {
    return this.productosService.create(dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar producto parcialmente (requiere JWT)' })
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: ActualizarProductoDto) {
    return this.productosService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar producto (requiere JWT)' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.productosService.remove(id);
  }
}
