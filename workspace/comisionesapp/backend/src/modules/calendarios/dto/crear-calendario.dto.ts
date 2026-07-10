import { IsBoolean, IsInt, IsNotEmpty, IsOptional, IsString, Max, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CrearCalendarioDto {
  @ApiProperty({ example: 'Comisiones 2027' })
  @IsString()
  @IsNotEmpty()
  nombre: string;

  @ApiProperty({ example: 2027 })
  @IsInt()
  @Min(2000)
  @Max(2100)
  anio: number;

  @ApiPropertyOptional({ default: true })
  @IsBoolean()
  @IsOptional()
  estadoActivo?: boolean;
}
