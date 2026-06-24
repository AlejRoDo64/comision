# HU-3 — Liquidación automática de comisiones

**Responsable HUB:** Angie Torres
**Responsable LP:** David Moreno
**Fecha de realización:** 2026-02-05

---

## 1. Descripción del requerimiento

### ¿Qué necesito?
Como responsable de Compensaciones se requiere que el sistema permita ejecutar la **liquidación automática de comisiones** para un período previamente configurado, de manera integral, auditada y sin intervención manual en el cálculo.

### Flujo de usuario
El usuario únicamente debe:
1. Ingresar al módulo **"Liquidador de Comisiones"**.
2. Seleccionar el **calendario**.
3. Seleccionar el **período** a liquidar.
4. Ejecutar el proceso.

### Lo que el sistema hace a partir de ahí
- Validar la elegibilidad del período.
- Consumir **automáticamente** todas las fuentes de datos requeridas.
- Aplicar la **parametrización estructural vigente** por cargo.
- Ejecutar el cálculo completo.
- Generar el resultado consolidado.
- Actualizar el **estado operativo** del período.
- Generar el **archivo de salida** compatible con nómina.

Este proceso reemplaza completamente el procedimiento manual actual.

---

## 2. Contexto / Alcance

### Situación actual
El cálculo actual requiere múltiples cruces manuales entre:
- Ventas (ICG).
- Base de empleados (Midasoft).
- Horas laboradas.
- Novedades.
- Cambios de cargo.
- Traslados de centro de costo.
- Comisiones bancarias.

Esto genera: alto riesgo operativo, falta de trazabilidad, dependencia de archivos externos, reproceso.

### Ubicación en la arquitectura
- **Posterior a:** configuración de períodos, cargos, tipos de liquidación, distribución, porcentajes.
- **Previo a:** registro de comisiones en RRHH, pago o contabilización.

### Incluye
- Selección del período a liquidar.
- Consumo automático de: ventas, comisiones bancarias, empleados, marcaciones, novedades, cambios de cargo/ccoso.
- Cálculo según tipo de liquidación, distribución, reglas de horas, % por tipo de venta, % por cargo.
- Generación de resultado por colaborador.
- Generación de archivo plano para nómina.

### No incluye
- Creación/modificación de ventas, empleados, marcaciones, novedades, cambios.
- Parametrización de cargos (eso es HU-2).
- Pagos, contabilización, integraciones con nómina más allá del archivo de salida.

---

## 3. Entradas / Dependencias

### Fuentes de datos (consumo automático)

#### Ventas (ICG – Query)
- Ventas del período por tienda.
- Ventas del período por colaborador.
- Clasificación por tipo: Línea, Línea Estrategia, Promoción.

#### Base de empleados (Midasoft)
- Código del colaborador.
- Cédula.
- Nombre y apellido.
- Fecha de ingreso y de retiro.
- Código y nombre del oficio.
- Código y nombre de centro de costo.
- Jornada (máx. semanal 36h / máx. mensual 180h).
- Fecha de inicio/fin en el centro de costo.

#### Marcaciones (Midasoft)
- Código del empleado.
- Código y nombre del centro de costo.
- Fecha de realización de las horas.
- Horas laboradas por día y colaborador.

#### Novedades (Midasoft)
- Código del empleado.
- Fecha real inicial y final.
- Cantidad de horas por novedad.
- Tipo: vacaciones, incapacidad, ausentismos, etc.

#### Cambios estructurales (Midasoft)
- Cambios de cargo durante el período.
- Traslados de centro de costo durante el período.
- **Regla:** se generan subperíodos internos proporcionales por cambio.

#### Comisiones bancarias (ICG)
- Valor de comisiones bancarias por centro de costo, asociadas a pagos no realizados en efectivo.

### Dependencias del proceso
- Calendario existente.
- Período en estado `Abierto`.
- Período anterior del mismo calendario en estado `Cerrado`.
- Parametrización vigente para el cargo y la fecha del período.
- Tablas de crecimiento (si aplica).
- Presupuesto del período (si aplica).

---

## 4. Reglas de negocio

### RN-1: Elegibilidad del período
El cálculo solo puede ejecutarse sobre períodos que cumplan **simultáneamente**:
- Pertenece a un calendario activo.
- Estado = `Abierto`.
- Período anterior del mismo calendario está en estado `Cerrado`.

### RN-2: Transición de estados
```
Abierto → EnCurso  (al iniciar el cálculo)
EnCurso → Liquidado (al finalizar exitosamente)
Liquidado → Cerrado (solo tras confirmación explícita del usuario)
```
- No se permite ejecutar ni recalcular un período en estado `Cerrado`.
- No se permite ejecución concurrente del mismo período.

### RN-3: Origen de datos (sin carga manual)
- Ventas → Query ICG.
- Comisiones bancarias → ICG.
- Empleados, marcaciones, novedades, cambios → Midasoft.
- ❌ Prohibido: carga manual, ajustes manuales de ventas, modificaciones externas durante el cálculo.
- El sistema consume solo información comprendida en el rango de fechas del período.

### RN-4: Normalización financiera (orden obligatorio)

#### Paso 1 — Eliminar IVA por transacción
```
venta_sin_iva = valor_total_transaccion / 1.19
```
**Antes de cualquier consolidación por tipo de venta.**

#### Paso 2 — Consolidar por tipo de venta
Acumular la venta sin IVA del período por tipo:
- Línea
- Línea Estrategia
- Promoción

#### Paso 3 — Descontar comisiones bancarias
- Identificar el tipo de venta con **mayor valor acumulado sin IVA**.
- Descontar sobre ese tipo el valor total de comisiones bancarias reportadas por ICG.
- ❌ Prohibido distribuir proporcionalmente entre tipos.

#### Paso 4 — Venta neta final
- Tipo mayor: `venta_neta = total_sin_iva − comision_bancaria`.
- Demás tipos: `venta_neta = total_sin_iva`.
- ❌ Prohibido aplicar comisión sobre valores con IVA o antes de descontar comisiones bancarias.

### RN-5: Determinación de la base según tipo de liquidación
| Tipo de liquidación | Base de cálculo |
|---|---|
| Individual | Venta neta individual del colaborador |
| Global por Tienda | Venta neta total consolidada de la tienda |
| Global por Grupo de Tiendas | Venta neta total consolidada del grupo |

### RN-6: Aplicación de porcentajes
Una vez determinada la base, aplicar:
- % Línea
- % Línea Estrategia (`% estrategia = % línea − % descuento corporativo o real`)
- % Promoción

Según parametrización vigente del cargo.

### RN-7: Validación de presupuesto
Si `validar_presupuesto = TRUE`:
- Obtener presupuesto del período.
- Calcular % de cumplimiento.
- Determinar rango parametrizado.
- Aplicar % correspondiente.

### RN-8: Validación de crecimiento
Si `validar_crecimiento = TRUE`:
- Comparar ventas del período vs. período base.
- Calcular % de crecimiento.
- Aplicar rango parametrizado.

### RN-9: Distribución según esquema

#### A) Individual – Distribución individual
```
comision_colaborador = venta_neta_individual × % comision aplicable
```

#### B) Global Tienda – Individual
1. Calcular comisión de tienda: `comision_tienda = venta_neta_diaria × % del cargo`.
2. Identificar colaboradores del cargo en la tienda.
3. Validar novedades diarias por colaborador.
4. Si hay novedad en un día → excluir la comisión de ese día.
5. Excepciones (se incluyen como días válidos): licencia de luto, día de la familia, compensatorio legal.
```
comision_colaborador = comision_tienda − comision_dias_con_novedad
```

#### C) Global Tienda – Proporcional
1. Calcular comisión total del período por tienda = suma de Línea + Estrategia + Promoción.
2. Consolidar horas semanales y mensuales por colaborador.
3. Validar días sin horas contra novedades.
4. Si la novedad es descanso remunerado legal → las horas de ese día **se suman** al consolidado.
5. Calcular tope:
```
tope_horas = dias_habiles_periodo × horas_diarias_contractuales
```
Si el colaborador ingresa/retira durante el período → tope proporcional a días trabajados.
6. Las horas que excedan el tope son extras y no afectan el cálculo.
7. Participación:
```
% participacion = horas_validas_colaborador / total_horas_validas_grupo
```
8. Distribución:
```
comision_colaborador = comision_total_tienda × % participacion
```

#### D) Global Grupo Tiendas – Global (partes iguales)
1. `comision_grupo = venta_neta_grupo × % comision`.
2. Identificar colaboradores activos del mismo cargo.
3. Distribuir en partes iguales, ajustada por días efectivamente laborados (excluyendo días con novedad).
```
comision_colaborador = (comision_grupo / N_colaboradores) × proporcion_dias_laborados
```

#### E) Global Grupo Tiendas – Individual
1. `comision_grupo = venta_neta_grupo × % comision del cargo`.
2. Identificar colaboradores asignados al grupo.
3. Validar novedades diarias → excluir esos días (excepto luto, familia, compensatorio).
```
comision_colaborador = comision_grupo − comision_dias_con_novedad
```

### RN-10: Cambios estructurales
Si un colaborador presenta **cambio de cargo** o **cambio de centro de costo** durante el período:
- Fragmentar el período en **tramos internos**.
- Calcular comisión independiente por tramo.
- Generar **registros separados**.
- ❌ Prohibido consolidar cargos distintos en un mismo registro.

### RN-11: Integridad del proceso
- **Sin resultados parciales.** En caso de error, el estado del período no avanza.
- **Reintentable** sin inconsistencias.
- **Consistencia transaccional:** rollback total en caso de error.
- **Lock pesimista** por período (no concurrencia).

---

## 5. Generación de resultado

Al finalizar exitosamente:
- Generar registro consolidado por colaborador.
- Generar detalle por tienda, cargo, colaborador y tipo de venta.
- Generar **archivo plano** compatible con nómina Midasoft.

### Estructura del archivo de nómina (extendido)
```
EMPLEADO, CONCEPTO, HORAS, VALOR, CANTIDAD, CCOSTO, N_PRESTAMO,
LABOR, SUERTE, EQUIPO, F_P_LIQ, F_NOVEDAD, IDENTIFICADOR, TP_CONTR,
CDG_CCF, SALMES, CONVENIO, CPTCONVENIO, CNSEMPZ, OFICIO, DPTO,
AREA, GRUPO, SUBGRUPO, UBICACION, NIVEL, SECCION, PROYECTO,
DIVISION, SUBDIVISION, CLASE_EMP, REL_LABORAL, REL_SINDICAL,
PRODUCTO, SUC_CIA, HORA
```

**Mínimo viable (compatibilidad Midasoft):**
```
EMPLEADO  CONCEPTO  HORAS  VALOR
00200470  A201      0      968465
```

---

## 6. Criterios de aceptación (DoD)

- [x] El usuario únicamente selecciona calendario y período.
- [x] El sistema valida automáticamente elegibilidad del período.
- [x] El sistema consume automáticamente todas las fuentes.
- [x] El sistema aplica la parametrización vigente por cargo.
- [x] El sistema soporta todos los tipos de liquidación definidos.
- [x] El sistema aplica correctamente reglas de afectación por horas o novedades.
- [x] El sistema fragmenta correctamente cambios de cargo y/o centro de costo.
- [x] El sistema descuenta correctamente IVA y comisiones bancarias.
- [x] El sistema genera resultado por colaborador.
- [x] El sistema genera archivo plano compatible con nómina.
- [x] No se permite ejecución concurrente del mismo período.
- [x] No se permite ejecutar si el período anterior no está cerrado.
- [x] No se permite ejecutar si faltan datos críticos.
- [x] El sistema mantiene consistencia transaccional (rollback total).
- [x] El estado del período cambia automáticamente.
- [x] El proceso registra log detallado.
- [x] No se permite modificación manual del resultado.
- [x] No se permite recalcular un período Cerrado.

---

## 7. Pantalla: Liquidador de Comisiones

Estructura tipo dashboard en 4 bloques:

### Bloque 1 — Configuración de Ejecución
| Campo | Tipo | Obligatorio |
|---|---|---|
| Calendario | Dropdown | Sí |
| Año | Numérico | Sí (auto según calendario) |
| Período | Dropdown | Sí (solo `Abierto`) |
| Estado del período | Label | Auto |
| Fecha inicio / fin | Date readonly | Informativo |

**Botones:** `Ejecutar Liquidación`, `Cancelar`.

### Bloque 2 — Validaciones Previas
Checklist automático:
- Período anterior cerrado.
- Parametrización vigente.
- Integraciones activas.
- Presupuesto disponible.
- Datos de ventas disponibles.

Si algo falla: mensaje rojo + botón Ejecutar deshabilitado.

### Bloque 3 — Estado del Proceso (durante ejecución)
Stepper vertical:
1. Validación del período
2. Consumo de ventas
3. Consumo de empleados
4. Normalización financiera
5. Cálculo por cargo
6. Distribución
7. Consolidación
8. Generación de archivo

Barra de progreso, tiempo transcurrido, botón "Detener proceso".

### Bloque 4 — Resultado de la Liquidación
Resumen:
- Total tiendas procesadas.
- Total colaboradores liquidados.
- Total comisión del período.
- Total registros generados.

**Botones:** `Descargar archivo plano`, `Ver detalle`, `Cerrar período`, `Recalcular` (si estado ≠ Cerrado).

### Colores de estado
- 🟢 Abierto
- 🟡 En curso
- 🔵 Liquidado
- 🔴 Cerrado

---

## 8. Datos de prueba

| # | Escenario | Validar |
|---|---|---|
| 1 | Liquidación Individual | Descuento IVA, com. bancaria, % por tipo y cargo, atribución individual |
| 2 | Global Tienda – Distribución Individual | 2 colaboradores, mismo cargo, tienda, distribución individual |
| 3 | Global Tienda – Distribución Proporcional | 3 colaboradores, horas distintas, uno bajo tope, uno sobre tope |
| 4 | Global Grupo Tiendas | 3 tiendas, 1 cargo Gestor Comercial |
| 5 | Comisiones bancarias | Descuento al tipo de venta con mayor valor |
| 6 | Cambio de cargo/ccoso en período | 2 registros de liquidación con cálculos independientes |

---

## 9. Supuestos

- Los períodos están correctamente configurados y habilitados.
- La parametrización de cargos está vigente.
- Las integraciones ICG y Midasoft están disponibles y confiables.
- Los cambios de configuración no aplican retroactivamente a períodos ya liquidados.

---

## 10. Aprobaciones

- **HUB:** Angie Torres
- **Desarrollador:** David Moreno
- **Líder de Proceso:** ___________________
