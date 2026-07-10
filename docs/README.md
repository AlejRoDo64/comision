# Índice de documentación del Proyecto Comisiones

Este directorio contiene la documentación del proyecto.

## Documentos disponibles

| Documento | Audiencia | Descripción |
| --- | --- | --- |
| [`DOCUMENTACION.md`](./DOCUMENTACION.md) | Desarrolladores, arquitectos, líderes técnicos | Documentación técnica: arquitectura, modelo de datos, API REST, seguridad, despliegue, completitud por HU y tareas pendientes hacia el 100 %. |
| [`MANUAL_USUARIO.md`](./MANUAL_USUARIO.md) | Profesionales de Comisiones y Administradores | Manual de usuario paso a paso: cómo usar la aplicación desde el inicio de sesión hasta la descarga del archivo de nómina, con guía por rol y resolución de problemas. |

## Estructura de la documentación

La documentación sigue el estándar **IEEE Std 1023** y las buenas prácticas de **PMBOK 7**, organizada por capas:

1. Introducción (propósito, alcance, audiencia, referencias)
2. Visión general del producto
3. Especificación de requisitos (HU-01 a HU-04)
4. Arquitectura del sistema
5. Modelo de datos
6. Backend — Documentación técnica por módulo
7. Frontend — Documentación técnica
8. API REST — Referencia completa
9. Seguridad
10. Pruebas y aseguramiento de calidad
11. Operación y despliegue
12. Análisis de completitud por HU
13. Tareas pendientes hacia el 100 %
14. Glosario
15. Anexos (catálogo de cargos, formato de archivo plano, variables de entorno, etc.)

## Estado de completitud

| HU | % | Detalle |
| --- | --- | --- |
| HU-01 | 100 % | 9/9 criterios de aceptación |
| HU-02 | 90 % | 9/10 (validación XOR pendiente) |
| HU-03 | 88 % | 9/13 (4 con implementación parcial) |
| HU-04 | 92 % | 10/11 (búsqueda por tipo de liquidación fragil) |
| **Total** | **≈ 91 %** | Ver §12 y §13 de `DOCUMENTACION.md` para el detalle |
