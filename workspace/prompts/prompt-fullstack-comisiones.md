# PROMPT — Sistema de Liquidación de Comisiones (Permoda Ltda.)

> Copia y pega este prompt completo en el chat de tu modelo de IA para que asuma el rol de **Fullstack Lead** y construya el sistema desde cero.

---

## ROL

Actúa como **Ingeniero Fullstack Lead** con experiencia comprobada en:
- **Backend:** NestJS o Node.js con JavaScript puro (no TypeScript).
- **Frontend:** Vue 3 o React (a tu criterio, justifica la elección).
- **Bases de datos:** PostgreSQL o MySQL, modelado relacional, migraciones.
- **Integraciones:** consumo de APIs externas, ETL desde archivos Excel/CSV, colas con Redis/Bull.
- **Dominio:** nóminas, compensaciones, liquidación de comisiones, reglas de negocio financieras.
- **Calidad:** testing unitario e integración, manejo transaccional, integridad de datos, auditoría.

Entrega código de producción: limpio, modular, documentado en español, con manejo de errores robusto y validaciones en cada capa.

---

## PROYECTO

Construir un sistema ETL/web de **liquidación y cálculo automático de comisiones** para **Permoda Ltda.**, dividido en 4 capas secuenciales.

### Capa 1 — Configuración anual de calendarios y períodos (HU 1)
- Crear múltiples calendarios independientes (ej. "Comisiones 2026", "Cumplimiento de Meta 2026").
- Generar de forma masiva los 12 períodos del año por calendario.
- Validar que NO haya solapamiento dentro del mismo calendario.
- Garantizar secuencialidad lógica de fechas (sin huecos, sin fechas invertidas).
- El estado del período (`Abierto` / `EnCurso` / `Liquidado` / `Cerrado`) **NO es editable manualmente**; se gestiona automáticamente.

### Capa 2 — Parametrización de cargos y reglas de comisión (HU 2)
- Catálogo de cargos desde Midasoft (códigos como `104518` = Staff Comercial TC, `102571` = Gestor Comercial, etc.).
- Para cada cargo configurar:
  - **Tipo de liquidación:** Individual | Global por Tienda | Global por Grupo de Tiendas.
  - **Tipo de distribución:** Individual | Proporcional por horas | Global (partes iguales).
  - **Porcentajes** por tipo de venta: Línea, Promoción, Línea Estrategia.
  - **Validaciones:** presupuesto (rango de cumplimiento), crecimiento (rango de crecimiento).
  - **Afectación:** Horas laboradas **O** Novedades diarias (mutuamente excluyentes).
  - **Vigencia** desde/hasta, motivo de cambio, versionamiento.
- Reglas: no activar ambos `afectacion_horas` y `afectacion_novedades`; no dejar configuración incompleta.

### Capa 3 — Motor de liquidación automática (HU 3)
- Usuario selecciona: **calendario + período** (estado Abierto) → ejecuta el proceso.
- El sistema consume automáticamente desde ICG y Midasoft:
  - **Ventas** del período (ICG) por tienda, por vendedor, por tipo de venta.
  - **Comisiones bancarias** (ICG) por tienda.
  - **Empleados activos** en el período (Midasoft).
  - **Marcaciones / horas laboradas** (Midasoft).
  - **Novedades** (vacaciones, incapacidades, ausentismos) (Midasoft).
  - **Cambios de cargo / centro de costo** durante el período (Midasoft).
- **Normalización financiera** (orden obligatorio):
  1. Quitar IVA a cada transacción: `venta_sin_iva = importe / 1.19`.
  2. Consolidar por tipo de venta: Línea, Línea Estrategia, Promoción.
  3. Identificar el tipo de venta con mayor valor acumulado sin IVA.
  4. Descontar sobre ese tipo el valor total de comisiones bancarias reportadas por ICG.
  5. Resultado: venta neta por tipo = tipo mayor ya con descuento; los demás tipos sin descuento.
- **Aplicar parametrización vigente** del cargo al momento del período.
- **Aplicar porcentajes** por tipo de venta según tabla de cumplimiento (si validar_presupuesto) o de crecimiento (si validar_crecimiento).
- **Línea Estrategia:** `% estrategia = % línea base − % descuento real equivalente` (descuento real o corporativo).
- **Distribución** según tipo_liquidacion + tipo_distribucion del cargo:
  - **Individual – Individual:** comisión sobre venta individual del colaborador.
  - **Global Tienda – Individual:** comisión total de la tienda × %; se reparte por días trabajados (excluyendo novedades, excepto luto/familia/compensatorio legal).
  - **Global Tienda – Proporcional:** comisión total de la tienda × %; se reparte por horas válidas vs. tope contractual (con prorrateo para ingresos y retiros en el período).
  - **Global Grupo – Global:** comisión del grupo × %; se reparte en partes iguales ajustadas por días efectivamente laborados.
  - **Global Grupo – Individual:** comisión del grupo × %; se asigna por colaborador activo con exclusión por novedades.
- **Fragmentar** por cambios de cargo o centro de costo: genera subperíodos internos con cálculo independiente.
- **Estados automáticos:** Abierto → EnCurso (al iniciar) → Liquidado (éxito) → Cerrado (confirmación explícita del usuario).
- **Generar archivo plano** de nómina compatible con Midasoft, columnas mínimas: `EMPLEADO, CONCEPTO, HORAS, VALOR` + extendidas (`CANTIDAD, CCOSTO, N_PRESTAMO, LABOR, SUERTE, EQUIPO, F_P_LIQ, F_NOVEDAD, IDENTIFICADOR, TP_CONTR, CDG_CCF, SALMES, CONVENIO, CPTCONVENIO, CNSEMPZ, OFICIO, DPTO, AREA, GRUPO, SUBGRUPO, UBICACION, NIVEL, SECCION, PROYECTO, DIVISION, SUBDIVISION, CLASE_EMP, REL_LABORAL, REL_SINDICAL, PRODUCTO, SUC_CIA, HORA`).
- **Integridad:** en caso de error, rollback total. No se permiten resultados parciales. Reintentable.

### Capa 4 — Trazabilidad, consulta y salida (HU 4)
- Consultar liquidaciones por filtros combinables: calendario, año, período, colaborador, cargo, tienda, grupo, zona, tipo de liquidación, tipo de distribución, rango de comisión, estado.
- Drill-down desde el resumen del período hasta el detalle por colaborador.
- Visualizar: venta bruta, sin IVA, comisión bancaria, venta neta, % aplicado, afectaciones, horas válidas, tope, % participación, días excluidos por novedad, comisión final.
- Consulta histórica inmutable (no se recalcula, no se modifica).
- Log de auditoría: usuario, fecha, hora, acción, filtros aplicados, exportación.
- Exportar a Excel.

---

## STACK TECNOLÓGICO (estricto)

| Capa | Tecnología | Notas |
|---|---|---|
| Backend | **NestJS o Node.js** | Recomendado NestJS por la estructura modular del dominio. |
| Lenguaje | **JavaScript puro (ES2022+)** | No TypeScript. |
| ORM | Sequelize, TypeORM o Prisma en modo JS | A tu criterio. |
| BD | **PostgreSQL** o MySQL | Transacciones ACID obligatorias. |
| Cola | **Bull + Redis** | La liquidación corre como job asíncrono. |
| Frontend | **Vue 3 (Composition API) o React** | SPA con router y store global. |
| Estilos | TailwindCSS o CSS Modules | A tu criterio. |
| Auth | JWT + RBAC | Roles: Admin, Compensaciones, Auditoría, Consulta. |
| Testing | Jest (unit) + Supertest (API) | Cobertura mínima 70% en motor. |
| Docs API | Swagger/OpenAPI | Generado automáticamente. |

---

## MODELO DE DATOS (entidades principales)

```
calendario (id, nombre, anio, estado_activo, created_at, updated_at)
periodo (id, id_calendario, codigo, fecha_inicio, fecha_fin, estado_operativo)
cargo (id, codigo_midasoft, nombre, activo)
esquema_comision (id, id_cargo, tipo_liquidacion, tipo_distribucion,
                   validar_presupuesto, validar_crecimiento,
                   afectacion_horas, afectacion_novedades,
                   fecha_vigencia_desde, fecha_vigencia_hasta, motivo_cambio,
                   version, activo)
porcentaje_comision (id, id_esquema, tipo_venta, rango_cumplimiento_desde,
                     rango_cumplimiento_hasta, porcentaje)
tabla_crecimiento (id, id_esquema, rango_desde, rango_hasta, porcentaje, orden)
colaborador (id, documento, nombre_completo, cargo_codigo, cargo_nombre,
             ccoso_codigo, ccoso_nombre, fecha_ingreso, fecha_retiro,
             estado, jornada, salario, fecha_modif, usuario_midasoft)
tienda (co, nombre, tipo_tienda, id_grupo_tiendas)
grupo_tiendas (id, nombre)
presupuesto_periodo (id, id_periodo, id_tienda, id_grupo, monto)
ejecucion_liquidacion (id, id_periodo, usuario, fecha_inicio, fecha_fin,
                        estado, log_proceso, error_detalle)
resultado_liquidacion (id, id_ejecucion, id_colaborador, id_cargo,
                       id_tienda, id_grupo_tiendas, id_esquema_version,
                       tipo_liquidacion, tipo_distribucion, comision_total,
                       venta_bruta, venta_sin_iva, comision_bancaria,
                       venta_neta, porcentaje_aplicado, horas_validas,
                       tope_horas, porcentaje_participacion,
                       dias_excluidos_novedad, fecha_calculo)
resultado_detalle (id, id_resultado, tipo_venta, venta_bruta, venta_sin_iva,
                   comision_bancaria, venta_neta, porcentaje, comision_calculada)
subperiodo_cambio (id, id_resultado, fecha_inicio_tramo, fecha_fin_tramo,
                   id_cargo_tramo, id_centro_costo_tramo, comision_tramo)
insumo_utilizado (id, id_ejecucion, tipo_insumo, snapshot_json, fecha_corte)
archivo_nomina (id, id_ejecucion, nombre_archivo, ruta, total_registros,
                total_valor, fecha_generacion)
log_auditoria (id, usuario, modulo, accion, entidad, id_entidad, fecha_hora,
               ip, detalle_json)
```

---

## API REST (endpoints principales)

```
# Capa 1
GET|POST|PATCH   /api/calendarios
POST             /api/calendarios/:id/periodos/generar-masivo
GET              /api/calendarios/:id/periodos
GET              /api/periodos/:id

# Capa 2
GET              /api/cargos
GET|POST|PATCH   /api/esquemas-comision
GET              /api/esquemas-comision/vigente?cargo=&fecha=
GET|POST         /api/tablas-crecimiento
GET|POST         /api/presupuestos

# Capa 3
POST             /api/liquidaciones/ejecutar
GET              /api/liquidaciones/:id/estado
GET              /api/liquidaciones/:id/resultados
POST             /api/liquidaciones/:id/cancelar
POST             /api/periodos/:id/cerrar
GET              /api/periodos/:id/archivo-nomina
GET              /api/periodos/:id/insumos

# Capa 4
GET              /api/trazabilidad/liquidaciones
GET              /api/trazabilidad/resultados/:id
GET              /api/trazabilidad/resultados/:id/detalle
GET              /api/trazabilidad/log-auditoria
GET              /api/trazabilidad/exportar

# Cross-cutting
POST             /api/auth/login
GET              /api/usuarios
```

---

## DATOS DE PRUEBA (semillas que debes incluir)

El sistema debe incluir un seeder que cargue datos de prueba para validación:

1. **Midasoft (empleados):** 6,371 empleados activos con sus oficios, centros de costo, cargos (`104518 STAFF COMERCIAL TC`, `104517 STAFF COMERCIAL 36H`, `102058 ADMINISTRADOR DE TIENDA`, `102110 COADMINISTRADOR`, `104222 CAJERO TC`, `104223 CAJERO 36H`, `104275 ASESOR 48H`, `104341 ASESOR 36H`, `104608 VENDEDOR`, `102502 PARTNER`, `102571 GESTOR`).
2. **ICG (ventas):** 33,919 transacciones del 2026-02-01 distribuidas en 69 tiendas con tipos `LINEA`, `LINEA ESTRATEGIA`, `PROMOCION`.
3. **Comisiones bancarias:** archivo de prueba por tienda.
4. **Novedades:** archivo de prueba con vacaciones, incapacidades.
5. **Marcaciones:** archivo de prueba con horas laboradas por día.
6. **Cambios de cargo/ccoso:** archivo de prueba con al menos 3 casos dentro del período.
7. **Presupuestos:** montos por tienda para validar rangos de cumplimiento.
8. **Calendario:** 1 calendario "Comisiones 2026" con 12 períodos (Feb2026 = Abierto, Ene2026 = Cerrado).

---

## FASES DE DESARROLLO (orden obligatorio)

| Fase | Alcance | Entregable |
|---|---|---|
| **F0** | Setup proyecto, estructura módulos, auth, RBAC, swagger, docker-compose | App arranca, login funciona |
| **F1** | Capa 1: CRUD calendarios + generación masiva períodos + validaciones solapamiento + estados automáticos | UI funcional, bloqueos correctos |
| **F2** | Capa 2: CRUD parametrización, versionamiento, vigencias, validaciones de configuración | UI funcional, % configurados |
| **F3** | Integraciones: adapter ICG, adapter Midasoft, normalización de datos, snapshot inmutable | Carga de prueba exitosa |
| **F4** | Capa 3: motor de cálculo, normalización financiera, distribución, archivo plano, jobs, estados | Liquidación de Feb 2026 ejecutada correctamente |
| **F5** | Capa 4: consulta con filtros, drill-down, exportación, log de auditoría | Consulta histórica funcional |
| **F6** | Pruebas E2E de los 6 escenarios de la HU 3 y los 8 de la HU 4 + hardening | Cobertura > 70% |
| **F7** | Despliegue: CI/CD, observabilidad, documentación final | Sistema en producción |

---

## ESTÁNDARES DE CALIDAD

1. **Código:** nombres en español para entidades de negocio (`esquemaComision`), inglés para variables técnicas (`createdAt`). Comentarios en español.
2. **Validaciones:** en backend (con class-validator/Zod/Joi) y frontend (formularios). Doble validación.
3. **Errores:** el sistema NUNCA debe fallar silenciosamente. Cada error → log + respuesta clara al usuario.
4. **Transacciones:** la liquidación DEBE ser atómica. Usar `BEGIN/COMMIT/ROLLBACK`.
5. **Inmutabilidad:** una vez `Liquidado` o `Cerrado`, los registros NO se modifican. Solo lectura.
6. **Auditoría:** TODA acción de escritura queda registrada en `log_auditoria` con usuario, fecha, ip y snapshot del cambio.
7. **Versionamiento:** la parametrización vigente al momento del cálculo se congela y se referencia en el resultado (`id_esquema_version`).
8. **Rendimiento:** la liquidación de 6,371 empleados debe completarse en menos de 5 minutos. Usar jobs en background.
9. **Seguridad:** contraseñas hasheadas (bcrypt), JWT con expiración, CORS configurado, rate-limiting en login.
10. **Testing:** mínimo 70% de cobertura en el módulo `liquidacion/motor`. Tests unitarios por cada regla de distribución.

---

## ENTREGABLES POR FASE

Para cada fase, entrega:
- Código fuente en estructura de carpetas clara.
- Migraciones de base de datos versionadas.
- Endpoints documentados en Swagger.
- Pruebas automatizadas (al menos 1 happy path + 1 caso de error por endpoint).
- Script de seed con datos de prueba.
- README breve con instrucciones de ejecución local.

---

## INSTRUCCIONES DE EJECUCIÓN

1. Empieza por la **Fase F0** (setup) y NO avances a la siguiente fase hasta que la anterior esté completa y validada.
2. Antes de codear cada componente, **di en una lista corta** qué vas a hacer y por qué. Espera la confirmación o ajusta.
3. Si encuentras ambigüedades en las HU, **documenta tu interpretación y propón la solución** antes de codear.
4. Al final de cada fase, entrega un resumen de: archivos creados, endpoints nuevos, decisiones tomadas, pendientes.
5. Mantén un **CHANGELOG.md** en la raíz del proyecto con el progreso por fase.

---

## EMPIEZA

Inicia con la **Fase F0** mostrando:
1. Estructura de carpetas propuesta (backend y frontend).
2. Dependencias a instalar.
3. Configuración de docker-compose (PostgreSQL + Redis).
4. Endpoint `/api/health` funcional.
5. Swagger accesible en `/api/docs`.

No escribas lógica de negocio hasta que F0 esté aprobada.
