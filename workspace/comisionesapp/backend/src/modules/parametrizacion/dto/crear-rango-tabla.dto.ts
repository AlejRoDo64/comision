import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsNumber, IsOptional, Min } from 'class-validator';

/**
 * Tabla de % aplicada según cumplimiento (presupuesto) o % crecimiento.
 * El `desdePorc` se interpreta según el endpoint que lo use.
 */
export class CrearRangoTablaDto {
  @ApiProperty({ example: 80, description: 'Cumplimiento desde (%)' })
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  desdePorc: number;

  @ApiProperty({ example: 90, description: 'Cumplimiento hasta (%) — null = ∞', required: false })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  hastaPorc?: number | null;

  @ApiProperty({ example: 0.29 })
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  porcLinea: number;

  @ApiProperty({ example: 0.2 })
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  porcPromocion: number;
}
