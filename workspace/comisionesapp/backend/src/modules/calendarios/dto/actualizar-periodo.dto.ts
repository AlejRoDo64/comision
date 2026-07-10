import { IsDateString, IsOptional, IsString, ValidateIf } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsAfterOrEqual } from '../../../common/validators/is-after-or-equal.validator';

export class ActualizarPeriodoDto {
  @ApiPropertyOptional({ example: 'ENE-2027' })
  @IsString()
  @IsOptional()
  codigo?: string;

  @ApiPropertyOptional({ example: '2026-12-21' })
  @IsDateString()
  @IsOptional()
  fechaInicio?: string;

  @ApiPropertyOptional({ example: '2027-01-20' })
  @IsDateString()
  @IsOptional()
  @ValidateIf((o) => o.fechaInicio !== undefined && o.fechaFin !== undefined)
  @IsAfterOrEqual('fechaInicio', {
    message: 'fechaFin debe ser mayor o igual que fechaInicio',
  })
  fechaFin?: string;
}
