import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsEnum,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  Length,
  Min,
} from 'class-validator';
import { IsGuid } from '../../../common/validators/is-guid.validator';
import { TipoPresupuesto } from '../entities/presupuesto-cargo-periodo.entity';

export class CrearPresupuestoDto {
  @ApiProperty({ example: '104517', description: 'Código de oficio Midasoft (6 dígitos)' })
  @IsString()
  @Length(6, 6)
  codigoOficio: string;

  @ApiProperty({ example: 'uuid-del-periodo' })
  @IsGuid()
  idPeriodo: string;

  @ApiPropertyOptional({ example: 'uuid-de-tienda', description: 'NULL = global por tienda/grupo' })
  @IsOptional()
  @IsGuid()
  idTienda?: string;

  @ApiProperty({ enum: TipoPresupuesto, example: TipoPresupuesto.TIENDA })
  @IsEnum(TipoPresupuesto)
  tipo: TipoPresupuesto;

  @ApiProperty({ example: 50000000, description: 'Valor presupuestado en COP' })
  @IsNumber()
  @IsPositive()
  @Min(0)
  @Type(() => Number)
  valor: number;
}

export class ActualizarPresupuestoDto {
  @ApiPropertyOptional({ enum: TipoPresupuesto })
  @IsOptional()
  @IsEnum(TipoPresupuesto)
  tipo?: TipoPresupuesto;

  @ApiPropertyOptional({ example: 50000000 })
  @IsOptional()
  @IsNumber()
  @IsPositive()
  @Min(0)
  @Type(() => Number)
  valor?: number;

  @ApiPropertyOptional({ example: 'uuid-de-tienda' })
  @IsOptional()
  @IsGuid()
  idTienda?: string;
}