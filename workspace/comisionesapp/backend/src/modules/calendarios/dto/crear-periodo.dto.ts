import { IsDateString, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsAfterOrEqual } from '../../../common/validators/is-after-or-equal.validator';
import { IsGuid } from '../../../common/validators/is-guid.validator';

export class CrearPeriodoDto {
  @ApiProperty({ example: 'uuid-del-calendario' })
  @IsGuid()
  @IsNotEmpty()
  idCalendario: string;

  @ApiPropertyOptional({
    example: 'ENE-2027',
    description:
      'Opcional: si no se envía, el backend lo genera automáticamente a partir del mes/año de la fecha fin (ej. ENE-2027).',
  })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  codigo?: string;

  @ApiProperty({ example: '2026-12-21' })
  @IsDateString()
  fechaInicio: string;

  @ApiProperty({ example: '2027-01-20' })
  @IsDateString()
  @IsAfterOrEqual('fechaInicio', {
    message: 'fechaFin debe ser mayor o igual que fechaInicio',
  })
  fechaFin: string;
}
