# HU-4 — Trazabilidad, consulta y salida de liquidación de comisiones

**Responsable HUB:** Angie Torres
**Responsable LP:** David Moreno
**Fecha de realización:** 2026-02-06

---

## 1. Descripción del requerimiento

### ¿Qué necesito?
Como usuario del área de Compensaciones se requiere que el sistema permita **consultar, auditar y analizar el detalle completo** de las liquidaciones de comisiones ejecutadas, garantizando:
- Trazabilidad total del cálculo.
- Transparencia en la información utilizada.
- Disponibilidad histórica de resultados.

### El sistema debe permitir
- Consultar liquidaciones por múltiples criterios combinables.
- Visualizar el detalle completo del cálculo.
- Validar la base de cálculo utilizada.
- Analizar afectaciones aplicadas.
- Consultar históricos **sin posibilidad de modificación**.
- Registrar todas las acciones en un log auditable.

---

## 2. Contexto / Alcance

### Aplicación de la HU
- **Posterior** a la ejecución de la liquidación automática.
- **Antes** del pago en nómina.
- **Durante** consultas posteriores o auditorías.

### Incluye
- Generación de evidencia estructurada del cálculo.
- Consulta detallada por múltiples criterios.
- Registro de logs de acciones.
- Generación de archivo plano o integración con nómina.
- Consulta histórica de liquidaciones.

### No incluye
- Recalcular períodos históricos automáticamente.
- Modificar resultados ya cerrados.
- Ajustes manuales de valores liquidados.
- Reapertura de períodos desde este módulo.
- Modificación, recálculo o alteración de valores liquidados.

---

## 3. Entradas / Dependencias

### Entradas
- Resultados consolidados generados por la HU-3.
- Datos normalizados de ventas almacenados.
- Horas consolidadas utilizadas en el cálculo.
- Novedades aplicadas.
- Parámetros vigentes al momento del cálculo.

### Dependencias
- Períodos en estado `Liquidado` o `Cerrado`.
- Historial de estados del período.
- Registro de ejecución del motor de liquidación.
- Motor de auditoría / log.

---

## 4. Reglas de negocio

### RN-1: Solo lectura
- Solo permite consulta de períodos en estado `Liquidado` o `Cerrado`.
- No permite modificar, recalcular, ajustar ni alterar valores liquidados.
- No permite reapertura de períodos ni ejecución de procesos de cálculo.
- No recalcula en tiempo de consulta; **únicamente muestra la información almacenada**.

### RN-2: Coincidencia exacta
La información visualizada debe corresponder **exactamente** a los datos persistidos por el motor de liquidación al momento de su ejecución. La versión de parametrización utilizada queda **asociada al resultado y disponible para consulta histórica**, aun cuando la parametrización cambie posteriormente.

### RN-3: Filtros combinables
El sistema debe permitir aplicar **filtros combinables** simultáneamente sin restricciones:
- Calendario, año, período.
- Colaborador, cargo.
- Tienda, grupo de tiendas, zona.
- Tipo de liquidación, tipo de distribución.
- Rango de comisión.
- Estado del período.

### RN-4: Drill-down jerárquico
Navegación desde el resumen general del período hasta el detalle de cálculo por colaborador.

### RN-5: Detalle mínimo del drill-down
- Venta bruta.
- Venta sin IVA.
- Comisión bancaria aplicada.
- Venta neta.
- Porcentaje aplicado.
- Tipo de liquidación.
- Tipo de distribución.
- Afectación por horas o novedades.
- Porcentaje de participación (cuando aplique).
- Comisión final.

### RN-6: Detalles extendidos
- Si hubo distribución proporcional por horas → mostrar **horas válidas consolidadas** y **tope utilizado**.
- Si hubo exclusión por novedades → mostrar **días excluidos** y **tipo de novedad**.
- Si hubo comisión bancaria → mostrar valor descontado y tipo de venta afectado.
- Si hubo subperíodo por cambio de cargo/ccoso → mostrar **tramos** y comisión de cada uno.

### RN-7: Insumos del cálculo
El sistema debe permitir consultar:
- Ventas consolidadas.
- Comisiones bancarias aplicadas.
- Horas registradas.
- Novedades consideradas.
- Porcentajes vigentes al momento de la liquidación.
- Versión de parametrización utilizada.

### RN-8: Log de auditoría
Eventos auditables:
- Consulta general.
- Consulta detallada por colaborador.
- Aplicación de filtros.
- Exportación cuando esté habilitada.

Cada evento registra: **usuario, fecha, hora, acción, período consultado, filtros aplicados**.

---

## 5. Criterios de aceptación (DoD)

- [x] El sistema permite consultar liquidaciones por múltiples filtros combinables.
- [x] El sistema muestra el detalle completo del cálculo: venta bruta, sin IVA, com. bancaria, venta neta, %, tipo liq, tipo dist, afectación, resultado final.
- [x] El sistema permite visualizar registros históricos de cualquier período `Liquidado` o `Cerrado`.
- [x] No se permite modificar valores desde esta pantalla.
- [x] Toda acción de consulta queda registrada en log.
- [x] La información visualizada corresponde **exactamente** a la información persistida por el motor de liquidación.
- [x] La versión de parametrización utilizada queda asociada al resultado.
- [x] La información histórica se mantiene disponible aunque la parametrización cambie.

---

## 6. Pantalla: Consulta y Trazabilidad de Liquidaciones

### Panel de Filtros
| Campo | Tipo | Obligatorio | Origen |
|---|---|---|---|
| Calendario | Lista | No | Tabla `calendario` |
| Año | Numérico | No | Dependiente del calendario |
| Período | Lista | No | Solo estados `Liquidado`/`Cerrado` |
| Colaborador | Buscador | No | Autocompletar por ID/Nombre/código |
| Cargo | Lista | No | Catálogo de cargos |
| Tienda | Lista | No | Maestro de tiendas |
| Grupo de tiendas | Lista | No | Si aplica |
| Zona | Lista | No | Agrupador |
| Tipo liquidación | Lista | No | Individual / Global / Grupo |
| Tipo distribución | Lista | No | Individual / Proporcional / Global |
| Rango comisión | Numérico | No | Min / Max |

**Botones:** `Aplicar filtros`, `Limpiar`.

### Tabla resumen del período
| Período | Tienda | Cargo | Colaborador | Comisión | Estado |
|---|---|---|---|---|---|
| FEB-26 | 101 | Staff | Ana Pérez | 1.200.000 | Cerrado |
| FEB-26 | 102 | Vendedor | Juan R. | 980.000 | Cerrado |

### Modal: Detalle de Liquidación (Drill-down)

**Información General**
- Colaborador: Ana Pérez
- Cargo: Staff Comercial 36H
- Tienda: 101
- Tipo Liquidación: Individual
- Tipo Distribución: Individual
- Estado Período: Cerrado

**Base de Cálculo**
| Tipo Venta | Venta Bruta | Sin IVA | Com. Bancaria | Venta Neta |
|---|---|---|---|---|
| Línea | 10.000.000 | 8.403.361 | 0 | 8.403.361 |
| Línea Estrategia | 4.000.000 | 3.361.344 | 500.000 | 2.861.344 |
| Promoción | 3.000.000 | 2.521.008 | 0 | 2.521.008 |

**Aplicación de Reglas**
- % Línea aplicado: 0.60%
- % Promoción aplicado: 0.42%
- Validó presupuesto: Sí — Cumplimiento: 95%

**Afectaciones**
- Horas válidas: 170
- Tope horas: 180
- % Participación: N/A
- Días excluidos por novedad: 1 (Incapacidad)

**Resultado Final**
- Comisión Línea: 50.420
- Comisión Estrategia: 17.168
- Comisión Promoción: 10.588
- **TOTAL: 78.176**

**Botones:** `Ver Detalle`, `Exportar`.

---

## 7. Datos de prueba

| # | Escenario | Validar |
|---|---|---|
| 1 | Consulta de Período Liquidado | Listado completo, sin edición, log registrado |
| 2 | Filtros Combinados | 3 tiendas, 5 cargos, 100 colaboradores — solo los que cumplen |
| 3 | Drill-down | Visualización completa: tipos venta, IVA, com. bancaria, % |
| 4 | Línea Estrategia en Consulta | % base, % descuento, % resultante, comisión calculada |
| 5 | Distribución Proporcional | Horas válidas, tope, % participación, comisión distribuida |
| 6 | Exclusión por Novedad | Días excluidos, tipo, impacto en comisión |
| 7 | Consulta Histórica tras cambio | % históricos visibles, nueva parametrización no aplica |

---

## 8. Exclusiones / No alcance
- No permite modificar resultados de liquidaciones ejecutadas.
- No permite recalcular automáticamente períodos históricos.
- No contempla ajustes manuales de comisión.
- No modifica información en el sistema de nómina.

## 9. Supuestos
- Las liquidaciones han sido ejecutadas previamente.
- La parametrización estaba vigente al momento del cálculo.
- La integración con Midasoft cuenta con estructura definida de importación.
- Los usuarios tienen roles y permisos configurados.
- La información histórica se encuentra almacenada íntegramente.

---

## 10. Aprobaciones
- **HUB:** Angie Torres
- **Desarrollador:** David Moreno
- **Líder de Proceso:** ___________________
