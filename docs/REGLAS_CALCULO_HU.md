# Reglas oficiales del cálculo de comisiones — Compendio de las HU

> Fuente: HU-01, HU-02, HU-03 y HU-04 (documentos oficiales en `HU/`).
> Este compendio consolida TODAS las reglas de negocio y fórmulas que el
> sistema debe aplicar. Última consolidación: julio 2026.

## 1. Fórmulas núcleo del cálculo (HU-03 — orden obligatorio)

1. **Eliminación del IVA por transacción** (antes de cualquier consolidación):
   `Venta sin IVA = Valor de la transacción ÷ 1,19`
2. **Consolidación por tipo de venta** del período por colaborador:
   Línea · Línea Estrategia · Promoción.
3. **Comisión bancaria**: el total reportado por ICG se descuenta **completo
   del tipo de venta con mayor acumulado sin IVA**. *Prohibido* distribuirla
   proporcionalmente entre tipos.
4. **Venta neta** (base oficial y única del cálculo):
   - Tipo mayor: `neta = sin IVA − comisión bancaria`
   - Demás tipos: `neta = sin IVA`
   *Prohibido* comisionar sobre valores con IVA o antes del descuento bancario.
5. **Comisión** = suma por tipo de venta de `venta neta × % del cargo`.

## 2. Catálogo oficial de cargos y su configuración (HU-02)

| Código | Cargo | Liquidación | Distribución | Afectación | % Línea | % Promoción |
|---|---|---|---|---|---|---|
| 104608 | Vendedor(a) | Individual | Individual | Novedades diarias | 2,5 | 1,8 |
| 104517 | Staff comercial 36H | Individual | Individual | Novedades diarias | *por rango* | *por rango* |
| 104518 | Staff comercial TC | Individual | Individual | Novedades diarias | *por rango* | *por rango* |
| 102058 | Administrador(a) de tienda | Global tienda | Individual | Novedades diarias | 0,75 | 0,53 |
| 102110 | Coadministrador(a) de tienda | Global tienda | Individual | Novedades diarias | 0,63 | 0,44 |
| 102502 | Partner comercial | Global (**base 50% de la venta**) | Individual | Novedades diarias | 0,53 | 0,37 |
| 102571 | Gestor comercial | Global **grupo de tiendas** | Proporcional | Novedades diarias | 0,50 | 0,55 |
| 104275 | Asesor(a) de ventas 48H | Global tienda | Proporcional | **Horas laboradas** | 1,0 | 0,7 |
| 104341 | Asesor(a) de ventas 36H | Global tienda | Proporcional | **Horas laboradas** | 1,0 | 0,7 |
| 104222 | Cajero(a) TC | — | — | Novedades diarias | — | — |
| 104223 | Cajero(a) 36H | — | — | Novedades diarias | — | — |

Notas del catálogo:
- Solo pueden configurarse **cargos existentes en Midasoft** (estos 11).
- La **afectación es excluyente**: Horas XOR Novedades (ambas o ninguna = error).
- Los cajeros no tienen esquema definido (no comisionan por ahora).
- El Gestor comercial admite asignación por tiendas, zonas o países.

### 2.1 Rangos por cumplimiento de presupuesto — Staff comercial (36H y TC)

| Cumplimiento | % Línea | % Promoción |
|---|---|---|
| Hasta 79,99% | 0,19 | 0,13 |
| 80% – 89,99% | 0,29 | 0,20 |
| 90% – 94,99% | 0,48 | 0,34 |
| 95% – 99,99% | 0,60 | 0,42 |
| 100% | 0,72 | 0,50 |

### 2.2 % Línea Estrategia (todos los cargos)

`% Estrategia = % Línea del cargo − % Descuento Estrategia`

El descuento proviene de: **descuento corporativo** definido por la compañía,
o **descuento real** aplicado en la venta de línea estrategia.

## 3. Esquemas de distribución (HU-03 — fórmulas exactas)

### 3.1 Individual + Individual (Vendedor, Staff)
`Comisión_colaborador = Venta_neta_individual × % comisión aplicable`
(por cada tipo de venta, considerando presupuesto/crecimiento si aplican).

### 3.2 Global tienda + Individual (Administrador, Coadministrador, Partner)
1. Consolidar venta neta **de toda la tienda** por tipo de venta.
2. `Comisión_tienda = Venta_neta_tienda × % del cargo` (Partner: sobre el 50% de la venta).
3. Por colaborador, excluir la comisión de los **días con novedad**:
   `Comisión_colaborador = Comisión_tienda − Comisión_días_con_novedad`
4. **Excepciones que NO excluyen** (descansos remunerados legales):
   licencia de luto · día de la familia · compensatorio legal.

### 3.3 Global tienda + Proporcional por horas (Asesores)
1. `Comisión_total_tienda = Σ (venta neta tienda por tipo × %)`.
2. **Horas válidas** por colaborador: marcaciones del período; los días con
   novedad de descanso legal **suman** como válidas.
3. **Tope de horas**: `Tope = Días hábiles del período × Horas diarias contractuales`
   (jornadas de referencia: 36 h semanales / 180 h mensuales).
   - Proporcional a los días trabajados si el colaborador ingresa o se retira
     dentro del período.
   - Horas que exceden el tope = **extras**: no cuentan para la proporción.
4. `% Participación = Horas válidas colaborador ÷ Total horas válidas del grupo de la tienda`
5. `Comisión_colaborador = Comisión_total_tienda × % Participación`

### 3.4 Global grupo de tiendas + Distribución global/partes iguales
1. `Comisión_grupo = Venta_neta_grupo × % del cargo`
2. `Comisión_colaborador = (Comisión_grupo ÷ Nº colaboradores) × Proporción_días_efectivamente_laborados`
   (las novedades excluyentes reducen los días).

### 3.5 Global grupo de tiendas + Individual (Gestor comercial)
Igual que 3.2 pero consolidando la venta neta **del grupo de tiendas**
asignado al cargo, con la misma exclusión por días con novedad y sus
excepciones legales.

## 4. Validaciones opcionales por cargo (HU-02/03)

- **Presupuesto** (si `Validar Presupuesto = SÍ`): obtener el presupuesto del
  período (global por tienda, individual por colaborador o agrupado por
  tiendas) → `% cumplimiento = venta neta ÷ presupuesto` → ubicar el rango
  parametrizado → aplicar el % del rango.
- **Crecimiento** (si `Validar Crecimiento = SÍ`): comparar contra el período
  base equivalente → `% crecimiento = (actual − anterior) ÷ anterior` →
  ubicar rango en la tabla parametrizada → aplicar el %.

## 5. Subperíodos por cambios estructurales (HU-03)

Si el colaborador tuvo **cambio de cargo** o **traslado de centro de costo**
dentro del período: fragmentar en tramos, calcular cada tramo por separado y
generar **registros independientes**. Prohibido consolidar cargos distintos
en un mismo registro.

## 6. Reglas de proceso y elegibilidad (HU-01 + HU-03)

- Calendario **único por año**; períodos **sin solapamiento** dentro del mismo
  calendario y en **secuencia continua** (patrón por defecto: día 21 del mes
  anterior → día 20 del mes actual; 12 períodos/año generables de una vez).
- Solo se liquida un período **Abierto** cuyo período anterior esté **Cerrado**.
- Estados del período (los gobierna el motor, nunca manuales):
  `Abierto → En curso (al iniciar) → Liquidado (al terminar) → Cerrado (solo con confirmación explícita del usuario)`.
- **Sin ejecución concurrente** del mismo período; **prohibido** recalcular un
  período Cerrado; prohibida la carga o ajuste manual de ventas.
- **Integridad total**: si algo falla, rollback completo, el estado del
  período no avanza y el proceso puede reintentarse limpio.
- No se puede modificar/eliminar un período con liquidaciones asociadas, ni
  eliminar un calendario con períodos.
- Todo cambio estructural y toda ejecución quedan registrados con usuario,
  fecha, hora y resultado; la parametrización usada queda asociada al
  resultado como **snapshot** consultable (HU-04) aunque cambie después.
- El módulo de consulta (HU-04) es **solo lectura** sobre períodos
  Liquidado/Cerrado, con filtros combinables, drill-down hasta el colaborador
  y **toda consulta auditada** (usuario, fecha, hora, acción).

## 7. Salida (HU-03)

Archivo plano compatible con nómina, **consolidado por colaborador**, con los
4 primeros campos obligatorios para Midasoft:
`EMPLEADO;CONCEPTO;HORAS;VALOR` → ej. `00200470;A201;0;968465`
(37 columnas totales; EMPLEADO = código Midasoft, no la cédula).

## 8. Ejemplos oficiales de las HU (datos de prueba)

- **Staff con cumplimiento 95%**: venta línea 10.000.000 × 0,60% = **60.000**.
- **Estrategia**: %Línea 0,60% − descuento 0,15% = **%E 0,45%**.
- **Normalización**: 10.000.000 con IVA → ÷1,19 = 8.403.361 sin IVA; la
  comisión bancaria se descuenta completa del tipo de mayor acumulado.
