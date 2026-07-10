import { IsNumber, IsOptional, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class CrearRangoDto {
  @ApiProperty({ example: 90, description: 'Cumplimiento desde (%)' })
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  desdePorc: number;

  @ApiPropertyOptional({ example: 100, description: 'Cumplimiento hasta (%) — null u omitido = ∞' })
  @IsNumber()
  @Min(0)
  @IsOptional()
  @Type(() => Number)
  hastaPorc?: number | null;

  @ApiProperty({ example: 1.0, description: '% de comisión dentro del rango' })
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  comisionPorc: number;
}
