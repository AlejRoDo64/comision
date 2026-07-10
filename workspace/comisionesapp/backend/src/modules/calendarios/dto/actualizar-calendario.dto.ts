import { PartialType } from '@nestjs/swagger';
import { CrearCalendarioDto } from './crear-calendario.dto';

export class ActualizarCalendarioDto extends PartialType(CrearCalendarioDto) {}
