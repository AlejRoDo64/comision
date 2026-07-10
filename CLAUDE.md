# Proyecto Comisiones — Permoda Ltda.

Sistema de automatización de liquidación de comisiones para áreas comerciales.
Reemplaza el proceso manual actual en Excel/Power Query.

## Stack oficial permitido (no usar otro)

| Capa | Tecnología |
|---|---|
| Frontend | Vue.js 3.4+ · Vite 5 · Pinia · TypeScript · Composition API · **Tailwind CSS** |
| Integración / BFF | Node.js 22 LTS · NestJS (este repo: `workspace/comisionesapp/backend`) |
| Backend Enterprise | .NET 10 / C# 14 (APIs REST críticas, despliegue IIS 10+) — aún no aplica en este repo |
| Backend IA/Data | Python 3.12+ · FastAPI — aún no aplica en este repo |
| Base de datos | SQL Server 2022 (BD propia de la app) |
| CI/CD | Azure DevOps · pipelines YAML · 3 ambientes |

## Estructura del repo

- `workspace/comisionesapp/backend` — NestJS (TypeORM, Swagger en `/api/docs`, JWT global guard)
- `workspace/comisionesapp/frontend` — Vue 3 + Vite + Pinia (`src/services/api.ts` centraliza axios)
- `HU/` — historias de usuario en .docx (extraer texto con `unzip -p archivo.docx word/document.xml`)
- `Datatest/` — Excel de referencia del cálculo actual (CalculoComisionesV02.xlsx)

## Historias de usuario (resumen)

- **HU-01 Calendarios y períodos**: múltiples calendarios independientes; períodos sin
  solapamiento dentro del mismo calendario; secuencia temporal (patrón 21–20); generación
  masiva anual; estado operativo (Abierto/En curso/Liquidado/Cerrado) NO editable manualmente;
  no editar/eliminar períodos con liquidaciones asociadas; log de cambios estructurales.
- **HU-02 Parametrización de cargos**: solo cargos existentes en Midasoft (catálogo de 11
  códigos de oficio, p.ej. 104608 Vendedor(a), 102058 Administrador(a) de tienda);
  tipo de liquidación (individual / global tienda / global grupo de tiendas) y distribución
  (individual / proporcional); % por tipo de venta (Línea, Promoción, Línea Estrategia);
  afectación excluyente: Horas laboradas XOR Novedades diarias; validaciones de presupuesto
  y crecimiento activables; control de vigencia (desde–hasta) + usuario/fecha/motivo del cambio.
- **HU-03 Liquidación automática**: usuario solo elige calendario + período y ejecuta;
  consume automáticamente ventas ICG, comisiones bancarias ICG, empleados/marcaciones/
  novedades/cambios de cargo/traslados desde Midasoft; subperíodos por cambio de cargo o
  centro de costo; descuenta IVA (÷1.19) y comisión bancaria; transaccional con rollback;
  requiere período anterior Cerrado; sin ejecución concurrente; genera archivo plano nómina.
- **HU-04 Trazabilidad y consulta**: solo lectura sobre períodos Liquidado/Cerrado;
  filtros combinables (calendario, período, colaborador, cargo, tienda, zona…); drill-down
  hasta detalle por colaborador (venta bruta, sin IVA, comisión bancaria, venta neta, %,
  afectaciones); versión de parametrización asociada al resultado; log de auditoría de consultas.

## Fuentes de datos externas (SOLO LECTURA — nunca escribir en ellas)

### SQL Server INDICADORES (ventas ICG)
- Servidor: `10.1.5.61` · BD: `INDICADORES` · usuario: `LecturaBd` (credenciales en `.env`, nunca en código)
- Stored procedures existentes (mismos que usa el Excel actual):
  - `EXEC dbo.SP_GetPOSCommissionsDetail  @FechaInicial, @FechaFinal` — detalle de comisiones POS
  - `EXEC dbo.SP_GetPOSCommissionsSummary @FechaInicial, @FechaFinal` — resumen de comisiones POS
- Acceder vía la conexión TypeORM nombrada `indicadores` (`synchronize: false`, sin entidades).

### API Midasoft (empleados / RRHH — ambiente pruebas)
- Base: `https://pruebaspermoda.midasoft.co/APIS/Midas_APIS/api`
- Login: `POST /SEG` con body `{ "companyId": "", "username": "", "password": "" }` → token
- Empleados: `GET /EMP/EmpleadosPermoda` (con token)
- Credenciales en `.env` (`MIDASOFT_*`), nunca en código ni commits.

## Convenciones

- Código, comentarios y UI en español; nombres de columnas BD en snake_case.
- DTOs con class-validator + decoradores Swagger; controllers con `@ApiTags`/`@ApiOperation`.
- El estado operativo de un período lo gobierna únicamente el motor de liquidación (HU-03).
- Todo endpoint queda tras el JwtAuthGuard global salvo `@Public()`.
- Nunca commitear `.env`; mantener `.env.example` actualizado.
