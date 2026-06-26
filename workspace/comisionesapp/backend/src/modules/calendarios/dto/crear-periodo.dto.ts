import { IsDateString, IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class CrearPeriodoDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(20)
  codigo: string;

  @IsDateString()
  fechaInicio: string;

  @IsDateString()
  fechaFin: string;
}
