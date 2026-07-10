import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsNotEmpty, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { CrearRangoTablaDto } from './crear-rango-tabla.dto';

/**
 * Body para reemplazar TODOS los rangos de un (cargo, período) en una tabla
 * de presupuesto o de crecimiento.
 */
export class ReplaceRangosPresupuestoDto {
  @ApiProperty({ example: '104517' })
  @IsNotEmpty()
  codigoOficio: string;

  @ApiProperty({ example: 'uuid-del-periodo' })
  @IsNotEmpty()
  idPeriodo: string;

  @ApiProperty({ type: [CrearRangoTablaDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CrearRangoTablaDto)
  rangos: CrearRangoTablaDto[];
}