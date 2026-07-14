/* ============================================================
   LIMPIEZA TOTAL DE DATOS DE PRUEBA — BD comisiones (local)
   Borra TODOS los datos de negocio respetando el orden de las
   llaves foráneas. La estructura (tablas) se conserva.
   USO EXCLUSIVO EN LA BD DE PRUEBAS — irreversible.
   ============================================================ */
SET NOCOUNT ON;

BEGIN TRANSACTION;

BEGIN TRY
  /* Cada DELETE es condicional: la tabla puede no existir si synchronize
     aún no la ha creado en este ambiente. Orden: hijos antes que padres. */

  /* 1. Auditoría y logs (hijos de liquidación / independientes) */
  IF OBJECT_ID('dbo.auditoria_consulta')      IS NOT NULL DELETE FROM dbo.auditoria_consulta;
  IF OBJECT_ID('dbo.liquidacion_log')         IS NOT NULL DELETE FROM dbo.liquidacion_log;

  /* 2. Resultados de liquidación (detalle → subperíodos → cabecera) */
  IF OBJECT_ID('dbo.liquidacion_detalle')     IS NOT NULL DELETE FROM dbo.liquidacion_detalle;
  IF OBJECT_ID('dbo.liquidacion_subperiodo')  IS NOT NULL DELETE FROM dbo.liquidacion_subperiodo;
  IF OBJECT_ID('dbo.liquidacion')             IS NOT NULL DELETE FROM dbo.liquidacion;

  /* 3. Datos asociados a períodos */
  IF OBJECT_ID('dbo.cambio_cargo_periodo')       IS NOT NULL DELETE FROM dbo.cambio_cargo_periodo;
  IF OBJECT_ID('dbo.rango_comision')             IS NOT NULL DELETE FROM dbo.rango_comision;
  IF OBJECT_ID('dbo.parametrizacion_cargo')      IS NOT NULL DELETE FROM dbo.parametrizacion_cargo;
  IF OBJECT_ID('dbo.presupuesto_rango_comision') IS NOT NULL DELETE FROM dbo.presupuesto_rango_comision;
  IF OBJECT_ID('dbo.crecimiento_rango')          IS NOT NULL DELETE FROM dbo.crecimiento_rango;
  IF OBJECT_ID('dbo.presupuesto_cargo_periodo')  IS NOT NULL DELETE FROM dbo.presupuesto_cargo_periodo;

  /* 4. Calendarios y períodos */
  IF OBJECT_ID('dbo.periodo')    IS NOT NULL DELETE FROM dbo.periodo;
  IF OBJECT_ID('dbo.calendario') IS NOT NULL DELETE FROM dbo.calendario;

  /* 5. Bitácora estructural y catálogos locales */
  IF OBJECT_ID('dbo.log_cambios_estructurales') IS NOT NULL DELETE FROM dbo.log_cambios_estructurales;
  IF OBJECT_ID('dbo.colaborador')   IS NOT NULL DELETE FROM dbo.colaborador;
  IF OBJECT_ID('dbo.venta_icg')     IS NOT NULL DELETE FROM dbo.venta_icg;
  IF OBJECT_ID('dbo.tienda')        IS NOT NULL DELETE FROM dbo.tienda;
  IF OBJECT_ID('dbo.grupo_tiendas') IS NOT NULL DELETE FROM dbo.grupo_tiendas;

  COMMIT TRANSACTION;
  PRINT 'Limpieza completada: todas las tablas de datos quedaron vacías.';
END TRY
BEGIN CATCH
  ROLLBACK TRANSACTION;
  PRINT 'ERROR — no se borró nada (rollback): ' + ERROR_MESSAGE();
END CATCH;

/* Verificación: todas deben quedar en 0 */
SELECT t.name AS tabla, SUM(p.rows) AS filas
FROM sys.tables t
JOIN sys.partitions p ON p.object_id = t.object_id AND p.index_id IN (0, 1)
GROUP BY t.name
ORDER BY t.name;
