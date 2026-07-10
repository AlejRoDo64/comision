import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsOptional, Max, Min, ValidateNested } from 'class-validator';

export class PatronPeriodoDto {
  @ApiPropertyOptional({ example: 21, description: 'Día de inicio del período (default 21)' })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(31)
  diaInicio?: number;

  @ApiPropertyOptional({ example: 20, description: 'Día de fin del período del mes siguiente (default 20)' })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(31)
  diaFin?: number;
}

/**
 * CRIT-6: el año ya no se pide — se toma del calendario (fuente única de verdad).
 * Si difieren, no hay ambigüedad: usamos siempre `calendario.anio`.
 */
export class GenerarAnioPeriodosDto {
  @ApiPropertyOptional({ type: PatronPeriodoDto, description: 'Patrón de fechas (default 21 → 20)' })
  @IsOptional()
  @ValidateNested()
  @Type(() => PatronPeriodoDto)
  patron?: PatronPeriodoDto;
}