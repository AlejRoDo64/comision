import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsPositive, IsString, Min } from 'class-validator';

export class CrearProductoDto {
  @ApiProperty({ example: 'Camiseta Polo', description: 'Nombre del producto' })
  @IsString()
  @IsNotEmpty()
  nombre: string;

  @ApiProperty({ example: 'Camiseta de algodón 100%', description: 'Descripción' })
  @IsString()
  @IsNotEmpty()
  descripcion: string;

  @ApiProperty({ example: 49900, description: 'Precio en COP' })
  @IsNumber()
  @IsPositive()
  precio: number;

  @ApiProperty({ example: 100, description: 'Stock disponible' })
  @IsNumber()
  @Min(0)
  stock: number;
}
