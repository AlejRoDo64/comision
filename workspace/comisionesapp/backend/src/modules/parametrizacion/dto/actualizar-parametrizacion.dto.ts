import { ApiProperty, PartialType, OmitType } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MaxLength } from 'class-validator';
import { CrearParametrizacionDto } from './crear-parametrizacion.dto';

/** El motivo siempre es obligatorio al modificar (auditoría HU-02). */
export class ActualizarParametrizacionDto extends PartialType(
  OmitType(CrearParametrizacionDto, ['motivo'] as const),
) {
  @ApiProperty({ example: 'Ajuste de porcentajes por cambio de regla de negocio', maxLength: 300 })
  @IsString()
  @IsNotEmpty()
  @MaxLength(300)
  motivo: string;
}