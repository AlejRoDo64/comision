# HU-2 — Parametrización de cargos, tipos de liquidación y distribución de comisiones

**Responsable HUB:** Angie Torres
**Responsable LP:** David Moreno
**Fecha de realización:** 2026-02-05

---

## 1. Descripción del requerimiento

### ¿Qué necesito?
Como responsable de Compensaciones se requiere que el sistema permita parametrizar de manera **estructural y controlada** los cargos que dentro de su esquema de compensación generan comisión, definiendo para cada uno:

- **Tipo de liquidación** (base de cálculo).
- **Tipo de distribución** (forma de asignación).
- **Porcentajes o valores fijos** de comisión por tipo de venta.
- **Condiciones de validación** (presupuesto y/o crecimiento).
- **Condiciones de afectación** (horas laboradas o novedades diarias).

Esta parametrización constituye la **capa estructural** del modelo de comisiones y será consumida automáticamente por el motor de liquidación (HU-3). No es una operación recurrente, sino una configuración base con control de cambios.

### Ubicación en la arquitectura
- **Antes de la operación:** Parametrización inicial del esquema.
- **Durante la operación:** El motor de cálculo consume esta configuración sin modificaciones.
- **Excepcionalmente:** Revisión solo cuando cambian las reglas de negocio.

```
Capa                Función
─────────────────────────────────────────
Calendarios         Define el marco temporal
Parametrización     Define reglas estructurales  ← esta HU
Liquidación         Ejecuta cálculo
Trazabilidad        Consulta resultados
```

---

## 2. Entradas / Dependencias

### Datos de entrada por cargo
- Código de oficio (desde Midasoft).
- Nombre del cargo.
- Tipo de liquidación.
- Tipo de distribución.
- % Línea.
- % Promoción.
- % Línea Estrategia (o fórmula derivada).
- Validar presupuesto (booleano).
- Validar crecimiento (booleano).
- Afectación: horas laboradas (booleano) **O** novedades diarias (booleano).
- **Regla crítica:** Solo uno de los dos indicadores de afectación puede estar activo.

### Dependencias
- Catálogo oficial de cargos desde Midasoft (solo referencia, no edición).
- Tablas de presupuestos.
- Histórico de ventas.
- Tablas de crecimiento.
- Información de venta por tipo (Línea / Promoción / Estrategia).
- Calendarios configurados.
- Motor de cálculo que consuma esta parametrización.

---

## 3. Catálogo de cargos (Midasoft)

| Código | Cargo | Afectación |
|---|---|---|
| 102110 | Coadministrador(a) de tienda | Novedades diarias |
| 104223 | Cajero(a) 36H | Novedades diarias |
| 104222 | Cajero(a) TC | Novedades diarias |
| 104517 | Staff comercial 36H | Novedades diarias |
| 104518 | Staff comercial TC | Novedades diarias |
| 102058 | Administrador(a) de tienda | Novedades diarias |
| 102502 | Partner comercial | Novedades diarias |
| 104608 | Vendedor(a) | Novedades diarias |
| 104275 | Asesor(a) de ventas 48H | Horas laboradas |
| 104341 | Asesor(a) de ventas 36H | Horas laboradas |
| 102571 | Gestor comercial | Novedades diarias |

**Regla:** cada cargo debe tener una única forma de afectación. Si `horas=TRUE` Y `novedades=TRUE` → error. Si ambos `FALSE` → error.

---

## 4. Reglas de negocio

### RN-1: Gobierno de la configuración
- La configuración es **estructural, no operativa**.
- No se modifica por período.
- Se realiza una sola vez y se mantiene vigente, pero debe ser flexible al cambio de reglas.
- Solo se revisa cuando: cambian las reglas, se agrega/excluye/modifica un cargo.
- Debe tener **control de vigencia** (fecha desde – fecha hasta).
- Debe registrar **usuario, fecha y motivo** del cambio.

### RN-2: Exclusividad de afectación
- Si `Horas = TRUE` → cálculo depende de horas laboradas.
- Si `Novedades = TRUE` → cálculo excluye comisión en días con novedad.
- Si ambos `TRUE` → **error de validación**.
- Si ambos `FALSE` → **error de validación**.

### RN-3: Tipos de liquidación × distribución

| Liquidación | Distribución | Aplicación |
|---|---|---|
| **Individual** | Individual | Comisión sobre venta individual |
| **Global por Tienda** | Individual | Comisión de tienda asignada individualmente |
| **Global por Tienda** | Proporcional | Comisión de tienda repartida por horas |
| **Global por Grupo de Tiendas** | Global | Comisión del grupo en partes iguales |
| **Global por Grupo de Tiendas** | Individual | Comisión del grupo asignada individualmente |

### RN-4: Matriz cargo × liquidación × distribución

| Código | Cargo | Tipo Liquidación | Tipo Distribución |
|---|---|---|---|
| 104608 | Vendedor(a) | Individual | Individual |
| 104517 | Staff comercial 36H | Individual | Individual |
| 104518 | Staff comercial TC | Individual | Individual |
| 102058 | Administrador(a) de tienda | Global | Individual |
| 102110 | Coadministrador(a) de tienda | Global | Individual |
| 102502 | Partner comercial | Global (base 50% de la venta) | Individual |
| 102571 | Gestor comercial | Global por grupo de tiendas | Proporcional |
| 104222 | Cajero(a) TC | — | — |
| 104223 | Cajero(a) 36H | — | — |
| 104275 | Asesor(a) de ventas 48H | Global | Proporcional |
| 104341 | Asesor(a) de ventas 36H | Global | Proporcional |

### RN-5: Tabla de porcentajes por cumplimiento (ejemplo Staff Comercial)

| Cumplimiento | % Línea | % Promoción |
|---|---|---|
| Hasta 79.99% | 0.19 | 0.13 |
| 80% – 89.99% | 0.29 | 0.20 |
| 90% – 94.99% | 0.48 | 0.34 |
| 95% – 99.99% | 0.60 | 0.42 |
| 100% | 0.72 | 0.50 |

### RN-6: Línea Estrategia
```
% estrategia = % línea base − % descuento aplicable
```
El descuento puede provenir de:
- Porcentaje corporativo definido por la compañía.
- % de descuento real equivalente aplicado en la venta.

### RN-7: Validación por presupuesto
Si `validar_presupuesto = TRUE`:
- Obtener el presupuesto del período.
- Calcular % de cumplimiento.
- Ubicar el rango en la tabla.
- Aplicar % correspondiente.
- El presupuesto puede ser: Global por tienda, individual por colaborador, agrupado por tiendas.

### RN-8: Validación por crecimiento
Si `validar_crecimiento = TRUE`:
- Comparar ventas contra período anterior equivalente.
- Calcular % de crecimiento.
- Ubicar el rango en la tabla.
- Aplicar % correspondiente.
- Debe permitir tablas parametrizadas.

---

## 5. Criterios de aceptación (DoD)

- [x] El sistema solo permite configurar cargos existentes en Midasoft.
- [x] No permite activar simultáneamente `Horas` y `Novedades`.
- [x] No permite dejar incompleta la configuración.
- [x] Permite parametrización por rangos de cumplimiento.
- [x] El porcentaje de Línea Estrategia es parametrizable.
- [x] El sistema permite activar/desactivar validación de presupuesto y crecimiento.

---

## 6. Pantalla: Administración de Esquemas de Comisión

Secciones:
1. Identificación del Cargo.
2. Configuración de Liquidación.
3. Configuración de Distribución.
4. Porcentajes.
5. Validaciones.
6. Vigencia.

Campos adicionales: `fecha_inicio_vigencia`, `fecha_fin_vigencia`, `motivo_cambio`, `estado_esquema` (Activo/Inactivo).

---

## 7. Datos de prueba

### Escenario 1 — Staff Comercial
- Cumplimiento: 95%
- Venta línea: 10.000.000
- % Línea para rango 95–99.99%: 0.60%
- **Cálculo esperado:** 10.000.000 × 0.0060 = **60.000**

### Escenario 2 — Línea Estrategia
- % Línea base: 0.60%
- Descuento aplicado: 15%
- % Estrategia = 0.60% − 0.15% = **0.45%**

---

## 8. Exclusiones / No alcance
- No se contemplan pagos, nómina ni integraciones contables.
- No se permite modificación operativa recurrente.
- No modifica ventas ni presupuestos.

## 9. Supuestos
- Midasoft es la fuente oficial de cargos.
- Las ventas están correctamente clasificadas.
- Las tablas de crecimiento existen.
- Los calendarios están creados.
- Existe control de roles.
- Los cambios no son retroactivos salvo autorización de negocio.

---

## 10. Aprobaciones
- **HUB:** Angie Lorena Torres
- **Desarrollador:** David Fernando Moreno
- **Líder de Proceso:** ___________________
