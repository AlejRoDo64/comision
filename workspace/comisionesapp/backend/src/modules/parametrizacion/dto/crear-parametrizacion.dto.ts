import {
  ArrayMinSize,
  IsArray,
  IsBoolean,
  IsDateString,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
  Min,
  ValidateIf,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  EstrategiaTipoDescuento,
  TipoAfectacion,
  TipoDistribucion,
  TipoLiquidacion,
} from '../entities/parametrizacion-cargo.entity';
import { CrearRangoDto } from './crear-rango.dto';
import { IsGuid } from '../../../common/validators/is-guid.validator';

export class CrearParametrizacionDto {
  @ApiProperty({ example: '104608', description: 'Código de oficio Midasoft' })
  @IsString()
  @IsNotEmpty()
  codigoOficio: string;

  @ApiProperty({ example: 'uuid-del-periodo', description: 'Período de organización' })
  @IsGuid()
  idPeriodo: string;

  @ApiProperty({ enum: TipoLiquidacion, example: TipoLiquidacion.INDIVIDUAL })
  @IsEnum(TipoLiquidacion)
  tipoLiquidacion: TipoLiquidacion;

  @ApiProperty({ enum: TipoDistribucion, example: TipoDistribucion.INDIVIDUAL })
  @IsEnum(TipoDistribucion)
  tipoDistribucion: TipoDistribucion;

  @ApiProperty({ example: 1.0, description: '% comisión venta Línea' })
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  porcLinea: number;

  @ApiProperty({ example: 0.5, description: '% comisión venta Promoción' })
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  porcPromocion: number;

  @ApiProperty({ example: 1.5, description: '% comisión venta Línea Estrategia (antes de descuento)' })
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  porcEstrategia: number;

  @ApiPropertyOptional({ default: false })
  @IsBoolean()
  @IsOptional()
  validarPresupuesto?: boolean;

  @ApiPropertyOptional({ default: false })
  @IsBoolean()
  @IsOptional()
  validarCrecimiento?: boolean;

  @ApiProperty({
    enum: TipoAfectacion,
    example: TipoAfectacion.NOVEDADES,
    description: 'Excluyente: HorasLaboradas XOR NovedadesDiarias',
  })
  @IsEnum(TipoAfectacion)
  tipoAfectacion: TipoAfectacion;

  // ── Vigencia desde-hasta (HU-02) ──────────────────────────────────
  @ApiPropertyOptional({ example: '2026-01-01', description: 'Inicio de vigencia de esta parametrización' })
  @IsOptional()
  @IsDateString()
  vigenciaDesde?: string;

  @ApiPropertyOptional({ example: '2026-12-31', description: 'Fin de vigencia (NULL = sin tope)' })
  @IsOptional()
  @IsDateString()
  @ValidateIf((o) => o.vigenciaDesde !== undefined && o.vigenciaHasta !== undefined)
  vigenciaHasta?: string;

  // ── Descuento Estrategia (HU-02) ─────────────────────────────────
  @ApiPropertyOptional({
    enum: EstrategiaTipoDescuento,
    description: 'Origen del descuento para Línea Estrategia',
  })
  @IsOptional()
  @IsEnum(EstrategiaTipoDescuento)
  estrategiaTipoDescuento?: EstrategiaTipoDescuento;

  @ApiPropertyOptional({
    example: 0.5,
    description: '% de descuento corporativo (solo si estrategiaTipoDescuento=CORPORATIVO)',
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  estrategiaPorcDescuentoCorporativo?: number;

  @ApiProperty({ type: [CrearRangoDto], description: 'Rangos de comisión por cumplimiento' })
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => CrearRangoDto)
  rangos: CrearRangoDto[];

  @ApiProperty({ example: 'Configuración inicial del esquema 2026', maxLength: 300 })
  @IsString()
  @IsNotEmpty()
  @MaxLength(300)
  motivo: string;
}