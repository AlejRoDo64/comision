# Documentación del Proyecto Comisiones

**Permoda Ltda.**

| Campo | Valor |
| --- | --- |
| Proyecto | Automatización de Liquidación de Comisiones |
| Cliente | Permoda Ltda. |
| Versión del documento | 2.0 |
| Fecha de emisión | 10/07/2026 |
| Estado del programa | En desarrollo — cobertura funcional ≈ 91 % |
| Stack | NestJS 10 + Vue 3 + SQL Server 2022 |
| Repositorio | `Proyecto_Comisiones` (workspace/comisionesapp) |
| Estándar de documentación | IEEE Std 1023 · PMBOK 7 · Documentación de software por capas |

---

## Tabla de contenido

1. [Introducción](#1-introducción)
2. [Visión general del producto](#2-visión-general-del-producto)
3. [Capacidades del sistema](#3-capacidades-del-sistema)
4. [Arquitectura del sistema](#4-arquitectura-del-sistema)
5. [Modelo de datos](#5-modelo-de-datos)
6. [Backend — Composición estructural](#6-backend--composición-estructural)
7. [Frontend — Composición estructural](#7-frontend--composición-estructural)
8. [API REST — Contrato](#8-api-rest--contrato)
9. [Seguridad](#9-seguridad)
10. [Pruebas y aseguramiento de calidad](#10-pruebas-y-aseguramiento-de-calidad)
11. [Operación y despliegue](#11-operación-y-despliegue)
12. [Mapa de completitud por dominio funcional](#12-mapa-de-completitud-por-dominio-funcional)
13. [Trabajo pendiente hacia la cobertura total](#13-trabajo-pendiente-hacia-la-cobertura-total)
14. [Glosario](#14-glosario)
15. [Anexos](#15-anexos)

---

## 1. Introducción

### 1.1 Propósito

Este documento describe, en forma estructurada, **cómo está construido el programa ComisionesApp**: su propósito, alcance, arquitectura, modelo de datos, componentes técnicos, contrato de la API REST, operación, seguridad, pruebas, y el **estado de cobertura de cada capacidad funcional** con la lista precisa de trabajo que resta para alcanzar la cobertura total.

El programa se analiza aquí como un **mapa o esqueleto**: módulos, capas, entidades, servicios, vistas y contratos. Sirve como:

- Documento maestro para nuevos desarrolladores del equipo.
- Línea base de auditoría funcional y técnica.
- Insumo para la firma de aceptación con Permoda.
- Referencia para planificar el roadmap de cierre del trabajo pendiente.

### 1.2 Alcance

**Cubre:**

- El backend NestJS en `workspace/comisionesapp/backend`.
- El frontend Vue 3 en `workspace/comisionesapp/frontend`.
- Las integraciones con INDICADORES (SQL Server `10.1.5.61`) y Midasoft (REST `pruebaspermoda.midasoft.co`).
- La estrategia de datos mock (`Datatest/`) para operación sin conectividad.

**No cubre:**

- El futuro backend enterprise en .NET 10 (anunciado en el stack pero no presente aún).
- El módulo Python/FastAPI de IA/Data.
- El sistema de nómina (la aplicación produce un archivo plano de salida; el consumo posterior es responsabilidad de otro sistema).

### 1.3 Audiencia

| Rol | Necesidad principal |
| --- | --- |
| Desarrolladores backend | Entender la arquitectura NestJS, módulos, entidades, motor de liquidación. |
| Desarrolladores frontend | Entender la SPA, servicios, vistas y patrones Pinia/Vue Router. |
| Líder técnico / Arquitecto | Auditar principios SOLID, KISS, microservicios. |
| Product Owner / HUB | Trazabilidad de capacidades, completitud, criterios de aceptación. |
| Soporte / Operación | Instalación, configuración, troubleshooting. |

### 1.4 Definiciones y acrónimos

Ver [Glosario](#14-glosario).

### 1.5 Referencias

| Tipo | Documento | Ubicación |
| --- | --- | --- |
| Datos de prueba | Excel de cálculo de referencia | `Datatest/CalculoComisionesV02.xlsx` |
| Datos de prueba | Maestro de empleados Midasoft | `Datatest/MaestroEmpleadosMidasoft.xlsx` |
| Datos de prueba | TXT empleados | `Datatest/BaseEmpleados_23_06_2026.txt` |
| Datos de prueba | TXT marcaciones | `Datatest/MarcacionesComercial_09_07_2026.txt` |
| Datos de prueba | TXT novedades | `Datatest/NovedadesComercial_09_07_2026.txt` |
| Mock | Mock HTML inicial | `Mock/index.html` |
| Manual de usuario | Guía para Profesionales y Administradores | `docs/MANUAL_USUARIO.md` |
| Normas | `CLAUDE.md` — reglas de stack y convenciones | Raíz del repositorio |

---

## 2. Visión general del producto

### 2.1 Contexto de negocio

Permoda Ltda. liquida mensualmente las comisiones del equipo comercial de tiendas (≈ 11 cargos comisionables). El proceso actual se ejecuta de forma **manual en Excel con Power Query**, alimentado por:

- El **sistema ICG** vía SQL Server `INDICADORES` (servidor `10.1.5.61`) con los SP `SP_GetPOSCommissionsDetail` y `SP_GetPOSCommissionsSummary`.
- El **sistema de RRHH Midasoft** (REST API) para empleados, marcaciones, novedades y cambios de cargo.

Este proceso manual es propenso a errores, lento, no trazable, no auditable y depende de perfiles específicos. El programa **ComisionesApp** automatiza el ciclo completo: configuración, cálculo, persistencia, archivo plano de nómina y consulta de resultados.

### 2.2 Objetivos del programa

| # | Objetivo | Indicador |
| --- | --- | --- |
| O1 | Eliminar el cálculo manual en Excel | Sustitución del archivo `CalculoComisionesV02.xlsx` por el motor de liquidación automática |
| O2 | Garantizar trazabilidad de la parametrización | Log de cambios estructurales + snapshot inmutable |
| O3 | Reducir tiempo de liquidación | < 30 s para un período mensual con la BD propia |
| O4 | Cumplir restricciones contables | Descuento de IVA (÷1,19) y comisión bancaria |
| O5 | Permitir operación sin red (oficinas remotas) | Modo `FUENTES_MODO=mock` con `Datatest/` |
| O6 | Auditar todas las consultas de resultados | Bitácora `auditoria_consulta` |

### 2.3 Capacidades principales

1. **Gestión de calendarios y períodos** con generación masiva anual (patrón 21→20).
2. **Parametrización de cargos** con validación de catálogo Midasoft, reglas cruzadas de liquidación/distribución, estrategia de Línea Estrategia (Corporativo/Real), rangos por cumplimiento de presupuesto, vigencias.
3. **Liquidación automática** con lock pesimista, normalización financiera, subperíodos por cambios estructurales, archivo plano de nómina (37 columnas).
4. **Trazabilidad y consulta** multi-filtro con drill-down al detalle por colaborador y exportación a CSV.
5. **Visualización de datos de origen** (ICG y Midasoft) en modo consulta directa.
6. **Autenticación JWT** con dos roles: `ADMINISTRADOR` y `PROFESIONAL_COMISIONES`.

### 2.4 Usuarios del sistema

| Rol | Permisos |
| --- | --- |
| `ADMINISTRADOR` | CRUD completo sobre calendarios, períodos, parametrizaciones, presupuestos, rangos. Puede eliminar parametrizaciones y presupuestos. |
| `PROFESIONAL_COMISIONES` | Crea/edita parametrizaciones, ejecuta y cierra liquidaciones, consulta trazabilidad. No puede eliminar. |

### 2.5 Beneficios esperados

- Reducción del tiempo de liquidación de **≈ 4 horas (manual) a < 5 minutos**.
- Cero errores aritméticos por automatización.
- Cumplimiento auditable de las reglas de negocio de Permoda.
- Disponibilidad de información histórica inmutable.
- Independencia operativa respecto a la disponibilidad de ICG/Midasoft (modo mock).

---

## 3. Capacidades del sistema

> Las capacidades descritas a continuación se agrupan por **dominio funcional**. Cada dominio agrupa los servicios, entidades, endpoints y vistas que lo materializan. La traza de la implementación se detalla en los capítulos [§6](#6-backend--composición-estructural) (backend) y [§7](#7-frontend--composición-estructural) (frontend).

### 3.1 Configuración temporal (calendarios y períodos)

#### Resumen estructural

Permite definir uno o varios **calendarios anuales** y, dentro de cada uno, sus **12 períodos mensuales** siguiendo el patrón 21 → 20. El estado operativo de cada período se gobierna desde el motor de liquidación; la aplicación de configuración no lo modifica.

#### Capacidades cubiertas

| Capacidad | Estado | Componente principal |
| --- | --- | --- |
| Crear múltiples calendarios independientes | ✅ | `CalendariosService.createCalendario` |
| Generar de forma masiva los 12 períodos de un año | ✅ | `CalendariosService.generarAnioPeriodos` |
| Validar no solapamiento dentro del mismo calendario | ✅ | `validarSolapamiento` (regla `ini ≤ fin_existente AND fin ≥ ini_existente`) |
| Garantizar secuencia temporal (continuidad 21–20) | ✅ | `validarSecuencia` (sin falsos positivos en edición intermedia) |
| Activar/Desactivar calendarios sin permitir eliminación con períodos | ✅ | `removeCalendario` valida `periodos.length === 0` |
| Editar estructuralmente los períodos con validación en tiempo real | ✅ | `updatePeriodo` re-valida con fechas efectivas |
| Bloquear modificación/eliminación con liquidaciones asociadas | ✅ | `validarSinLiquidaciones` (consulta `Liquidacion.exists`) |
| Estado operativo no editable manualmente | ✅ | `Periodo.estadoOperativo` solo lo actualiza el motor |
| Registrar log de todo cambio estructural | ✅ | `LogEstructuralService.registrar()` en `common/audit/` |

#### Reglas de negocio

- Calendarios distintos pueden compartir fechas; dentro del mismo calendario no se permite solapamiento.
- Períodos consecutivos sin huecos; fechas invertidas lanzan `BadRequestException`.
- La vigencia se controla con `fechaInicio` y `fechaFin` por período.
- Si existen liquidaciones para el período, este pasa a ser de **solo lectura estructural**.

---

### 3.2 Parametrización de cargos

#### Resumen estructural

Capa de configuración estructural: define para cada cargo de Midasoft el **tipo de liquidación**, el **tipo de distribución**, los **% por tipo de venta** (Línea, Promoción, Línea Estrategia) y las **validaciones activables** (presupuesto, crecimiento, horas laboradas, novedades). Control de vigencia con usuario, fecha y motivo.

#### Catálogo oficial de cargos Midasoft (11 cargos)

| Código | Cargo | Afectación sugerida |
| --- | --- | --- |
| 102058 | Administrador(a) de tienda | Novedades |
| 102110 | Coadministrador(a) de tienda | Novedades |
| 102502 | Partner comercial | Novedades |
| 102571 | Gestor comercial | Novedades |
| 104222 | Cajero(a) TC | Novedades |
| 104223 | Cajero(a) 36H | Novedades |
| 104275 | Asesor(a) de ventas 48H | **Horas** |
| 104341 | Asesor(a) de ventas 36H | **Horas** |
| 104517 | Staff comercial 36H | Novedades |
| 104518 | Staff comercial TC | Novedades |
| 104608 | Vendedor(a) | Novedades |

#### Capacidades cubiertas

| Capacidad | Estado | Componente principal |
| --- | --- | --- |
| Solo cargos existentes en catálogo Midasoft | ✅ | `validarCargoOficial` (token DI `CARGOS_CATALOGO`) |
| Definir tipo de liquidación y distribución | ✅ | `ParametrizacionCargo.tipoLiquidacion/tipoDistribucion` |
| Parametrizar % por tipo de venta + Estrategia | ✅ | `porcLinea/porcPromocion/porcEstrategia` |
| Activar validación por presupuesto con rangos y base | ✅ | `validarPresupuesto` + entidades `presupuesto_cargo_periodo` y `presupuesto_rango_comision` |
| Activar validación por crecimiento con tablas | ✅ | `validarCrecimiento` + entidad `crecimiento_rango` |
| Afectación excluyente Horas **XOR** Novedades | ⚠️ Parcial | Enum `TipoAfectacion`; regla de validación backend **no enforzada** explícitamente |
| Parametrización por rangos de cumplimiento | ✅ | `validarContinuidadRangos` (6 tests) |
| Control de vigencia (fecha desde–hasta) | ✅ | `vigenciaDesde/vigenciaHasta` + `validarVigenciaNoSolapa` |
| Registrar usuario, fecha y motivo del cambio | ✅ | `usuarioCambio`, `motivo` + log estructural |
| Estado del esquema (Activo / Inactivo) | ✅ | `estadoActivo` + endpoint `desactivar` (conserva histórico) |

#### Reglas de negocio

- La configuración es estructural, no operativa; no se modifica por período.
- **Afectación:** `TipoAfectacion.HORAS ⊕ TipoAfectacion.NOVEDADES` (sugerida por el catálogo).
- **% Línea Estrategia:** `%Estrategia = %LíneaBase_cargo − %Descuento` (descuento corporativo o real de la venta).
- **Tabla Staff Comercial** (rangos presupuesto): 79,99 % → 0,19/0,13; 80–89,99 % → 0,29/0,20; 90–94,99 % → 0,48/0,34; 95–99,99 % → 0,60/0,42; 100 % → 0,72/0,50.
- **Regla cruzada:** Liquidación Individual solo admite Distribución Individual.
- **Rangos continuos:** sin huecos, sin solapamientos, solo el último puede ser abierto (hasta = ∞).

---

### 3.3 Motor de liquidación automática

#### Resumen estructural

El motor de liquidación es el **corazón del programa**. El usuario solo elige calendario + período y ejecuta; el sistema consume ventas/comisiones bancarias de ICG y empleados/marcaciones/novedades/cambios-traslados de Midasoft, normaliza (÷1,19 IVA, descuento de comisión bancaria sobre el tipo de venta mayor), aplica parametrización vigente, fragmenta subperíodos por cambios estructurales, calcula y distribuye, persiste con rollback total y genera archivo plano de nómina.

#### Capacidades cubiertas

| Capacidad | Estado | Componente principal |
| --- | --- | --- |
| Selección única de calendario + período (Abierto) | ✅ | UI + `POST /api/liquidacion/ejecutar` |
| Validación previa de elegibilidad | ✅ | `verificarElegibilidad` (período anterior Cerrado + parametrización vigente) |
| Cambio automático Abierto → En curso al iniciar | ✅ | `ejecutarTransaccional` crea `Liquidacion` con `estado=EN_CURSO` |
| Cambio automático a Liquidado y paso a Cerrado explícito | ✅ | `cerrar()` con validación de estado |
| Consumo automático de ventas y comisiones bancarias de ICG | ✅ | `IndicadoresService.comisionesDetalle/Resumen` |
| Consumo de empleados, marcaciones, novedades, cambios y traslados de Midasoft | ⚠️ Parcial | Empleados OK; novedades y marcaciones devuelven `[]` en modo real (pendiente de endpoint Midasoft) |
| Normalización: IVA ÷ 1,19 + descuento com. bancaria al tipo mayor | ✅ | `NormalizacionService.normalizar` (9 tests) |
| Soportar 3 tipos de liquidación × 2 distribuciones | ⚠️ Parcial | 3 de 4 reglas implementadas; **GlobalGrupo reutiliza GlobalTienda** con TODO marcado |
| Regla de afectación por Horas (con tope) o Novedades (con excepciones) | ✅ | `AfectacionesService` (8 tests, incluye excepciones Luto/Día Familia) |
| Fragmentar subperíodos por cambio de cargo o centro de costo | ✅ | `SubPeriodoService` (4 tests) |
| Persistencia transaccional con rollback total | ✅ | `dataSource.transaction()` para cabecera + subperíodos + detalles + cierre de período |
| Bloqueo de ejecución concurrente del mismo período | ✅ | `LiquidacionLockService` con `sp_getapplock` (timeout 5 s) |
| Recalcular permitido solo si estado ≠ Cerrado | ✅ | `cerrar()` valida `estado === LIQUIDADO`; nuevo `ejecutar` crea nueva liquidación |
| Generar archivo plano de nómina con 37 columnas | ✅ | `ArchivoPlanoService.generar` (separador `;`, encabezado fijo) |

#### Reglas de negocio

- **Elegibilidad:** período Abierto + período anterior del mismo calendario Cerrado.
- **Normalización financiera (orden estricto):** IVA ÷ 1,19 por transacción → consolidar por tipo → comisión bancaria se descuenta sobre el tipo de venta de mayor acumulado → prorrateada entre colaboradores por participación en venta.
- **Distribución proporcional por horas:** participación = horas válidas colab / total horas válidas grupo.
- **Excepciones de novedades (descanso remunerado legal):** LicenciaLuto, DíaFamilia, CompensatorioLegal no excluyen días.
- **Cambios estructurales:** un cambio de cargo o CC crea tramos internos independientes con cálculo propio.
- **Tope de horas:** proporcional a días trabajados si el colaborador ingresa o se retira durante el período.
- **Archivo de nómina:** ejemplo `EMPLEADO=00200470`, `CONCEPTO=A201`, `HORAS=0`, `VALOR=968465`. El código `EMPLEADO` es el **código Midasoft** del colaborador (no la cédula).

#### Estados de la liquidación

```
EN_CURSO  ──(éxito)──▶  LIQUIDADO  ──(cierre explícito)──▶  CERRADO
    │
    └────(error)────▶  ERROR  (re-ejecutable mientras el período no esté Cerrado)
```

---

### 3.4 Consulta, trazabilidad y exportación

#### Resumen estructural

Módulo de **solo lectura** sobre liquidaciones finalizadas. Ofrece consulta multi-filtro combinable, drill-down hasta el detalle por colaborador (venta bruta, sin IVA, comisión bancaria, venta neta, %, afectaciones, resultado final) y bitácora de auditoría de todas las acciones.

#### Capacidades cubiertas

| Capacidad | Estado | Componente principal |
| --- | --- | --- |
| Consultar liquidaciones en estado Liquidado o Cerrado únicamente | ✅ | Filtro SQL `estado IN (:...estados)` |
| Aplicar filtros combinables (calendario, año, período, colaborador, cargo, tienda, tipo liq, tipo dist, rango comisión) | ✅ | `FiltrosTrazabilidadDto` con `EXISTS` sobre `liquidacion_detalle` |
| Drill-down jerárquico: resumen → detalle por colaborador → base de cálculo | ✅ | `drillDown(idLiquidacion, idColaborador)` |
| Visualización obligatoria del nivel más detallado | ✅ | DTO `DetalleTrazabilidad` con venta bruta/sin IVA/com. bancaria/neta/%/afectación |
| Mostrar horas válidas consolidadas y tope | ✅ | `LiquidacionDetalle.horasValidas` + `AfectacionesService` |
| Mostrar días excluidos y tipo de novedad | ✅ | `motivoExclusion` con join de novedades |
| Visualizar % Línea base, % descuento y % Línea Estrategia | ✅ | Snapshot JSON en `liquidacion.parametrizacionJson` |
| Mantener histórico inmutable (versión de parametrización al cálculo) | ✅ | Snapshot persistido en `liquidacion.parametrizacionJson` |
| No recalcular en tiempo de consulta | ✅ | `TrazabilidadService` es solo lectura; sin acceso a `ReglasComisionService` |
| Registrar log de auditoría (usuario, fecha, hora, acción, filtros) | ✅ | `auditoria_consulta` con acciones `CONSULTA_RESUMEN`/`DRILLDOWN`/`EXPORTACION` |
| Permitir exportación a Excel (CSV en este caso) | ✅ | `GET /api/trazabilidad/exportar/:idLiquidacion` con separador `;` |

#### Reglas de negocio

- **Solo informativo:** ninguna consulta puede modificar, recalcular ni reabrir períodos.
- **Snapshot inmutable:** la información visualizada es exactamente la persistida por el motor.
- **Filtro por `tipoLiquidacion`/`tipoDistribucion`:** se hace con `LIKE '%...%'` sobre el JSON del snapshot.

---

### 3.5 Reglas de negocio transversales

| Código | Regla | Aplicada en |
| --- | --- | --- |
| RN-01 | El estado operativo de un período lo gobierna únicamente el motor de liquidación. | `Periodo.estadoOperativo` (no editable por API) |
| RN-02 | El IVA se descuenta por transacción (`÷ 1,19`) y nunca por agregado. | `NormalizacionService.normalizar` |
| RN-03 | La comisión bancaria del período se descuenta sobre el tipo de venta de mayor acumulado. | `NormalizacionService.normalizar` |
| RN-04 | Liquidación Individual solo admite Distribución Individual. | `validarCruzadaLiqDist` |
| RN-05 | La afectación por Horas y por Novedades son excluyentes. | `TipoAfectacion` (validación suave) |
| RN-06 | Todo cambio estructural se registra con usuario, fecha y motivo. | `LogEstructuralService.registrar()` |
| RN-07 | Las parametrizaciones se desactivan (no se eliminan) para conservar el histórico. | `PATCH /:id/desactivar` |
| RN-08 | Las consultas de trazabilidad son siempre sobre liquidaciones `LIQUIDADO` o `CERRADO`. | `TrazabilidadService.resumen` |
| RN-09 | La trazabilidad muestra la versión de parametrización vigente al momento de liquidar, no la actual. | `parametrizacionJson` (snapshot) |

---

### 3.6 Atributos de calidad

| Atributo | Estado | Notas |
| --- | --- | --- |
| Rendimiento | ✅ | Liquidación mensual < 30 s con `Datatest/` (suite de tests < 30 s) |
| Disponibilidad offline | ✅ | Operación con `FUENTES_MODO=mock` |
| Seguridad | ✅ | JWT + bcrypt + RolesGuard global |
| Trazabilidad | ✅ | Log estructural + log de auditoría de consultas |
| Documentación de la API | ✅ | Swagger en `/api/docs` |
| i18n | ✅ | UI en español, mensajes y datos en snake_case |
| Concurrencia | ✅ | Lock pesimista por período (`sp_getapplock`) |
| Resiliencia | ✅ | Recuperación de liquidaciones huérfanas al arrancar (`OnApplicationBootstrap`) |
| Observabilidad | ✅ parcial | Logs estructurados en `backend.log`; no JSON nativo |
| Migrations de BD | ❌ Pendiente | Sustituir `synchronize: true` |
| Healthcheck | ❌ Pendiente | Crear `GET /api/health` |
| Métricas (Prometheus) | ❌ Pendiente | — |
| ESLint/Prettier | ❌ Pendiente | Script existe, falta `.eslintrc` |

---

## 4. Arquitectura del sistema

### 4.1 Stack tecnológico

| Capa | Tecnología | Versión |
| --- | --- | --- |
| Backend framework | NestJS | 10.3.x |
| Backend lenguaje | TypeScript sobre Node.js | Node 22 LTS |
| ORM | TypeORM | 0.3.x |
| BD transaccional | Microsoft SQL Server | 2022 |
| BD externa (solo lectura) | Microsoft SQL Server `INDICADORES` | — |
| API externa | Midasoft REST | ambiente pruebas |
| Frontend framework | Vue | 3.4.x |
| Frontend build | Vite | 5.3.x |
| Frontend estado | Pinia | 2.1.x |
| Frontend routing | Vue Router | 4.3.x |
| Frontend HTTP | Axios | 1.7.x |
| Autenticación | JWT (Passport) + bcryptjs | — |
| Documentación API | Swagger (OpenAPI 3) | vía `@nestjs/swagger` |
| Tests | Jest | 29.7.x |
| Gestor (backend) | npm | — |
| Gestor (frontend) | pnpm | 9+ |

### 4.2 Diagrama de componentes

```
┌──────────────────────────────────────────────────────────────────────────┐
│                            Cliente (navegador)                           │
│  ┌────────────────────────────────────────────────────────────────┐      │
│  │  Vue 3 SPA (Vite, Pinia, Vue Router, Tailwind)                │      │
│  │  ┌────────┐ ┌────────┐ ┌────────────┐ ┌──────────┐ ┌────────┐  │      │
│  │  │ Login  │ │ Dashb. │ │ Calendarios│ │ Paramet. │ │Liquidac│  │      │
│  │  └────────┘ └────────┘ └────────────┘ └──────────┘ └────────┘  │      │
│  │  ┌────────────┐ ┌────────────┐ ┌──────────┐                    │      │
│  │  │ Trazabil.  │ │ Datos orig.│ │ Stores   │                    │      │
│  │  └────────────┘ └────────────┘ └──────────┘                    │      │
│  └────────────────────────────────────────────────────────────────┘      │
└──────────────┬───────────────────────────────────────────────────────────┘
               │  HTTPS · Bearer JWT
               ▼
┌──────────────────────────────────────────────────────────────────────────┐
│                       Backend NestJS (Node 22)                            │
│  ┌──────────┐ ┌─────────┐ ┌────────────┐ ┌─────────────┐ ┌──────────────┐  │
│  │  Auth    │ │ Users   │ │  Database  │ │  Common     │ │Integraciones │  │
│  │ (JWT+R)  │ │ (mock)  │ │ (TypeORM)  │ │ /audit      │ │ ICG+Midasoft │  │
│  └────┬─────┘ └────┬────┘ └─────┬──────┘ └──────┬──────┘ └──────┬───────┘  │
│       │            │            │                │               │          │
│  ┌────▼────────────▼────────────▼────────────────▼───────────────▼──────┐  │
│  │                            Módulos de negocio                       │  │
│  │  ┌─────────────┐ ┌─────────────┐ ┌────────────┐ ┌─────────────┐      │  │
│  │  │ Catálogos   │ │ Calendarios │ │Parametriz. │ │ Liquidación │      │  │
│  │  └─────────────┘ └─────────────┘ └────────────┘ └──────┬──────┘      │  │
│  │                                                       │             │  │
│  │                                                ┌──────▼──────┐      │  │
│  │                                                │Trazabilidad │      │  │
│  │                                                └─────────────┘      │  │
│  └────────────────────────────────────────────────────────────────────┘  │
└──────┬───────────────────────────┬────────────────────────────┬──────────┘
       │                           │                            │
       ▼                           ▼                            ▼
┌──────────────┐         ┌────────────────────┐       ┌────────────────────┐
│ SQL Server   │         │ SQL Server         │       │ API REST Midasoft   │
│ `comisiones` │         │ `INDICADORES`      │       │ `pruebaspermoda`    │
│ (propia)     │         │ `10.1.5.61` SOLO   │       │ SOLO CONSULTA       │
│              │         │ LECTURA · SP_*     │       │                     │
└──────────────┘         └────────────────────┘       └────────────────────┘
```

### 4.3 Capas del backend

| Capa | Patrón | Descripción |
| --- | --- | --- |
| Presentación | NestJS Controllers | Reciben HTTP, validan DTO, delegan a servicios. Decorados con `@ApiTags` y `@ApiOperation`. |
| Aplicación | NestJS Services | Orquestan casos de uso, transacciones, mapeo de errores a excepciones HTTP. |
| Dominio | Servicios puros | `ReglasComisionService`, `AfectacionesService`, `NormalizacionService`, `SubPeriodoService` — sin acceso a BD, fácilmente portables a .NET 10. |
| Persistencia | TypeORM Repositories | Acceso a datos tipados; entidades con FKs explícitas. |
| Integración | Services con token DI | `IndicadoresService` y `MidasoftService` se intercambian por mocks vía `useFactory`. |
| Transversal | Guards, Decorators, Audit | `JwtAuthGuard`, `RolesGuard`, `LogEstructuralService`, `common/validators/`. |

### 4.4 Capas del frontend

| Capa | Descripción |
| --- | --- |
| Vistas (componentes Smart) | `views/*.vue` — usan Composition API, cargan datos, manejan estado de UI. |
| Servicios (`services/api.ts`) | Centraliza axios; expone objetos `*Api` por dominio con tipos. |
| Estado global | Pinia store `auth` (token, usuario, login/logout). |
| Router | `router/index.ts` con `meta.public` y `meta.title`; guard global verifica `isAuthenticated`. |
| Utilidades | `utils/formato.ts` (clase CSS de estado, formateadores de moneda y fecha). |
| Interceptores axios | Inyectan `Authorization: Bearer` y manejan 401 con logout + redirect. |

### 4.5 Integraciones externas

| Integración | Tipo | Modo | Modo mock | Notas |
| --- | --- | --- | --- | --- |
| `INDICADORES` (10.1.5.61) | SQL Server · SP | Solo lectura · `mssql` (conexión perezosa) | `IndicadoresMockService` lee `Datatest/` | SP: `SP_GetPOSCommissionsDetail`, `SP_GetPOSCommissionsSummary` |
| Midasoft (pruebaspermoda) | REST + JWT | Solo lectura · `fetch` nativo | `MidasoftMockService` lee `Datatest/` | Endpoints: `/SEG`, `/EMP/EmpleadosPermoda`. Pendientes: novedades, marcaciones |

### 4.6 Estrategia de operación offline (mock/real)

`IntegracionesModule` conmuta las implementaciones según la variable de entorno `FUENTES_MODO`:

```ts
{ provide: IndicadoresService, useFactory: (cfg) =>
    cfg.get('FUENTES_MODO') === 'mock' ? new IndicadoresMockService(cfg) : new IndicadoresService(cfg) }
```

Implicaciones operativas:

- **Cambiar a real:** editar `.env` (`FUENTES_MODO=real`) + credenciales reales. No requiere recompilar.
- **IndicadoresService** abre la conexión a `INDICADORES` solo en el primer uso (lazy), por lo que la app arranca aunque falten credenciales (devuelve 503 al primer uso).
- **MidasoftService** cachea el token durante 10 minutos para evitar relogin por cada consulta.

---

## 5. Modelo de datos

### 5.1 Diagrama entidad-relación (resumen)

```
┌──────────────┐ 1   N ┌──────────────┐ 1   N ┌──────────────────┐
│ grupo_tiendas├──────►│   tienda     │       │  parametrizacion │
└──────────────┘       └──────┬───────┘       │      _cargo      │
                              │               │                  │
                              │ 1             │ - id_param (PK)  │
                              ▼ N             │ - codigo_oficio  │
                       ┌──────────────┐       │ - tipo_liquid.   │
                       │  colaborador │       │ - tipo_distrib.  │
                       └──────┬───────┘       │ - porc_*         │
                              │               │ - vigencia_*     │
                              │ 1             │ - estado_activo  │
                              ▼ N             │ - motivo/usuario │
                       ┌──────────────────┐   └────┬─────────────┘
                       │   venta_icg      │        │ 1
                       └──────────────────┘        │ N
                                                   ▼
       ┌──────────────┐ 1   N ┌──────────────────┐ │ ┌──────────────────┐
       │  calendario  ├──────►│     periodo      │ │ │ rango_comision   │
       └──────────────┘       │ estado_operativo │ │ └──────────────────┘
                              └────────┬─────────┘ │
                                       │ 1         │
                                       │ N         │
                                       ▼           │
                              ┌──────────────────┐ │
                              │   liquidacion    │◄┘
                              │   (cabecera)     │
                              └────────┬─────────┘
                                       │ 1
                                       │ N
                              ┌────────▼─────────┐         ┌──────────────────┐
                              │ liquidacion_     │ N     1 │ liquidacion_     │
                              │    detalle       ├─────────┤   subperiodo     │
                              └──────────────────┘         └────────┬─────────┘
                                                                 │ N    1
                                                                 │      │
                                                                 ▼      │
                                                        ┌──────────────┐ │
                                                        │ cambio_cargo │◄┘
                                                        │  _periodo    │
                                                        └──────────────┘
```

### 5.2 Catálogo de entidades

| Tabla | Tabla SQL | PK | Propósito | Módulo |
| --- | --- | --- | --- | --- |
| `Calendario` | `calendario` | `id_calendario` (uuid) | Cabecera de un calendario anual | calendarios |
| `Periodo` | `periodo` | `id_periodo` (uuid) | Mes de un calendario (patrón 21–20) | calendarios |
| `GrupoTiendas` | `grupo_tiendas` | `id_grupo` (uuid) | Agrupación de tiendas | catalogos |
| `Tienda` | `tienda` | `id_tienda` (uuid) | Tienda comercial | catalogos |
| `Colaborador` | `colaborador` | `id_colaborador` (uuid) | Datos básicos del empleado (cache) | catalogos |
| `VentaICG` | `venta_icg` | `id_venta` (uuid) | Cache de ventas desde ICG | catalogos |
| `ParametrizacionCargo` | `parametrizacion_cargo` | `id_parametrizacion` (uuid) | Configuración vigente por cargo × período | parametrizacion |
| `RangoComision` | `rango_comision` | `id_rango` (uuid) | Tramo de comisión por cumplimiento | parametrizacion |
| `PresupuestoCargoPeriodo` | `presupuesto_cargo_periodo` | `id_presupuesto` (uuid) | Valor de presupuesto por cargo × período × tienda | parametrizacion |
| `PresupuestoRangoComision` | `presupuesto_rango_comision` | `id_rango` (uuid) | Tabla de % por cumplimiento de presupuesto | parametrizacion |
| `CrecimientoRango` | `crecimiento_rango` | `id_rango` (uuid) | Tabla de % por crecimiento | parametrizacion |
| `CambioCargoPeriodo` | `cambio_cargo_periodo` | `id_cambio` (uuid) | Cambios detectados por Midasoft | liquidacion |
| `Liquidacion` | `liquidacion` | `id_liquidacion` (uuid) | Cabecera de ejecución del motor | liquidacion |
| `LiquidacionSubperiodo` | `liquidacion_subperiodo` | `id_subperiodo` (uuid) | Tramo por colaborador tras fragmentación | liquidacion |
| `LiquidacionDetalle` | `liquidacion_detalle` | `id_detalle` (uuid) | Unidad mínima persistida (colab × subperíodo × tipo venta) | liquidacion |
| `LiquidacionLog` | `liquidacion_log` | `id_log` (uuid) | Bitácora paso a paso del motor | liquidacion |
| `LogCambioEstructural` | `log_cambios_estructurales` | `id_log` (uuid) | Log de cambios en entidades de config | common/audit |
| `AuditoriaConsulta` | `auditoria_consulta` | `id_auditoria` (uuid) | Log de consultas en trazabilidad | trazabilidad |

### 5.3 Convenciones de nombrado

- **Tablas:** snake_case (`calendario`, `parametrizacion_cargo`).
- **Columnas:** snake_case (`id_calendario`, `codigo_oficio`, `fecha_inicio`).
- **Clases TypeScript:** PascalCase (`Calendario`, `ParametrizacionCargo`).
- **Propiedades:** camelCase (`idCalendario`, `codigoOficio`, `fechaInicio`).
- **Llaves primarias:** `id_<tabla>` (uuid) salvo en log de auditoría.
- **Llaves foráneas:** `id_<tabla_referenciada>` o `id_<entidad>` (explícitas vía `@JoinColumn`).
- **Estados:** enums con valores `UPPER_SNAKE_CASE` (`EN_CURSO`, `LIQUIDADO`).
- **Subperíodos:** `motivo` ∈ `{INICIAL, CAMBIO_CARGO, TRASLADO_CC}`.

---

## 6. Backend — Composición estructural

### 6.1 Mapa de módulos

```
src/
├── main.ts                       Bootstrap de la app
├── app.module.ts                 Composición de módulos + guards globales
├── app.controller.ts             Endpoint raíz
├── app.service.ts                Servicio raíz
│
├── auth/                         Autenticación
│   ├── auth.module.ts
│   ├── auth.controller.ts        POST /auth/login · GET /auth/me
│   ├── auth.service.ts
│   ├── decorators/               @CurrentUser
│   ├── dto/                      LoginDto
│   ├── guards/                   JwtAuthGuard, RolesGuard
│   └── strategies/               JwtStrategy, obtenerJwtSecret
│
├── users/                        Usuarios (mock)
│   ├── users.module.ts
│   ├── users.service.ts
│   ├── interfaces/               IUser, RolUsuario
│   └── repositories/             UsersMockRepository
│
├── database/                     Configuración TypeORM
│   └── database.module.ts        (orden topológico de entidades)
│
├── common/                       Servicios transversales
│   ├── audit/                    LogEstructuralService + entity
│   ├── decorators/               @Public, @Roles
│   └── validators/               IsGuid, IsAfterOrEqual
│
└── modules/                      Módulos de dominio
    ├── integraciones/            Fuentes externas (ICG, Midasoft)
    │   ├── integraciones.module.ts        conmutador mock/real
    │   ├── integraciones.controller.ts
    │   ├── indicadores.service.ts          (real)
    │   ├── midasoft.service.ts             (real)
    │   ├── mock/                           (servicios mock)
    │   │   ├── datatest-loader.ts
    │   │   ├── indicadores-mock.service.ts
    │   │   └── midasoft-mock.service.ts
    │   └── dto/
    │
    ├── catalogos/                Catálogos auxiliares
    │   ├── catalogos.module.ts
    │   ├── catalogos.controller.ts
    │   ├── catalogos.service.ts
    │   └── entities/             colaborador, grupo-tiendas, tienda, venta-icg
    │
    ├── calendarios/              Configuración temporal
    │   ├── calendarios.module.ts
    │   ├── calendarios.controller.ts
    │   ├── calendarios.service.ts
    │   ├── dto/                  Crear/Actualizar Calendario, Crear/Actualizar Periodo, GenerarAnio
    │   └── entities/             calendario, periodo
    │
    ├── parametrizacion/          Parametrización de cargos
    │   ├── parametrizacion.module.ts
    │   ├── parametrizacion.controller.ts
    │   ├── parametrizacion.service.ts
    │   ├── controllers/          presupuestos, presupuesto-rangos, crecimiento-rangos
    │   ├── services/             presupuestos, presupuesto-rangos, crecimiento-rangos, cargos-catalogo
    │   ├── dto/                  Crear/Actualizar/Rango/Presupuesto
    │   ├── entities/             parametrizacion-cargo, rango-comision, presupuesto-cargo-periodo,
    │   │                          presupuesto-rango, crecimiento-rango
    │   └── validaciones/         validar-rangos.util
    │
    ├── liquidacion/              Motor de liquidación
    │   ├── liquidacion.module.ts
    │   ├── controllers/          liquidacion.controller
    │   ├── services/             liquidacion, normalizacion, subperiodo, afectaciones,
    │   │                          reglas-comision, archivo-plano, liquidacion-lock
    │   └── entities/             liquidacion, liquidacion-detalle, liquidacion-subperiodo,
    │                              liquidacion-log, cambio-cargo-periodo
    │
    └── trazabilidad/             Consulta y auditoría
        ├── trazabilidad.module.ts
        ├── controllers/          trazabilidad.controller
        ├── services/             trazabilidad
        ├── dto/                  filtros-trazabilidad
        └── entities/             auditoria-consulta
```

### 6.2 Módulo `auth` (autenticación)

| Elemento | Ubicación | Descripción |
| --- | --- | --- |
| `AuthService` | `src/auth/auth.service.ts` | Valida credenciales, emite JWT. |
| `AuthController` | `src/auth/auth.controller.ts` | `POST /api/auth/login` (público), `GET /api/auth/me`. |
| `JwtStrategy` | `src/auth/strategies/jwt.strategy.ts` | Valida el token; lee `JWT_SECRET` con fail-fast. |
| `JwtAuthGuard` | `src/auth/guards/jwt-auth.guard.ts` | Guard global, respeta `@Public()`. |
| `RolesGuard` | `src/auth/guards/roles.guard.ts` | Guard global, valida `@Roles(...)`. |
| `CurrentUser` decorator | `src/auth/decorators/current-user.decorator.ts` | Inyecta el `JwtPayload` en el request. |
| Usuarios seed | `src/users/repositories/users-mock.repository.ts` | `admin@permoda.com` / `comisiones@permoda.com` con bcrypt. |

**Tokens y secretos:**

- `JWT_SECRET` obligatorio en `.env`; si falta, la aplicación no arranca.
- Expiración configurable vía `JWT_EXPIRES_IN` (default `1h`).

### 6.3 Módulo `database`

| Elemento | Ubicación | Descripción |
| --- | --- | --- |
| `DatabaseModule` | `src/database/database.module.ts` | Configura TypeORM con SQL Server. Las entidades se listan en **orden topológico** para que las FKs se creen sin errores. |
| Orden de entidades | (en `entities: [...]`) | nivel 0: `grupo_tiendas`, `calendario` → 1: `tienda`, `periodo` → 2: `colaborador`, `venta_icg`, `log_cambios_estructurales` → 3: `parametrizacion_cargo`, `presupuesto_cargo_periodo` → 4: `rango_comision`, `presupuesto_rango_comision`, `crecimiento_rango` → 5: `cambio_cargo_periodo` → 6: `liquidacion` → 7: `liquidacion_subperiodo` → 8: `liquidacion_detalle` → 9: `liquidacion_log`, `auditoria_consulta`. |
| `synchronize` | `!isProd` | Solo activo en desarrollo. En producción debe desactivarse y usar migrations. |

### 6.4 Módulo `common/audit` (log estructural)

| Elemento | Ubicación | Descripción |
| --- | --- | --- |
| `LogCambioEstructural` entity | `src/common/audit/log-cambio-estructural.entity.ts` | Tabla `log_cambios_estructurales`. |
| `LogEstructuralService` | `src/common/audit/log-estructural.service.ts` | API `registrar(params, manager?)` para usar dentro o fuera de transacciones. |
| `TipoEntidadLog` | enum | `CALENDARIO`, `PERIODO`, `PARAMETRIZACION`. |
| `AccionLog` | enum | `CREATE`, `UPDATE`, `DELETE`. |

### 6.5 Módulo `integraciones`

| Elemento | Ubicación | Descripción |
| --- | --- | --- |
| `IndicadoresService` (real) | `src/modules/integraciones/indicadores.service.ts` | Conexión perezosa a SQL Server `INDICADORES`; ejecuta SP con guardarraíl de 62 días. |
| `IndicadoresMockService` | `src/modules/integraciones/mock/indicadores-mock.service.ts` | Genera ventas deterministas (hash FNV-1a) para pruebas offline. |
| `MidasoftService` (real) | `src/modules/integraciones/midasoft.service.ts` | Login con caché de token (10 min) + `GET /EMP/EmpleadosPermoda`. `novedades()` y `marcaciones()` devuelven `[]` hasta que Midasoft exponga los endpoints. |
| `MidasoftMockService` | `src/modules/integraciones/mock/midasoft-mock.service.ts` | Lee `BaseEmpleados_*.txt`, `MarcacionesComercial_*.txt`, `NovedadesComercial_*.txt`. |
| `DatatestLoader` | `src/modules/integraciones/mock/datatest-loader.ts` | Parser de los TXT (formato `;` con comillas). |
| `IntegracionesController` | `src/modules/integraciones/integraciones.controller.ts` | Endpoints de consulta directa: `GET /api/integraciones/comisiones/{detalle,resumen}`, `GET /api/integraciones/midasoft/empleados`. |

### 6.6 Módulo `catalogos`

| Elemento | Ubicación | Descripción |
| --- | --- | --- |
| `CatalogosController` | `src/modules/catalogos/catalogos.controller.ts` | `GET /api/catalogos/colaboradores`. |
| `CatalogosService` | `src/modules/catalogos/catalogos.service.ts` | Lista colaboradores desde la BD local. |
| Entidades | `entities/{colaborador,grupo-tiendas,tienda,venta-icg}.entity.ts` | Tablas auxiliares. |

### 6.7 Módulo `calendarios`

| Elemento | Ubicación | Descripción |
| --- | --- | --- |
| `CalendariosService` | `src/modules/calendarios/calendarios.service.ts` | CRUD + generación masiva + validaciones de no solapamiento y secuencia. |
| `CalendariosController` | `src/modules/calendarios/calendarios.controller.ts` | `GET/POST/PATCH/DELETE /api/calendarios[/:id]` + `/periodos` y `/periodos/generar-anio`. |
| `Calendario` entity | `entities/calendario.entity.ts` | `id_calendario`, `nombre`, `anio`, `estado_activo`. |
| `Periodo` entity | `entities/periodo.entity.ts` | `id_periodo`, `id_calendario`, `codigo`, `fecha_inicio`, `fecha_fin`, `estado_operativo`. |
| DTOs | `dto/*.dto.ts` | `CrearCalendarioDto`, `CrearPeriodoDto`, `GenerarAnioPeriodosDto`, `Actualizar*Dto`. |

**Reglas de negocio implementadas:**

- `validarSolapamiento` (línea 345-368): SQL `p.fecha_inicio <= :fechaFin AND p.fecha_fin >= :fechaInicio`.
- `validarSecuencia` (línea 380-423): contigüidad contra el período inmediatamente anterior y el posterior.
- `validarSinLiquidaciones` (línea 425-435): consulta `Liquidacion.exists`.
- `generarAnioPeriodos` (línea 281-336): transacción atómica, año se toma del calendario.

### 6.8 Módulo `parametrizacion`

| Elemento | Ubicación | Descripción |
| --- | --- | --- |
| `ParametrizacionService` | `src/modules/parametrizacion/parametrizacion.service.ts` | CRUD + validaciones de negocio (9 tests). |
| `CargosCatalogoInMemoryService` | `services/cargos-catalogo.service.ts` | Catálogo hardcodeado de 11 cargos Midasoft con su afectación sugerida. Token DI `CARGOS_CATALOGO` permite reemplazarlo. |
| `PresupuestosService` | `services/presupuestos.service.ts` | CRUD de `presupuesto_cargo_periodo`. |
| `PresupuestoRangosService` | `services/presupuesto-rangos.service.ts` | Reemplazo masivo de rangos de presupuesto. |
| `CrecimientoRangosService` | `services/crecimiento-rangos.service.ts` | CRUD de `crecimiento_rango`. |
| `validarContinuidadRangos` | `validaciones/validar-rangos.util.ts` | Función pura, sin dependencias; compartida. |
| 4 controllers | `controllers/*.controller.ts` | Rutas `parametrizacion`, `parametrizacion/presupuestos`, `parametrizacion/presupuestos-rangos`, `parametrizacion/crecimiento-rangos`. |

**Reglas de negocio implementadas:**

- `validarCargoOficial` — código debe existir en el catálogo.
- `validarCruzadaLiqDist` — Individual + Individual; rechaza Individual + Proporcional.
- `validarEstrategia` — `porcEstrategia + porcDescuentoCorporativo ≤ porcLinea`.
- `validarVigenciaNoSolapa` — dos parametrizaciones activas del mismo cargo no pueden solaparse en vigencia.

### 6.9 Módulo `liquidacion` (motor)

| Elemento | Ubicación | Descripción |
| --- | --- | --- |
| `LiquidacionService` | `services/liquidacion.service.ts` | Orquestador de 7 pasos (723 LOC). |
| `LiquidacionLockService` | `services/liquidacion-lock.service.ts` | `sp_getapplock` exclusivo con timeout 5 s. |
| `NormalizacionService` | `services/normalizacion.service.ts` | `÷1.19` + agrupación + comisión bancaria al tipo mayor (9 tests). |
| `SubPeriodoService` | `services/subperiodo.service.ts` | Fragmentación por cambios (4 tests). |
| `AfectacionesService` | `services/afectaciones.service.ts` | Horas/Novedades con excepciones (8 tests). |
| `ReglasComisionService` | `services/reglas-comision.service.ts` | 3 reglas implementadas; la 4ª delegada con TODO. |
| `ArchivoPlanoService` | `services/archivo-plano.service.ts` | Genera archivo de nómina (37 columnas, `;`, encabezado fijo). |
| `LiquidacionController` | `controllers/liquidacion.controller.ts` | `GET /elegibilidad/:idPeriodo`, `POST /ejecutar`, `PATCH /:id/cerrar`, `GET /:id/archivo`. |
| Entidades | `entities/{liquidacion,liquidacion-detalle,liquidacion-subperiodo,liquidacion-log,cambio-cargo-periodo}.entity.ts` | 5 entidades con FKs explícitas. |

**Pipeline de ejecución (7 pasos):**

```
1. Validar elegibilidad
   ↓
2. Adquirir lock pesimista (sp_getapplock)
   ↓
3. Crear cabecera Liquidacion(estado=EN_CURSO)
   ↓
4. Consumir ICG (ventas + com. bancaria)
   ↓
5. Normalizar (÷1.19 + agrupación)
   ↓
6. Consumir Midasoft (empleados, marcaciones, novedades, cambios)
   ↓
7. Generar subperíodos por cambio de cargo/CC
   ↓
8. Aplicar reglas (multi-cargo) y acumular resultados
   ↓
9. Transacción atómica:
      - Persistir subperíodos
      - Persistir detalles
      - Cerrar liquidación (estado=LIQUIDADO)
      - Cambiar estado del período (estado_operativo=LIQUIDADO)
   ↓
10. Escribir archivo plano de nómina
   ↓
11. Liberar lock
```

**Recuperación ante caída:** al arrancar, `onApplicationBootstrap` marca como `ERROR` cualquier liquidación en `EN_CURSO` huérfana.

### 6.10 Módulo `trazabilidad`

| Elemento | Ubicación | Descripción |
| --- | --- | --- |
| `TrazabilidadService` | `services/trazabilidad.service.ts` | Resumen multi-filtro, drill-down, exportación CSV. |
| `TrazabilidadController` | `controllers/trazabilidad.controller.ts` | `POST /api/trazabilidad/resumen`, `GET /api/trazabilidad/detalle/:idLiq/:idColab`, `GET /api/trazabilidad/exportar/:idLiq`, `GET /api/trazabilidad/colaboradores/:idLiq`. |
| `AuditoriaConsulta` entity | `entities/auditoria-consulta.entity.ts` | Bitácora con `accion ∈ {CONSULTA_RESUMEN, DRILLDOWN, EXPORTACION}`. |

---

## 7. Frontend — Composición estructural

### 7.1 Mapa de carpetas

```
src/
├── main.ts                  Bootstrap Vue + Pinia + Router
├── App.vue                  Shell (sidebar + topbar) o solo <RouterView> si no autenticado
├── router/
│   └── index.ts             7 rutas + guard global
├── services/
│   └── api.ts               Instancia axios + 8 objetos *Api (auth, calendarios, periodos, parametrizacion, presupuestos, rangos, liquidacion, trazabilidad, colaboradores, integraciones)
├── stores/
│   └── auth.ts              Pinia store con token + user + login/logout
├── utils/
│   └── formato.ts           clsEstado, formatearMoneda, formatearFecha
├── views/
│   ├── LoginView.vue
│   ├── DashboardView.vue
│   ├── CalendariosView.vue
│   ├── ParametrizacionView.vue
│   ├── LiquidacionView.vue
│   ├── TrazabilidadView.vue
│   └── DatosView.vue
└── assets/
    └── main.css             Estilos globales (no hay `tailwind.config.js`; los estilos usan CSS variables y clases propias)
```

### 7.2 Capa de servicios (`services/api.ts`)

- Instancia única `api` con `baseURL: '/api'` (proxy Vite hacia `http://localhost:3000`).
- **Interceptor de petición:** añade `Authorization: Bearer <token>`.
- **Interceptor de respuesta:** en 401 limpia sesión y redirige a `/login`.
- Objetos `*Api` tipados por dominio con DTOs de entrada y tipos de salida.

### 7.3 Capa de estado (Pinia)

Solo existe el store `auth`:

| Estado | Tipo | Descripción |
| --- | --- | --- |
| `token` | `Ref<string \| null>` | JWT persistido en `localStorage`. |
| `user` | `Ref<UsuarioAutenticado \| null>` | Datos del usuario (id, email, nombre, rol). |
| `isAuthenticated` | `computed<boolean>` | `!!token`. |
| `esAdministrador` / `esProfesionalComisiones` | `computed<boolean>` | Helpers de rol. |

### 7.4 Router y guard

| Ruta | Nombre | Componente | Pública | Título |
| --- | --- | --- | --- | --- |
| `/login` | `login` | `LoginView` | sí | Iniciar sesión |
| `/` | `dashboard` | `DashboardView` | no | Resumen general |
| `/calendarios` | `calendarios` | `CalendariosView` | no | Calendarios y períodos |
| `/parametrizacion` | `parametrizacion` | `ParametrizacionView` | no | Parametrización de cargos |
| `/liquidacion` | `liquidacion` | `LiquidacionView` | no | Liquidación automática |
| `/trazabilidad` | `trazabilidad` | `TrazabilidadView` | no | Trazabilidad y salida |
| `/datos` | `datos` | `DatosView` | no | Datos de origen |

Guard global (`router.beforeEach`): si la ruta no es pública y el usuario no está autenticado, redirige a `/login`; si está autenticado e intenta ir a `/login`, redirige a `/`.

### 7.5 Vistas por dominio

| Vista | Composición | Servicios consumidos |
| --- | --- | --- |
| `LoginView` | Formulario email + password; tras éxito redirige a `/`. | `authApi.login` (vía `authStore`) |
| `DashboardView` | 4 stat-cards (períodos abiertos, colaboradores activos, liquidados, comisión de la última) + accesos rápidos. | `calendariosApi.getAll`, `periodosApi.getByCalendario`, `liquidacionApi.getAll`, `colaboradoresApi.getAll` |
| `CalendariosView` | CRUD de calendarios y períodos; generación masiva anual; tabs por calendario. | `calendariosApi.{getAll,getOne,create,update,remove}`, `periodosApi.{getByCalendario,create,generarAnio,update,remove}` |
| `ParametrizacionView` | Listado + filtros; formulario crear/editar con % por tipo, estrategia CORPORATIVO/REAL, vigencias, rangos por cumplimiento, afectación; carga tablas de presupuesto/crecimiento como referencia. | `parametrizacionApi.{catalogoCargos,getAll,getOne,create,update,desactivar,remove}`, `presupuestosApi.getAll`, `presupuestoRangosApi.getAll`, `crecimientoRangosApi.getAll` |
| `LiquidacionView` | Selector calendario + período; panel de elegibilidad; resultado con stats; historial; descarga de archivo plano. | `calendariosApi.getAll`, `periodosApi.getByCalendario`, `liquidacionApi.{elegibilidad,ejecutar,cerrar,getAll,descargarArchivo}` |
| `TrazabilidadView` | Multi-filtro; tabla resumen; tabla detalle por colaboradores con drill-down; exportación CSV. | `calendariosApi.getAll`, `periodosApi.getByCalendario`, `trazabilidadApi.{resumen,detalle,colaboradores,exportarCsv}` |
| `DatosView` | Consulta directa a ICG (resumen/detalle) y Midasoft (empleados); filtro en memoria; límite 300 filas. | `integracionesApi.{comisionesDetalle,comisionesResumen,empleados}` |

---

## 8. API REST — Contrato

### 8.1 Convenciones

- Prefijo global: `/api`.
- Autenticación: `Authorization: Bearer <jwt>` (excepto `/api/auth/login`).
- Formato: JSON (UTF-8).
- Códigos HTTP: `200` éxito, `201` creado, `204` sin contenido, `400` validación, `401` no autenticado, `403` sin rol, `404` no encontrado, `409` conflicto (lock), `503` dependencia externa caída.
- Documentación interactiva: `http://localhost:3000/api/docs` (Swagger UI).

### 8.2 Catálogo de endpoints

#### 8.2.1 Autenticación

| Método | Ruta | Roles | Descripción |
| --- | --- | --- | --- |
| `POST` | `/api/auth/login` | público | Login. Devuelve `access_token` y datos del usuario. |
| `GET` | `/api/auth/me` | autenticado | Perfil del usuario actual. |

#### 8.2.2 Calendarios y períodos

| Método | Ruta | Roles | Descripción |
| --- | --- | --- | --- |
| `GET` | `/api/calendarios` | autenticado | Lista todos los calendarios. |
| `GET` | `/api/calendarios/:id` | autenticado | Detalle con períodos. |
| `POST` | `/api/calendarios` | ADMIN, PROFESIONAL | Crea un calendario. |
| `PATCH` | `/api/calendarios/:id` | ADMIN, PROFESIONAL | Actualiza. |
| `DELETE` | `/api/calendarios/:id` | ADMIN | Elimina si no tiene períodos. |
| `GET` | `/api/calendarios/:id/periodos` | autenticado | Períodos del calendario. |
| `POST` | `/api/calendarios/periodos` | ADMIN, PROFESIONAL | Crea un período (valida solapamiento y secuencia). |
| `POST` | `/api/calendarios/:id/periodos/generar-anio` | ADMIN, PROFESIONAL | Genera 12 períodos en transacción atómica. |
| `PATCH` | `/api/calendarios/periodos/:id` | ADMIN, PROFESIONAL | Actualiza (solo si está Abierto y sin liquidaciones). |
| `DELETE` | `/api/calendarios/periodos/:id` | ADMIN | Elimina (solo si está Abierto y sin liquidaciones). |

#### 8.2.3 Parametrización

| Método | Ruta | Roles | Descripción |
| --- | --- | --- | --- |
| `GET` | `/api/parametrizacion/cargos` | autenticado | Catálogo de 11 cargos Midasoft. |
| `GET` | `/api/parametrizacion/vigente` | autenticado | Parametrización vigente de un cargo en una fecha (`?codigoOficio&fecha`). |
| `GET` | `/api/parametrizacion` | autenticado | Lista parametrizaciones (filtros `?idPeriodo&codigoOficio`). |
| `GET` | `/api/parametrizacion/:id` | autenticado | Detalle con rangos. |
| `POST` | `/api/parametrizacion` | ADMIN, PROFESIONAL | Crea. |
| `PATCH` | `/api/parametrizacion/:id` | ADMIN, PROFESIONAL | Actualiza (motivo obligatorio). |
| `PATCH` | `/api/parametrizacion/:id/desactivar` | ADMIN, PROFESIONAL | Desactiva (no borra). |
| `DELETE` | `/api/parametrizacion/:id` | ADMIN | Elimina (solo para errores). |

#### 8.2.4 Presupuestos y rangos

| Método | Ruta | Roles | Descripción |
| --- | --- | --- | --- |
| `GET` | `/api/parametrizacion/presupuestos` | autenticado | Lista presupuestos. |
| `POST` | `/api/parametrizacion/presupuestos` | ADMIN, PROFESIONAL | Crea. |
| `PATCH` | `/api/parametrizacion/presupuestos/:id` | ADMIN, PROFESIONAL | Actualiza. |
| `DELETE` | `/api/parametrizacion/presupuestos/:id` | ADMIN | Elimina. |
| `GET` | `/api/parametrizacion/presupuestos-rangos` | autenticado | Lista rangos de cumplimiento de presupuesto. |
| `POST` | `/api/parametrizacion/presupuestos-rangos` | ADMIN, PROFESIONAL | Reemplazo masivo. |
| `DELETE` | `/api/parametrizacion/presupuestos-rangos/:codigoOficio/:idPeriodo` | ADMIN | Elimina todos. |
| `GET` | `/api/parametrizacion/crecimiento-rangos` | autenticado | Lista rangos de crecimiento. |
| `POST` | `/api/parametrizacion/crecimiento-rangos` | ADMIN, PROFESIONAL | Reemplazo masivo. |
| `DELETE` | `/api/parametrizacion/crecimiento-rangos/:codigoOficio/:idPeriodo` | ADMIN | Elimina todos. |

#### 8.2.5 Liquidación

| Método | Ruta | Roles | Descripción |
| --- | --- | --- | --- |
| `GET` | `/api/liquidacion/elegibilidad/:idPeriodo` | autenticado | Evalúa si el período es elegible. |
| `POST` | `/api/liquidacion/ejecutar` | PROFESIONAL | Ejecuta el motor (acepta UUID o código de período). |
| `PATCH` | `/api/liquidacion/:id/cerrar` | PROFESIONAL | Cierra una liquidación Liquidado → Cerrado. |
| `GET` | `/api/liquidacion` | autenticado | Historial. |
| `GET` | `/api/liquidacion/:id` | autenticado | Detalle. |
| `GET` | `/api/liquidacion/:id/archivo` | autenticado | Descarga el archivo plano de nómina. |

#### 8.2.6 Trazabilidad

| Método | Ruta | Roles | Descripción |
| --- | --- | --- | --- |
| `POST` | `/api/trazabilidad/resumen` | autenticado | Resumen multi-filtro (Liquidado/Cerrado). |
| `GET` | `/api/trazabilidad/detalle/:idLiquidacion/:idColaborador` | autenticado | Drill-down por colaborador. |
| `GET` | `/api/trazabilidad/exportar/:idLiquidacion` | autenticado | Exporta CSV. |
| `GET` | `/api/trazabilidad/colaboradores/:idLiquidacion` | autenticado | IDs de colaboradores con detalle. |

#### 8.2.7 Catálogos e integraciones

| Método | Ruta | Roles | Descripción |
| --- | --- | --- | --- |
| `GET` | `/api/catalogos/colaboradores` | autenticado | Lista colaboradores. |
| `GET` | `/api/integraciones/comisiones/detalle?fechaInicial&fechaFinal` | autenticado | Detalle POS desde INDICADORES. |
| `GET` | `/api/integraciones/comisiones/resumen?fechaInicial&fechaFinal` | autenticado | Resumen POS desde INDICADORES. |
| `GET` | `/api/integraciones/midasoft/empleados` | autenticado | Empleados desde Midasoft. |

### 8.3 Códigos de error habituales

| Código | Causa | Acción del cliente |
| --- | --- | --- |
| 400 | Validación de DTO fallida | Mostrar mensaje; revisar formulario. |
| 401 | Token ausente o expirado | Redirigir a `/login`. |
| 403 | Rol insuficiente | Mostrar mensaje. |
| 404 | Recurso no existe | Mostrar mensaje. |
| 409 | Lock activo sobre el período | Esperar y reintentar. |
| 503 | INDICADORES / Midasoft caído | Mostrar mensaje de indisponibilidad. |

---

## 9. Seguridad

### 9.1 Autenticación JWT

- **Algoritmo:** HS256 (default de `@nestjs/jwt`).
- **Almacenamiento del secreto:** variable de entorno `JWT_SECRET` (obligatoria; la app no arranca sin ella).
- **Expiración:** configurable vía `JWT_EXPIRES_IN` (default `1h`).
- **Cifrado de contraseñas:** bcryptjs con salt de 10 rondas.

### 9.2 Autorización por roles

- Guard global `RolesGuard` (registrado en `AppModule.providers`).
- Decorador `@Roles('ADMINISTRADOR', 'PROFESIONAL_COMISIONES')` aplicado a endpoints sensibles.
- Si el endpoint no declara `@Roles`, cualquier usuario autenticado accede.
- `@Public()` exime de JWT (usado solo en `/api/auth/login`).

### 9.3 Manejo de secretos

- Las credenciales reales de `INDICADORES` y Midasoft viven solo en `.env`.
- `.env` está excluido del repositorio vía `.gitignore`.
- `.env.example` mantiene la forma y los valores placeholder.
- Ningún secreto se loguea: el `fetchSeguro` de Midasoft sanitiza los mensajes de error.

### 9.4 Recomendaciones de seguridad adicionales

- Forzar HTTPS en producción.
- Rotar `JWT_SECRET` por ambiente.
- Implementar rate limiting en `/api/auth/login`.
- Implementar `helmet` y CSP en el backend.
- Configurar `CORS_ORIGINS` con lista blanca explícita (ya configurable vía `.env`).
- Auditar los seeds de `UsersMockRepository`: en producción deben venir de BD, no del repositorio en memoria.

---

## 10. Pruebas y aseguramiento de calidad

### 10.1 Estrategia

| Tipo | Estado | Herramienta |
| --- | --- | --- |
| Unitarias (servicios puros) | ✅ Implementadas | Jest 29.7 |
| Integración con TypeORM | ❌ Pendiente | Jest + SQLite in-memory |
| E2E backend | ❌ Pendiente | Supertest + Jest |
| Frontend unit | ❌ Pendiente | Vitest (no instalado) |
| Frontend E2E | ❌ Pendiente | Playwright/Cypress (no instalado) |
| Mutación | ❌ Pendiente | — |
| Carga | ❌ Pendiente | k6 / Artillery |

### 10.2 Cobertura actual

```
PASS src/modules/liquidacion/services/afectaciones.service.spec.ts    (21.7 s)  — 8 tests
PASS src/modules/liquidacion/services/normalizacion.service.spec.ts   (23.9 s)  — 9 tests
PASS src/modules/liquidacion/services/subperiodo.service.spec.ts     (23.7 s)  — 4 tests
PASS src/modules/parametrizacion/parametrizacion.service.spec.ts     (23.7 s)  — 9 tests
Test Suites: 4 passed, 4 total
Tests:       31 passed, 31 total
```

| Spec | Cobertura funcional |
| --- | --- |
| `afectaciones.service.spec.ts` | Cálculo de días laborados/excluidos; excepciones de Luto/Día Familia; combinaciones; cumplimiento presupuesto/crecimiento. |
| `normalizacion.service.spec.ts` | `÷1.19`, agrupación, comisión bancaria al tipo mayor, prorrateo entre colaboradores, `calcularVentaNeta`. |
| `subperiodo.service.spec.ts` | INICIAL, fragmentación por cambio, múltiples cambios ordenados, cambios fuera de rango. |
| `parametrizacion.service.spec.ts` | Rangos abiertos, contiguos, huecos, solapamientos, hasta ≤ desde, regla cruzada Individual. |

### 10.3 Cómo ejecutar las pruebas

```bash
cd workspace/comisionesapp/backend
pnpm exec jest                   # Ejecuta todas las suites
pnpm exec jest --watch           # Modo watch
pnpm exec jest afectaciones      # Solo una suite
```

---

## 11. Operación y despliegue

### 11.1 Requisitos de entorno

| Componente | Versión |
| --- | --- |
| Node.js | 22 LTS |
| npm | incluido con Node |
| pnpm | 9+ (`npm i -g pnpm`) |
| SQL Server | 2022 (BD propia `comisiones`) |
| SQL Server INDICADORES | 10.1.5.61 (opcional en modo mock) |
| Acceso a Midasoft | opcional en modo mock |

### 11.2 Configuración inicial

```bash
# Backend
cd workspace/comisionesapp/backend
cp .env.example .env
# Editar .env: JWT_SECRET, DB_*, FUENTES_MODO (mock|real)
npm install
npm run seed             # opcional: carga datos de prueba
npm run start:dev        # arranca en http://localhost:3000

# Frontend (en otra terminal)
cd workspace/comisionesapp/frontend
pnpm install
pnpm dev                 # arranca en http://localhost:5173
```

### 11.3 Variables de entorno clave

| Variable | Descripción | Default |
| --- | --- | --- |
| `NODE_ENV` | `development` \| `production` | `development` |
| `PORT` | Puerto del backend | `3000` |
| `FUENTES_MODO` | `mock` \| `real` | (sin default) |
| `CORS_ORIGINS` | Orígenes permitidos | `http://localhost:5173,http://localhost:5174` |
| `JWT_SECRET` | Secreto JWT (obligatorio) | — |
| `JWT_EXPIRES_IN` | Expiración del token | `1h` |
| `SEED_ADMIN_PASSWORD` | Password del admin seed | `Admin123!` |
| `SEED_COMISIONES_PASSWORD` | Password del profesional seed | `Comisiones123!` |
| `DB_*` | Conexión BD propia | ver `.env.example` |
| `INDICADORES_*` | Conexión a INDICADORES | ver `.env.example` |
| `MIDASOFT_*` | Credenciales Midasoft | ver `.env.example` |

### 11.4 Despliegue (referencia)

| Ambiente | Plataforma | Comando |
| --- | --- | --- |
| Local | Node directo | `npm run start:dev` |
| Producción Windows | IIS 10+ | Publicar `dist/` + `web.config` (pendiente crear) |
| Producción Linux | PM2 / systemd | `node --max-old-space-size=4096 dist/src/main` |
| Contenedor | Docker | Dockerfile (pendiente crear) |

### 11.5 Observabilidad

| Señal | Implementación actual | Mejora recomendada |
| --- | --- | --- |
| Logs aplicación | Nest `Logger` (texto plano) | Winston/Pino con JSON |
| Logs SQL | `logging: !isProd` en TypeORM | Filtrar queries con `>Xms` |
| Bitácora estructural | `log_cambios_estructurales` | — |
| Bitácora de liquidaciones | `liquidacion_log` | — |
| Bitácora de consultas | `auditoria_consulta` | — |
| Healthcheck | ❌ no existe | Crear `GET /api/health` (ping BD + opcional ICG/Midasoft) |
| Métricas Prometheus | ❌ no existe | `@willsoto/nestjs-prometheus` |

---

## 12. Mapa de completitud por dominio funcional

> El "esqueleto" del programa se evalúa por **dominio funcional** (no por requisito individual). Cada dominio tiene una cobertura estimada sumando lo implementado, lo parcial y lo pendiente.

### 12.1 Tabla resumen

| Dominio | Capacidades | ✅ | ⚠️ Parcial | ❌ | % cobertura |
| --- | --- | --- | --- | --- | --- |
| **Configuración temporal** | 9 | 9 | 0 | 0 | **100 %** |
| **Parametrización de cargos** | 10 | 9 | 1 | 0 | **90 %** |
| **Motor de liquidación automática** | 13 | 9 | 4 | 0 | **88 %** |
| **Consulta, trazabilidad y exportación** | 11 | 10 | 1 | 0 | **92 %** |
| **TOTAL** | **43** | **37** | **6** | **0** | **≈ 91 %** |

### 12.2 Detalle por dominio

#### 12.2.1 Configuración temporal — 100 %

| Capacidad | Estado | Componente |
| --- | --- | --- |
| Crear múltiples calendarios independientes | ✅ | `CalendariosService.createCalendario` |
| Generar de forma masiva los 12 períodos de un año | ✅ | `CalendariosService.generarAnioPeriodos` |
| Validar no solapamiento dentro del mismo calendario | ✅ | `validarSolapamiento` |
| Garantizar secuencia temporal (continuidad 21–20) | ✅ | `validarSecuencia` |
| Activar/Desactivar calendarios sin permitir eliminación con períodos | ✅ | `removeCalendario` valida `periodos.length === 0` |
| Editar estructuralmente los períodos con validación en tiempo real | ✅ | `updatePeriodo` con validación efectiva |
| Bloquear modificación/eliminación con liquidaciones asociadas | ✅ | `validarSinLiquidaciones` |
| Estado operativo no editable manualmente | ✅ | Solo el motor cambia `estado_operativo` |
| Registrar log de todo cambio estructural | ✅ | `LogEstructuralService` en cada mutación |

**Trabajo pendiente hacia la cobertura total:** ninguno funcional. Recomendación menor: añadir tests automatizados del módulo.

#### 12.2.2 Parametrización de cargos — 90 %

| Capacidad | Estado | Componente / Pendiente |
| --- | --- | --- |
| Solo cargos existentes en catálogo Midasoft | ✅ | `validarCargoOficial` |
| Definir tipo de liquidación y distribución | ✅ | Enum `TipoLiquidacion` + `TipoDistribucion` |
| Parametrizar % por tipo de venta + Estrategia | ✅ | `porcLinea/porcPromocion/porcEstrategia` + fórmula Estrategia |
| Activar validación por presupuesto con rangos y base | ✅ | `PresupuestoCargoPeriodo` + `PresupuestoRangoComision` |
| Activar validación por crecimiento con tablas | ✅ | `CrecimientoRango` |
| Afectación excluyente Horas **XOR** Novedades | ⚠️ | El enum existe y el catálogo sugiere una u otra, pero **no hay validación dura** que rechace parametrizaciones con `HorasLaboradas AND NovedadesDiarias` simultáneamente. |
| Parametrización por rangos de cumplimiento | ✅ | `validarContinuidadRangos` (9 tests) |
| Control de vigencia (fecha desde–hasta) | ✅ | Vigencias + `validarVigenciaNoSolapa` |
| Registrar usuario, fecha y motivo del cambio | ✅ | `usuarioCambio`, `motivo`, `LogEstructuralService` |
| Estado del esquema (Activo / Inactivo) | ✅ | `estadoActivo` + endpoint `desactivar` |

#### 12.2.3 Motor de liquidación automática — 88 %

| Capacidad | Estado | Componente / Pendiente |
| --- | --- | --- |
| Selección única de calendario + período (Abierto) | ✅ | UI + endpoint |
| Validación previa de elegibilidad | ✅ | `verificarElegibilidad` |
| Cambio automático Abierto → En curso al iniciar | ✅ | Cabecera `EN_CURSO` en `ejecutar` |
| Cambio automático a Liquidado y paso a Cerrado explícito | ✅ | `cerrar()` |
| Consumo automático de ventas y comisiones bancarias de ICG | ✅ | `IndicadoresService.comisionesDetalle/Resumen` |
| Consumo de empleados, marcaciones, novedades, cambios y traslados de Midasoft | ⚠️ | Empleados OK; `novedades()` y `marcaciones()` retornan `[]` en modo real (pendiente de endpoint Midasoft). |
| Normalización: IVA ÷ 1,19 + descuento com. bancaria al tipo mayor | ✅ | `NormalizacionService` (9 tests) |
| Soportar 3 tipos de liquidación × 2 distribuciones | ⚠️ | 3 reglas implementadas; **regla 4 (GlobalGrupo) reusa GlobalTienda** con TODO en `reglas-comision.service.ts:82`. No hay fragmentación por grupo de tiendas. |
| Regla de afectación por Horas (con tope) o Novedades (con excepciones) | ✅ | `AfectacionesService` (8 tests) |
| Fragmentar subperíodos por cambio de cargo o centro de costo | ✅ | `SubPeriodoService` (4 tests) |
| Persistencia transaccional con rollback total | ✅ | Transacción atómica |
| Bloqueo de ejecución concurrente del mismo período | ✅ | `LiquidacionLockService` con `sp_getapplock` |
| Recalcular permitido solo si estado ≠ Cerrado | ✅ | `cerrar()` valida estado; nueva ejecución crea nueva liquidación |
| Generar archivo plano de nómina con 37 columnas | ✅ | `ArchivoPlanoService` 37 columnas |

**Además, marcado en código (TODOs explícitos):**

- `liquidacion.service.ts:264-265` — `presupuestoPorTiendaOCargo` y `ventaAnteriorPorUnidad` van `null`. La validación por presupuesto/crecimiento existe en el dominio de parametrización pero el motor de liquidación no la consume todavía.

#### 12.2.4 Consulta, trazabilidad y exportación — 92 %

| Capacidad | Estado | Componente / Pendiente |
| --- | --- | --- |
| Consultar liquidaciones en estado Liquidado o Cerrado únicamente | ✅ | Filtro SQL `estado IN (LIQUIDADO, CERRADO)` |
| Aplicar filtros combinables | ✅ | `FiltrosTrazabilidadDto` + `EXISTS` |
| Drill-down jerárquico: resumen → detalle por colaborador → base de cálculo | ✅ | `drillDown` |
| Visualización obligatoria del nivel más detallado | ✅ | `DetalleTrazabilidad` con todos los campos |
| Mostrar horas válidas consolidadas y tope | ✅ | `horasValidas` |
| Mostrar días excluidos y tipo de novedad | ✅ | `motivoExclusion` |
| Visualizar % Línea base, % descuento y % Línea Estrategia | ✅ | Snapshot `parametrizacionJson` |
| Mantener histórico inmutable (versión de parametrización al cálculo) | ✅ | Snapshot persiste al liquidar |
| No recalcular en tiempo de consulta | ✅ | Sin acceso a `ReglasComisionService` |
| Registrar log de auditoría (usuario, fecha, hora, acción, filtros) | ✅ | `auditoria_consulta` |
| Permitir exportación a Excel (CSV en este caso) | ✅ | Exporta CSV (no Excel nativo) |
| — | ⚠️ | Búsqueda de `tipoLiquidacion/tipoDistribucion` con `LIKE` sobre JSON es frágil; debería ser columna calculada indexada. |

### 12.3 Verificación de compilación y tests

| Comando | Resultado |
| --- | --- |
| `pnpm exec tsc --noEmit` (backend) | 0 errores |
| `pnpm exec vue-tsc --noEmit` (frontend) | 0 errores |
| `pnpm exec nest build` | OK |
| `pnpm run build` (frontend) | OK · 108 módulos · 3.72 s |
| `pnpm exec jest` | 4 suites · 31 tests PASS · 27.3 s |

---

## 13. Trabajo pendiente hacia la cobertura total

### 13.1 Trabajo sobre capacidades del programa

| # | Tarea | Dominio | Esfuerzo | Prioridad |
| --- | --- | --- | --- | --- |
| T-01 | Enforzar validación dura XOR en `ParametrizacionService.create/update` (rechazar parametrización con HorasLaboradas y NovedadesDiarias simultáneamente). | Parametrización | 1 h | Alta |
| T-02 | Implementar regla 4 (GlobalGrupoTiendas) en `ReglasComisionService`: agrupar por `id_grupo_tiendas` en lugar de por tienda. | Motor de liquidación | 4 h | Alta |
| T-03 | Conectar Fase 6.4: pasar `presupuestoPorTiendaOCargo` y `ventaAnteriorPorUnidad` desde `LiquidacionService` a `ReglasComisionService` (consultar `PresupuestoCargoPeriodo` y comparar contra período anterior del mismo calendario). | Motor de liquidación | 8-12 h | Alta |
| T-04 | Implementar la búsqueda de `tipoLiquidacion/tipoDistribucion` mediante columna calculada indexada en SQL Server (o columna desnormalizada en `liquidacion`). | Consulta / trazabilidad | 2 h | Media |
| T-05 | Conectar endpoints reales de Midasoft para novedades y marcaciones cuando estén disponibles. | Motor de liquidación | bloqueado por Midasoft | Media |
| T-06 | Implementar el cálculo de Línea Estrategia con descuento REAL (variable por venta) en `ReglasComisionService`. | Parametrización / Motor | 6 h | Media |
| T-07 | Crear endpoint `GET /api/health` que valide BD propia + estado de integraciones. | Atributos de calidad | 1 h | Alta |
| T-08 | Crear `GET /api/dashboard/resumen` con stats agregadas (evita N+1 del frontend). | Atributos de calidad | 2 h | Media |
| T-09 | Reemplazar `synchronize: true` por migrations de TypeORM versionadas. | Atributos de calidad | 4 h | Alta |
| T-10 | Crear `Dockerfile` y `docker-compose.yml` para backend + frontend + SQL Server. | Despliegue | 4 h | Media |

### 13.2 Trabajo sobre calidad y DX

| # | Tarea | Esfuerzo | Prioridad |
| --- | --- | --- | --- |
| T-11 | Configurar ESLint + Prettier (`.eslintrc`, `.prettierrc`) y arreglar los warnings actuales. | 1 h | Media |
| T-12 | Añadir tests de integración con `better-sqlite3` o `sql.js` para `LiquidacionService.ejecutar()`. | 6 h | Alta |
| T-13 | Añadir tests unitarios para `CalendariosService` (validaciones de no solapamiento y secuencia). | 2 h | Alta |
| T-14 | Añadir tests E2E con Supertest para el flujo completo del motor de liquidación. | 8 h | Media |
| T-15 | Instalar Vitest y añadir tests unitarios para stores y vistas Vue. | 6 h | Media |
| T-16 | Configurar Husky + lint-staged para pre-commit. | 1 h | Baja |
| T-17 | Documentar cada capacidad con OpenAPI 3 (más allá del Swagger actual). | 2 h | Baja |

### 13.3 Trabajo sobre seguridad y operación

| # | Tarea | Esfuerzo | Prioridad |
| --- | --- | --- | --- |
| T-18 | Implementar rate limiting en `/api/auth/login` (e.g. `@nestjs/throttler`). | 1 h | Alta |
| T-19 | Configurar `helmet` con CSP estricta. | 1 h | Alta |
| T-20 | Reemplazar `UsersMockRepository` por `TypeOrmUsersRepository` cuando la BD esté en producción. | 4 h | Alta |
| T-21 | Configurar logging JSON estructurado (Winston + formato GCP/Azure). | 2 h | Media |
| T-22 | Añadir correlation-id en cada request y propagación a logs y SQL. | 4 h | Media |
| T-23 | Crear script de smoke-test post-despliegue (curl a `/api/health`, login, listar calendarios). | 2 h | Media |

### 13.4 Trabajo sobre producto / UX

| # | Tarea | Esfuerzo | Prioridad |
| --- | --- | --- | --- |
| T-24 | Vista de "Ejecución de liquidación" con stepper vertical mostrando los pasos en tiempo real (hoy solo muestra el resultado final). | 8 h | Media |
| T-25 | Soporte de paginación en `GET /api/trazabilidad/resumen` y `GET /api/liquidacion`. | 4 h | Media |
| T-26 | Gráfico de comisiones por período en el dashboard (Chart.js / ECharts). | 4 h | Baja |
| T-27 | Modo "suscripción" en la UI: recibir aviso cuando un período quede en `LIQUIDADO` o `CERRADO`. | 6 h | Baja |
| T-28 | Exportar trazabilidad a Excel nativo (xlsx) en lugar de CSV. | 4 h | Baja |

### 13.5 Roadmap sugerido

| Hito | Alcance | Tareas |
| --- | --- | --- |
| **Hito 1 — Cierre funcional del 100 %** | Cubre todas las capacidades pendientes | T-01, T-02, T-04, T-06 |
| **Hito 2 — Cierre de producción** | Listo para IIS / contenedor | T-07, T-09, T-10, T-18, T-19, T-20, T-23 |
| **Hito 3 — Calidad y DX** | CI/CD robusto, tests ampliados | T-11, T-12, T-13, T-14, T-15, T-16, T-21, T-22 |
| **Hito 4 — Mejoras de producto** | UX, métricas, observabilidad | T-08, T-24, T-25, T-26, T-27, T-28 |
| **Hito 5 — Conexión a fuentes reales** | Midasoft novedades/marcaciones; ICG completo | T-05 (bloqueado por Midasoft) |

---

## 14. Glosario

| Término | Definición |
| --- | --- |
| **BD** | Base de datos. |
| **ICG** | Sistema de información comercial de Permoda del que se obtienen ventas POS vía stored procedures. |
| **INDICADORES** | BD SQL Server (`10.1.5.61`) con los SP de ICG. Solo lectura. |
| **Midasoft** | Sistema de RRHH que provee empleados, novedades, marcaciones y cambios de cargo. |
| **Liquidación** | Proceso de cálculo de comisiones para un período. |
| **Período** | Mes de un calendario. Patrón 21–20 (ej. 21/Jun → 20/Jul). |
| **Calendario** | Conjunto de 12 períodos de un año, sin solapamiento interno. |
| **Subperíodo** | Fragmento de un período generado por un cambio de cargo o CC. |
| **Parametrización** | Configuración estructural de comisiones por cargo × período. |
| **Rangos de cumplimiento** | Tabla que define % de comisión según % de cumplimiento de presupuesto. |
| **Afectación** | Mecanismo de descuento de días no laborados: HorasLaboradas o NovedadesDiarias. |
| **Línea Estrategia** | Tipo de venta al que se le descuenta un porcentaje (corporativo o real). |
| **Archivo plano de nómina** | TXT con 37 columnas y separador `;` consumido por el sistema de nómina. |
| **Lock pesimista** | `sp_getapplock` de SQL Server que garantiza exclusión mutua a nivel de BD. |
| **Mock** | Implementación de prueba que reemplaza a la integración real. |
| **Midasoft (token)** | JWT devuelto por `POST /SEG`; cacheado 10 min. |
| **Snapshot inmutable** | Copia de la parametrización al momento de liquidar, persistida en JSON. |
| **BFF** | Backend-For-Frontend. Patrón de API dedicada al cliente. |
| **Frontend** | Capa de presentación (Vue 3 + Vite). |
| **Backend** | Capa de lógica de negocio (NestJS sobre Node 22). |
| **Endpoint** | Punto de acceso HTTP (URL + método). |
| **Vista** | Componente Vue que renderiza una pantalla. |
| **Store** | Estado global gestionado con Pinia. |
| **Guard** | Middleware que protege rutas o endpoints según reglas. |
| **DI / Token DI** | Inyección de dependencias; un `InjectionToken` permite reemplazar implementaciones. |
| **Composición** | Estructura interna de un módulo / servicio / componente. |
| **Esqueleto** | Mapa de la estructura del programa (módulos, capas, entidades, servicios, vistas). |

---

## 15. Anexos

### 15.1 Catálogo completo de cargos Midasoft (11)

Ver §3.2. Catálogo hardcodeado en `src/modules/parametrizacion/services/cargos-catalogo.service.ts`.

### 15.2 Tabla de rangos Staff Comercial (referencia)

| Rango de cumplimiento (% de presupuesto) | % Línea | % Promoción |
| --- | --- | --- |
| 79,99 % | 0,19 | 0,13 |
| 80 – 89,99 % | 0,29 | 0,20 |
| 90 – 94,99 % | 0,48 | 0,34 |
| 95 – 99,99 % | 0,60 | 0,42 |
| 100 % (o más) | 0,72 | 0,50 |

### 15.3 Formato del archivo plano de nómina (37 columnas)

```
EMPLEADO;CONCEPTO;HORAS;VALOR;CANTIDAD;CCOSTO;N_PRESTAMO;LABOR;SUERTE;
EQUIPO;F_P_LIQ;F_NOVEDAD;IDENTIFICADOR;TP_CONTR;CDG_CCF;SALMES;
CONVENIO;CPTCONVENIO;CNSEMPZ;OFICIO;DPTO;AREA;GRUPO;SUBGRUPO;UBICACION;
NIVEL;SECCION;PROYECTO;DIVISION;SUBDIVISION;CLASE_EMP;REL_LABORAL;
REL_SINDICAL;PRODUCTO;SUC_CIA;HORA
```

Convenciones:

- Separador: `;`
- Codificación: UTF-8
- `EMPLEADO` = código Midasoft (no cédula)
- `CONCEPTO` = `A201` (default)
- `VALOR` = comisión consolidada del colaborador, redondeada al entero
- Una fila por colaborador (consolidada sobre todos los tipos de venta y subperíodos)

### 15.4 Variables de entorno (referencia completa)

Ver §11.3.

### 15.5 Procedimiento para correr la suite de tests

```bash
cd workspace/comisionesapp/backend
pnpm install                    # primera vez
pnpm exec jest                  # corre los 31 tests en ~27 s
pnpm exec jest --coverage       # con reporte de cobertura
```

### 15.6 Procedimiento para inspección manual con mock

1. Iniciar backend con `FUENTES_MODO=mock` en `.env`.
2. Cargar datos mock desde `Datatest/`.
3. `POST /api/auth/login` con `admin@permoda.com` / `Admin123!`.
4. `GET /api/integraciones/comisiones/detalle?fechaInicial=2026-06-21&fechaFinal=2026-07-20` para verificar la generación mock de ventas.
5. `GET /api/integraciones/midasoft/empleados` para verificar empleados.
6. `POST /api/calendarios` para crear un calendario.
7. `POST /api/calendarios/:id/periodos/generar-anio` para generar los 12 períodos.
8. `POST /api/parametrizacion` con `codigoOficio=104608` para crear la parametrización del Vendedor.
9. Cerrar el período anterior (cambiar manualmente `estado_operativo` o ejecutar una liquidación dummy).
10. `POST /api/liquidacion/ejecutar` con el id del nuevo período.
11. `GET /api/liquidacion/:id/archivo` para descargar el archivo plano.

### 15.7 Diagrama de secuencia — Ejecución de liquidación

```
 Usuario           Frontend          Backend (Liquidacion)         BD SQL Server         ICG/Midasoft
   │                  │                      │                          │                      │
   │  Click "Ejecutar"│                      │                          │                      │
   ├─────────────────►│                      │                          │                      │
   │                  │  POST /ejecutar      │                          │                      │
   │                  ├─────────────────────►│                          │                      │
   │                  │                      │ verificarElegibilidad()   │                      │
   │                  │                      ├─────────────────────────►│                      │
   │                  │                      │ ◄─── período válido       │                      │
   │                  │                      │ sp_getapplock (5s)        │                      │
   │                  │                      ├─────────────────────────►│                      │
   │                  │                      │ ◄─── lock OK              │                      │
   │                  │                      │ BEGIN TRANSACTION         │                      │
   │                  │                      ├─────────────────────────►│                      │
   │                  │                      │ INSERT liquidacion (EN_CURSO)                    │
   │                  │                      ├─────────────────────────►│                      │
   │                  │                      │                          │  EXEC SP_GetPOSDetail│
   │                  │                      ├──────────────────────────┼─────────────────────►│
   │                  │                      │                          │  EXEC SP_GetPOSSummary
   │                  │                      ├──────────────────────────┼─────────────────────►│
   │                  │                      │ ◄─── ventas + comisionBancaria                  │
   │                  │                      │ Normalizar (÷1.19)       │                      │
   │                  │                      │                          │  GET /EmpleadosPermoda
   │                  │                      ├──────────────────────────┼─────────────────────►│
   │                  │                      │ ◄─── empleados            │                      │
   │                  │                      │ Generar subperíodos      │                      │
   │                  │                      │                          │  SELECT cambios_cargo│
   │                  │                      ├──────────────────────────►                      │
   │                  │                      │ Aplicar reglas 1-3       │                      │
   │                  │                      │                          │                      │
   │                  │                      │ INSERT subperíodos       │                      │
   │                  │                      ├─────────────────────────►│                      │
   │                  │                      │ INSERT detalles          │                      │
   │                  │                      ├─────────────────────────►│                      │
   │                  │                      │ UPDATE liquidacion (LIQUIDADO)                   │
   │                  │                      ├─────────────────────────►│                      │
   │                  │                      │ UPDATE periodo (Liquidado)                       │
   │                  │                      ├─────────────────────────►│                      │
   │                  │                      │ COMMIT                   │                      │
   │                  │                      ├─────────────────────────►│                      │
   │                  │                      │ sp_releaseapplock        │                      │
   │                  │                      ├─────────────────────────►│                      │
   │                  │                      │ Generar archivo plano    │                      │
   │                  │ ◄─── 200 OK + liq   │  writeFile(workspace/.../liquidaciones/<id>.txt) │
   │                  │                      │                          │                      │
   │  Toast "Éxito"   │                      │                          │                      │
   │ ◄────────────────┤                      │                          │                      │
```

---

## Control de cambios del documento

| Versión | Fecha | Cambios |
| --- | --- | --- |
| 1.0 | 10/07/2026 | Creación inicial. Trazabilidad de capacidades estructurada por origen funcional. |
| 2.0 | 10/07/2026 | Reestructuración: el documento se enfoca en la **creación y composición estructural del programa** como mapa/esqueleto. Las capacidades se agrupan por dominio funcional y la cobertura se evalúa por dominio. |

---

**Fin del documento.**
