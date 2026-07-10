import { Module } from '@nestjs/common';
import { CalendariosModule } from '../calendarios/calendarios.module';
import { ParametrizacionModule } from '../parametrizacion/parametrizacion.module';
import { CatalogosModule } from '../catalogos/catalogos.module';

/**
 * Módulo umbrella de Configuración (HU-01 + HU-02 + catálogos).
 *
 * Agrupa los tres módulos de setup (calendarios, parametrización, catalogos)
 * para que la app los presente como un solo dominio de "Configuración
 * estructural del modelo de comisiones". Los módulos individuales siguen
 * siendo responsables de su propio servicio y persistencia — este módulo
 * solo los reune bajo un mismo import.
 *
 * Si en el futuro se quiere fusionar físicamente (mover archivos a
 * `modules/configuracion/...`), este módulo actuaría como el nuevo "home"
 * y los submódulos quedarían deprecated.
 */
@Module({
  imports: [
    CalendariosModule,
    CatalogosModule,
    ParametrizacionModule,
  ],
  exports: [
    CalendariosModule,
    CatalogosModule,
    ParametrizacionModule,
  ],
})
export class ConfiguracionModule {}