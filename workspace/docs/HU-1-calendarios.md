# HU-1 — Configuración anual y gestión de calendarios y períodos de liquidación

**Responsable HUB:** Angie Torres
**Responsable LP:** David Moreno
**Fecha de realización:** 2026-02-05

---

## 1. Descripción del requerimiento

### ¿Qué necesito?
Como responsable de Compensaciones se requiere una ETL o sistema de liquidación y cálculo de comisiones que permita crear y configurar de manera estructurada **múltiples calendarios de liquidación de comisiones**, cada uno compuesto por **períodos anuales independientes**, garantizando integridad temporal, trazabilidad y consistencia estructural.

Esta historia de usuario define la **estructura temporal base** sobre la cual operará el proceso de liquidación. **No gestiona el cálculo ni el cierre operativo** de los períodos.

### El sistema debe permitir
- Crear múltiples calendarios independientes.
- Configurar de forma masiva los períodos del año por calendario.
- Validar solapamientos únicamente dentro del mismo calendario.
- Garantizar secuencialidad lógica de fechas.
- El estado operativo del período (`Abierto`, `EnCurso`, `Liquidado`, `Cerrado`) **NO es editable manualmente**; se gestiona automáticamente por el proceso de liquidación.

---

## 2. Contexto / Alcance

Permoda Ltda. requiere formalizar la estructura temporal que delimita los cortes de liquidación, evitando:
- Solapamientos dentro del mismo calendario.
- Inconsistencias en fechas.
- Configuraciones manuales repetitivas.
- Falta de trazabilidad estructural.

### Coexistencia de calendarios
La solución debe permitir que coexistan múltiples calendarios, por ejemplo:
- **Calendario de Comisiones.**
- **Calendario de Cumplimiento de Meta.**

Cada calendario opera de forma independiente. Se permite que existan períodos con fechas iguales en calendarios distintos, pero **no dentro del mismo calendario**.

### Incluye
- Creación de calendarios.
- Configuración anual masiva de períodos.
- Validación de no solapamiento por calendario.
- Validación de secuencia temporal.

### No incluye
- Ejecución de cálculo de comisiones.
- Cambio manual de estados operativos.
- Confirmación de cierre.
- Generación de archivo de nómina.
- Simulaciones.
- Eliminación de períodos con gestión asociada.
- Versionamiento automático de calendarios.

---

## 3. Entradas / Dependencias

### Entradas
- Nombre del calendario
- Año de liquidación
- Código del período
- Fecha inicio
- Fecha fin

### Dependencias
- Motor ETL que consumirá los períodos configurados.
- Base de datos transaccional.
- Control de roles y permisos.
- HU de Liquidación (para gobierno de estados).

---

## 4. Reglas de negocio

### RN-1: Independencia de calendarios
El sistema debe permitir múltiples calendarios activos simultáneamente. Cada calendario es una entidad lógica independiente. Ejemplo válido:
- Calendario A → 01/01/2026 – 30/01/2026
- Calendario B → 21/01/2026 – 20/02/2026

### RN-2: No solapamiento
Dentro del mismo calendario no se permite:
```
fecha_inicio_nuevo <= fecha_fin_existente
  AND
fecha_fin_nuevo >= fecha_inicio_existente
```
Si la condición se cumple → el sistema **bloquea la creación**.

### RN-3: Secuencia temporal
Los períodos deben mantener continuidad lógica.
- ✅ Válido: 21 enero – 20 febrero / 21 febrero – 20 marzo
- ❌ Huecos no autorizados
- ❌ Fechas invertidas

### RN-4: No edición con gestión asociada
Si un período tiene registros en tabla `Liquidación`:
- No se permite modificar fechas.
- No se permite eliminar.
- Solo lectura estructural.

### RN-5: Estados automáticos
El período tiene un campo de estado operativo que **no es editable** desde este módulo. El estado es determinado por el proceso de liquidación (HU-3).

---

## 5. Modelo de persistencia (estructura mínima)

### Tabla `calendario`
| Campo | Tipo | Descripción |
|---|---|---|
| `id_calendario` | PK | Identificador único |
| `nombre` | string | Nombre del calendario |
| `anio` | int | Año de liquidación |
| `estado_activo` | bool | Activo/Inactivo |

### Tabla `periodo`
| Campo | Tipo | Descripción |
|---|---|---|
| `id_periodo` | PK | Identificador único |
| `id_calendario` | FK | Referencia al calendario |
| `codigo` | string | Código del período (ej. ENE-2026) |
| `fecha_inicio` | date | Inicio del período |
| `fecha_fin` | date | Fin del período |
| `estado_operativo` | enum | Abierto / EnCurso / Liquidado / Cerrado |

---

## 6. Criterios de aceptación (DoD)

- [x] El sistema permite crear múltiples calendarios.
- [x] Los períodos validan solapamiento únicamente dentro del mismo calendario.
- [x] El sistema permite generar masivamente los períodos de un año por calendario.
- [x] No se permite crear períodos con fechas inconsistentes (`fecha_fin < fecha_inicio`).
- [x] No se permite modificar la estructura de un período que ya tenga liquidaciones asociadas.
- [x] Los calendarios operan de forma independiente.
- [x] Todo cambio estructural queda registrado en log.
- [x] El estado operativo del período no es editable manualmente.

---

## 7. Pantallas / UI

### Pantalla 1 — Administración de Calendarios

| Campo | Tipo | Obligatorio | Regla |
|---|---|---|---|
| Nombre del Calendario | Texto | Sí | Único por año |
| Año | Numérico | Sí | 4 dígitos |
| Estado Activo | Booleano | Sí | Control de uso |

**Acciones:** Crear, Editar descripción, Activar/Desactivar. No permite eliminar si tiene períodos asociados.

### Pantalla 2 — Configuración anual de períodos

Grid editable con columnas: `Código | Fecha Inicio | Fecha Fin`

**Botones:**
- Generar automático (según patrón, ej. 21 al 20)
- Validar
- Guardar

**Comportamiento:** validación en tiempo real, alerta visual si existe solapamiento, bloqueo si hay liquidaciones asociadas.

### Pantalla 3 — Consulta de períodos

Modo solo lectura cuando existan liquidaciones asociadas. Columnas: `Código | Fecha inicio | Fecha fin | Estado operativo (derivado)`. Indicador visual de uso.

---

## 8. Datos de prueba

| Escenario | Entrada | Resultado esperado |
|---|---|---|
| 1 — Creación exitosa | Calendario: Comisiones 2026, 12 períodos sin solapamiento | Creación exitosa |
| 2 — Solapamiento | Periodo A: 01/01–31/01, Periodo B: 20/01–20/02 | Error / bloqueo |
| 3 — Mismo rango, diferente calendario | Calendario A y B con mismas fechas | Permitido |
| 4 — Modificación con liquidación asociada | Período con liquidaciones | Bloqueo estructural |
| 5 — Fecha fin menor a fecha inicio | fecha_fin < fecha_inicio | Error de validación |

---

## 9. Supuestos

- El calendario anual es definido previamente por negocio.
- El estado operativo es derivado por la HU-3 de Liquidación.
- Los usuarios con permisos están previamente definidos.
- El sistema consume únicamente períodos configurados y vigentes.
- No se permite modificación directa en base de datos.

---

## 10. Aprobaciones

- **HUB:** Angie Lorena Torres
- **Desarrollador:** David Fernando Moreno
- **Líder de Proceso:** ___________________
