import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsIn,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';
import { IsGuid } from '../../../common/validators/is-guid.validator';

/**
 * Filtros combinables para el endpoint de resumen de trazabilidad (HU-04).
 * Todos los filtros son opcionales. Si no se envía ninguno, se devuelven
 * todos los resultados (paginar en producción con limit/offset).
 */
export class FiltrosTrazabilidadDto {
  @ApiPropertyOptional({ description: 'UUID del calendario' })
  @IsOptional()
  @IsGuid()
  idCalendario?: string;

  @ApiPropertyOptional({ description: 'Año de liquidación', example: 2026 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(2000)
  @Max(2100)
  anio?: number;

  @ApiPropertyOptional({ description: 'UUID del período' })
  @IsOptional()
  @IsGuid()
  idPeriodo?: string;

  @ApiPropertyOptional({ description: 'ID del colaborador (Midasoft)' })
  @IsOptional()
  @IsString()
  idColaborador?: string;

  @ApiPropertyOptional({ description: 'UUID de la liquidación' })
  @IsOptional()
  @IsGuid()
  idLiquidacion?: string;

  @ApiPropertyOptional({ description: 'Código de oficio Midasoft' })
  @IsOptional()
  @IsString()
  codigoOficio?: string;

  @ApiPropertyOptional({ description: 'UUID de la tienda' })
  @IsOptional()
  @IsGuid()
  idTienda?: string;

  // idGrupo / zona: se añadirán cuando exista la entidad que los soporte;
  // aceptarlos e ignorarlos silenciosamente engaña al consumidor de la API.

  @ApiPropertyOptional({
    enum: ['Individual', 'GlobalTienda', 'GlobalGrupoTiendas'],
    description: 'Tipo de liquidación',
  })
  @IsOptional()
  @IsIn(['Individual', 'GlobalTienda', 'GlobalGrupoTiendas'])
  tipoLiquidacion?: string;

  @ApiPropertyOptional({ enum: ['Individual', 'Proporcional'] })
  @IsOptional()
  @IsIn(['Individual', 'Proporcional'])
  tipoDistribucion?: string;

  @ApiPropertyOptional({ description: 'Comisión mínima', example: 0 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  comisionMin?: number;

  @ApiPropertyOptional({ description: 'Comisión máxima', example: 1000000 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  comisionMax?: number;
}