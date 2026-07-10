import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsNotEmpty } from 'class-validator';
import { IsAfterOrEqual } from '../../../common/validators/is-after-or-equal.validator';

/** Rango de fechas para consultar los SP de INDICADORES (solo lectura). */
export class RangoFechasQueryDto {
  @ApiProperty({ example: '2026-05-21', description: 'Fecha inicial (YYYY-MM-DD)' })
  @IsNotEmpty()
  @IsDateString({}, { message: 'fechaInicial debe tener formato YYYY-MM-DD' })
  fechaInicial: string;

  @ApiProperty({ example: '2026-06-20', description: 'Fecha final (YYYY-MM-DD)' })
  @IsNotEmpty()
  @IsDateString({}, { message: 'fechaFinal debe tener formato YYYY-MM-DD' })
  @IsAfterOrEqual('fechaInicial', {
    message: 'fechaFinal no puede ser menor que fechaInicial',
  })
  fechaFinal: string;
}
