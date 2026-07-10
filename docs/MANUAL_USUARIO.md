# Guía Práctica de ComisionesApp

**Para profesionales de compensación y administradores del sistema**

| Campo | Valor |
| --- | --- |
| Aplicación | ComisionesApp |
| Versión de la guía | 3.0 |
| Versión de la aplicación | 0.1 |
| Audiencia | Profesionales de Comisiones y Administradores de la aplicación |
| Prerrequisito | Conocer las reglas de negocio de comisiones de Permoda Ltda. (IVA, comisión bancaria, tipos de venta, catálogo de cargos) |

> **Esta guía es 100 % procedimental.** Está escrita para que un profesional de compensación la siga paso a paso, sin necesidad de leer documentación técnica. Si necesita información técnica sobre la arquitectura del programa, consulte el documento `DOCUMENTACION.md` de la misma carpeta.

---

## Tabla de contenido

### Conocimientos previos
1. [Cómo leer esta guía](#1-cómo-leer-esta-guía)
2. [Acceder a la aplicación](#2-acceder-a-la-aplicación)
3. [Conocer la pantalla principal](#3-conocer-la-pantalla-principal)

### PARTE 1 · El ciclo mensual de liquidación
4. [Visión general del flujo mensual](#4-visión-general-del-flujo-mensual)
5. [Paso 1 — Configurar el calendario del año](#5-paso-1--configurar-el-calendario-del-año)
6. [Paso 2 — Generar los períodos del año](#6-paso-2--generar-los-períodos-del-año)
7. [Paso 3 — Configurar las comisiones por cargo](#7-paso-3--configurar-las-comisiones-por-cargo)
8. [Paso 4 — Verificar las fuentes de datos](#8-paso-4--verificar-las-fuentes-de-datos)
9. [Paso 5 — Ejecutar la liquidación del mes](#9-paso-5--ejecutar-la-liquidación-del-mes)
10. [Paso 6 — Validar el resultado](#10-paso-6--validar-el-resultado)
11. [Paso 7 — Cerrar el período](#11-paso-7--cerrar-el-período)
12. [Paso 8 — Entregar el archivo a nómina](#12-paso-8--entregar-el-archivo-a-nómina)

### PARTE 2 · Tareas del Administrador
13. [Cargar presupuestos y crecimiento](#13-cargar-presupuestos-y-crecimiento)
14. [Activar el modo de trabajo sin conexión](#14-activar-el-modo-de-trabajo-sin-conexión)
15. [Auditoría y reportes](#15-auditoría-y-reportes)
16. [Gestión de usuarios](#16-gestión-de-usuarios)

### PARTE 3 · Resolución de problemas
17. [Errores frecuentes al liquidar](#17-errores-frecuentes-al-liquidar)
18. [Errores frecuentes al parametrizar](#18-errores-frecuentes-al-parametrizar)
19. [Preguntas frecuentes](#19-preguntas-frecuentes)

### Anexos
- [Anexo A · Catálogo completo de cargos Midasoft](#anexo-a--catálogo-completo-de-cargos-midasoft)
- [Anexo B · Tabla de rangos de Staff Comercial](#anexo-b--tabla-de-rangos-de-staff-comercial)
- [Anexo C · Glosario de términos](#anexo-c--glosario-de-términos)
- [Anexo D · Contactos de soporte](#anexo-d--contactos-de-soporte)

---

# Conocimientos previos

## 1. Cómo leer esta guía

### 1.1 Convenciones visuales

A lo largo de esta guía encontrará distintos íconos y elementos gráficos para identificar rápidamente el tipo de información:

| Elemento | Significado |
| --- | --- |
| 💡 | **Sugerencia práctica** que le ahorrará tiempo. |
| ⚠️ | **Advertencia** — léala antes de continuar, puede evitarle un error. |
| 🟢 | Estado **Abierto** o **Vigente** — todo está listo para trabajar. |
| 🟡 | Estado **En curso** — la liquidación se está ejecutando, espere. |
| 🔵 | Estado **Liquidado** — el cálculo terminó correctamente. |
| 🔴 | Estado **Cerrado** o **ERROR** — no se puede modificar. |
| 📌 | **Nota importante** que debe recordar. |
| ▶ | Inicio de un procedimiento paso a paso. |
| ✓ | Confirmación de un paso terminado. |
| ✗ | Lo que **NO** debe hacer. |

### 1.2 Cómo se muestran las pantallas

Para que pueda identificar las pantallas de la aplicación, esta guía reproduce su aspecto en **diagramas de bloques** (mockups). Los recuadros representan los elementos que usted ve en pantalla.

Por ejemplo, una pantalla típica se ve así en esta guía:

```
┌─────────────────────────────────────────────────────────────────┐
│ Título de la sección                              [Botón] [Botón] │ ← Encabezado
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐            │
│  │ Tarjeta 1    │  │ Tarjeta 2    │  │ Tarjeta 3    │            │ ← Tarjetas
│  │ Valor        │  │ Valor        │  │ Valor        │            │
│  └──────────────┘  └──────────────┘  └──────────────┘            │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │ Tabla con datos                                          │    │ ← Tabla
│  │ Columna 1  │  Columna 2  │  Columna 3  │  Estado        │    │
│  │ dato       │  dato       │  dato       │  🟢 Abierto    │    │
│  └─────────────────────────────────────────────────────────┘    │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### 1.3 A quién está dirigida cada parte

| Parte | Audiencia |
| --- | --- |
| Parte 1 · Ciclo mensual de liquidación | **Profesional de Comisiones** y Administrador |
| Parte 2 · Tareas del Administrador | Solo **Administrador de la aplicación** |
| Parte 3 · Resolución de problemas | Ambos roles |

---

## 2. Acceder a la aplicación

### 2.1 La pantalla de inicio

Cuando abre la aplicación en su navegador, lo primero que ve es la pantalla de inicio de sesión:

```
                          ┌──────────────────────────────────┐
                          │  ┌──┐                            │
                          │  │C │  Automatización Comisiones │
                          │  └──┘  Comisiones · Permoda      │
                          │                                  │
                          │  Iniciar sesión                  │
                          │                                  │
                          │  Ingresa tus credenciales        │
                          │                                  │
                          │  ┌──────────────────────────┐    │
                          │  │ Correo electrónico       │    │
                          │  └──────────────────────────┘    │
                          │  ┌──────────────────────────┐    │
                          │  │ Contraseña               │    │
                          │  └──────────────────────────┘    │
                          │                                  │
                          │  ┌──────────────────────────┐    │
                          │  │       Ingresar            │   │
                          │  └──────────────────────────┘    │
                          └──────────────────────────────────┘
```

### 2.2 Iniciar sesión

▶ **Procedimiento**

1. En el campo **Correo electrónico**, escriba su dirección de correo corporativo (ejemplo: `maria.gonzalez@permoda.com`).
2. En el campo **Contraseña**, escriba su contraseña.
3. Haga clic en el botón negro **Ingresar**.

✓ Si las credenciales son correctas, la aplicación lo llevará a la pantalla principal (ver [sección 3](#3-conocer-la-pantalla-principal)).

### 2.3 Errores comunes al iniciar sesión

| Situación | Mensaje que ve | Solución |
| --- | --- | --- |
| Escribió mal el correo o la contraseña | *Credenciales incorrectas. Verifica tu email y contraseña.* | Verifique que el bloqueo de mayúsculas esté desactivado y que no haya espacios al inicio o al final. |
| Olvidó la contraseña | (mismo mensaje) | Contacte al Administrador de la aplicación para que la restablezca. |
| La aplicación no carga | (pantalla en blanco o error de red) | Verifique su conexión a la intranet. Si sigue sin funcionar, contacte al equipo de soporte. |

### 2.4 Cerrar sesión

▶ **Procedimiento**

1. Ubique la esquina superior derecha de la pantalla. Verá su nombre y rol.
2. Haga clic en el botón **Salir** (con un ícono de puerta).
3. La aplicación lo regresará a la pantalla de inicio de sesión.

```
┌─────────────────────────────────────────────────────────────┐
│ Automatización Comisiones / ...                  ┌─────────┐ │
│                                                │Profesional│ │
│                                                │de Comis.  │ │
│                                                │María G.    │ │
│                                                │[ ⎘ Salir ] │ │
└─────────────────────────────────────────────────────────────┘
```

> 💡 **Cierre sesión siempre que se retire de su equipo**, especialmente si comparte el computador con otra persona.

---

## 3. Conocer la pantalla principal

### 3.1 La estructura general

Una vez que inicia sesión, la aplicación tiene tres zonas principales:

```
┌──────────────┬──────────────────────────────────────────────────────┐
│              │  Automatización Comisiones / Resumen general         │
│  SIDEBAR     ├──────────────────────────────────────────────────────┤
│  (menú       │                                                      │
│  lateral)    │                                                      │
│              │              CONTENIDO DE LA VISTA                   │
│  • Resumen   │                                                      │
│  • Calendar. │              (lo que cambia según la                 │
│  • Parametr. │              opción del menú que usted               │
│  • Liquidac. │              haya elegido)                           │
│  • Trazabil. │                                                      │
│  • Datos     │                                                      │
│              │                                                      │
└──────────────┴──────────────────────────────────────────────────────┘
```

- **Sidebar (columna izquierda):** contiene el menú con todos los módulos. Siempre está visible.
- **Barra superior:** muestra la ruta actual (arriba) y su nombre / rol / botón Salir (esquina derecha).
- **Contenido central:** es el módulo en sí. Cambia según la opción del menú que usted elija.

### 3.2 El panel de control (Resumen general)

Al iniciar sesión, la aplicación lo lleva al panel de control. Esta pantalla le da una vista rápida del estado general del proceso:

```
┌────────────────────────────────────────────────────────────────────────┐
│  Automatización Comisiones / Resumen general                          │
├────────────────────────────────────────────────────────────────────────┤
│                                                                        │
│  ┌────────────────┐ ┌────────────────┐ ┌────────────────┐ ┌────────────┐ │
│  │ 📅 Períodos    │ │ 👥 Colabor.    │ │ ✓ Períodos     │ │ 💲 Comis.  │ │
│  │   abiertos     │ │   activos      │ │   liquidados   │ │ (último)   │ │
│  │                │ │                │ │                │ │            │ │
│  │      2         │ │      38        │ │      10        │ │  $ 4.2M    │ │
│  │                │ │                │ │                │ │            │ │
│  │ En calendarios │ │ Registrados    │ │ LIQ + CERR     │ │ JUL-2026   │ │
│  │   activos      │ │ en sistema     │ │                │ │            │ │
│  └────────────────┘ └────────────────┘ └────────────────┘ └────────────┘ │
│                                                                        │
│  Accesos rápidos                                                       │
│  ┌────────────────┐ ┌────────────────┐ ┌────────────────┐ ┌──────────┐ │
│  │ 📅 Configurar  │ │ ⚙  Parametrizar│ │ ▶  Liquidar    │ │ 📊 Ver   │ │
│  │  calendarios   │ │   cargos       │ │                │ │ resultados│ │
│  └────────────────┘ └────────────────┘ └────────────────┘ └──────────┘ │
│                                                                        │
└────────────────────────────────────────────────────────────────────────┘
```

**Interpretación de las tarjetas:**

| Tarjeta | Qué le dice | Cuándo prestarle atención |
| --- | --- | --- |
| 📅 **Períodos abiertos** | Cuántos meses están listos para liquidar. | Si es **mayor que 0**, hay trabajo pendiente. |
| 👥 **Colaboradores activos** | Cuántos empleados tiene registrados el sistema. | Útil para validar que Midasoft está al día. |
| ✓ **Períodos liquidados** | Cuántos meses ya están en estado Liquidado o Cerrado. | Le indica el avance del año. |
| 💲 **Comisiones (último)** | Valor de la última liquidación y a qué mes corresponde. | Verifica de un vistazo que la última ejecución salió bien. |

> 💡 Si la tarjeta de comisiones muestra **"—"**, significa que aún no se ha ejecutado ninguna liquidación en el sistema. Si muestra un valor, es el resultado de su última ejecución.

### 3.3 Los seis módulos del menú

| Módulo | Para qué sirve | Cuándo usarlo |
| --- | --- | --- |
| **Resumen general** | Vista rápida del estado. | Al iniciar el día. |
| **Calendarios y períodos** | Configurar los meses del año. | Una vez al año (crear calendario) o al inicio de cada mes. |
| **Parametrización de cargos** | Definir % de comisión y reglas. | Al inicio de cada mes o cuando cambien las reglas. |
| **Liquidación automática** | Ejecutar el cálculo mensual. | Al cierre de cada mes, una sola vez. |
| **Trazabilidad y salida** | Consultar liquidaciones pasadas. | Cada vez que necesite verificar o auditar un resultado. |
| **Datos de origen** | Ver ventas y empleados directamente de ICG / Midasoft. | Para hacer sanity check antes de liquidar. |

### 3.4 Los estados de los períodos (códigos de color)

A lo largo de toda la aplicación verá etiquetas de estado con colores. Aprenda a reconocerlos de un vistazo:

```
   🟢 Abierto        El período está listo para liquidar.
                      → Usted puede ejecutar el cálculo.

   🟡 En curso       La liquidación se está ejecutando en este momento.
                      → Espere unos segundos. No toque nada.

   🔵 Liquidado      El cálculo terminó y el resultado está disponible.
                      → Usted puede validar y consultar el resultado.

   🔴 Cerrado        El resultado fue aprobado. Es definitivo.
                      → No se puede modificar. Use Trazabilidad para consultarlo.

   🟤 ERROR          La última ejecución falló.
                      → Revise los logs, corrija la causa y vuelva a intentar.
```

---

# PARTE 1 · El ciclo mensual de liquidación

## 4. Visión general del flujo mensual

El trabajo de liquidar las comisiones de un mes sigue un flujo de 8 pasos. A continuación verá el mapa visual del proceso completo, con la ruta que usted seguirá por la aplicación:

```
                              INICIO DEL CICLO MENSUAL
                                       │
                                       ▼
   ┌────────────────────────────────────────────────────────────┐
   │  PASO 1 · Configurar el calendario del año (solo 1 vez)   │  → 5
   └────────────────────────────────────────────────────────────┘
                                       │
                                       ▼
   ┌────────────────────────────────────────────────────────────┐
   │  PASO 2 · Generar los 12 períodos del año (solo 1 vez)    │  → 6
   └────────────────────────────────────────────────────────────┘
                                       │
                                       ▼
   ┌────────────────────────────────────────────────────────────┐
   │  PASO 3 · Configurar comisiones por cargo (cada mes)      │  → 7
   └────────────────────────────────────────────────────────────┘
                                       │
                                       ▼
   ┌────────────────────────────────────────────────────────────┐
   │  PASO 4 · (Opcional) Verificar las fuentes de datos        │  → 8
   └────────────────────────────────────────────────────────────┘
                                       │
                                       ▼
   ┌────────────────────────────────────────────────────────────┐
   │  PASO 5 · Ejecutar la liquidación del mes                   │  → 9
   └────────────────────────────────────────────────────────────┘
                                       │
                                       ▼
   ┌────────────────────────────────────────────────────────────┐
   │  PASO 6 · Validar el resultado (drill-down)                │  → 10
   └────────────────────────────────────────────────────────────┘
                                       │
                                       ▼
   ┌────────────────────────────────────────────────────────────┐
   │  PASO 7 · Cerrar el período                                │  → 11
   └────────────────────────────────────────────────────────────┘
                                       │
                                       ▼
   ┌────────────────────────────────────────────────────────────┐
   │  PASO 8 · Entregar el archivo a nómina                     │  → 12
   └────────────────────────────────────────────────────────────┘
                                       │
                                       ▼
                              FIN DEL CICLO
```

### 4.1 Quién hace qué

| Paso | Quién lo hace | Frecuencia |
| --- | --- | --- |
| 1 · Configurar calendario | Administrador | Una vez al año |
| 2 · Generar períodos | Administrador | Una vez al año |
| 3 · Parametrizar cargos | Profesional / Administrador | Mensual (o cuando cambien reglas) |
| 4 · Verificar fuentes | Profesional / Administrador | Opcional, antes de liquidar |
| 5 · Ejecutar liquidación | Profesional / Administrador | Mensual |
| 6 · Validar resultado | Profesional / Administrador | Cada liquidación |
| 7 · Cerrar período | Profesional / Administrador | Cada liquidación |
| 8 · Entregar a nómina | Profesional / Administrador | Cada liquidación |

### 4.2 Cuándo se hace cada cosa

| Momento del mes | Pasos a ejecutar |
| --- | --- |
| **A finales del mes** (ej. 30 de junio) | Pasos 3 (si hay nuevos %), 4, 5 y 6. |
| **A principios del mes siguiente** (ej. 1-5 de julio) | Pasos 7 y 8, una vez validado. |
| **Una vez al año** (ej. en diciembre) | Pasos 1 y 2 para preparar el año siguiente. |

---

## 5. Paso 1 — Configurar el calendario del año

> **Quién lo hace:** el **Administrador** de la aplicación.
> **Frecuencia:** una sola vez al año (generalmente a finales del año anterior).

### 5.1 Qué es un "calendario"

Un **calendario** es el contenedor de los 12 meses de un año. Cada año calendario nuevo requiere crear un nuevo calendario (por ejemplo: `Comisiones 2027`). Pueden existir varios calendarios al mismo tiempo (uno por año), pero dentro de un mismo calendario, los períodos no se solapan.

### 5.2 Antes de empezar

Pregúntese:
- ¿Ya existe un calendario para el año que va a liquidar? Si sí, puede saltar este paso.
- ¿Necesita crear el calendario del año siguiente para tenerlo listo con anticipación? Si sí, hágalo en diciembre.

### 5.3 Acceder al módulo

▶ **Procedimiento**

1. En el sidebar, haga clic en **Calendarios y períodos**.

```
  ┌──────────────┐
  │  SIDEBAR     │
  │              │
  │  • Resumen   │
  │  • Calendar. │  ◀ clic aquí
  │  • Parametr. │
  │  • Liquidac. │
  │  • Trazabil. │
  │  • Datos     │
  └──────────────┘
```

2. La aplicación muestra la pantalla de calendarios.

### 5.4 Pantalla que verá

```
┌────────────────────────────────────────────────────────────────────────┐
│  Automatización Comisiones / Calendarios y períodos                   │
├────────────────────────────────────────────────────────────────────────┤
│  Calendarios y períodos                       [Actualizar][+ Nuevo cal]│
│                                                       [+ Nuevo período]│
│                                                                        │
│  ⓘ Los estados En Curso, Liquidado y Cerrado son asignados            │
│    automáticamente por el motor de liquidación. Solo es posible        │
│    eliminar períodos en estado Abierto.                                │
│                                                                        │
│  ┌────────────────────────────────────────────────────┐               │
│  │  Comisiones 2026 (×)   Comisiones 2027 (×)         │ ◀ Pestañas    │
│  └────────────────────────────────────────────────────┘               │
│                                                                        │
│  Períodos — Comisiones 2026                          12 períodos       │
│  ┌─────────┬────────────┬────────────┬──────────┐                      │
│  │ Código  │ Fecha ini. │ Fecha fin  │ Estado   │                      │
│  │ MAY-2026│ 2026-04-21 │ 2026-05-20 │ 🔵 Liq.  │                      │
│  │ JUN-2026│ 2026-05-21 │ 2026-06-20 │ 🔵 Liq.  │                      │
│  │ JUL-2026│ 2026-06-21 │ 2026-07-20 │ 🟢 Ab.   │                      │
│  │ AGO-2026│ 2026-07-21 │ 2026-08-20 │ 🟢 Ab.   │                      │
│  │ ...     │ ...        │ ...        │ ...      │                      │
│  └─────────┴────────────┴────────────┴──────────┘                      │
└────────────────────────────────────────────────────────────────────────┘
```

### 5.5 Crear un nuevo calendario

▶ **Procedimiento**

1. En la parte superior de la pantalla, haga clic en el botón **+ Nuevo calendario**.

2. Aparecerá un formulario dentro de la misma pantalla:

```
   Registrar nuevo calendario
   ┌────────────────────────┐  ┌────────────────────────┐
   │ Nombre                 │  │ Año                    │
   │ ej. Comisiones 2027    │  │ 2027                   │
   └────────────────────────┘  └────────────────────────┘
   [💾 Guardar calendario]   [Cancelar]
```

3. Complete los dos campos:

| Campo | Qué escribir | Ejemplo |
| --- | --- | --- |
| **Nombre** | Un nombre descriptivo. Convención sugerida: `Comisiones AAAA`. | `Comisiones 2027` |
| **Año** | El año (4 dígitos). | `2027` |

4. Haga clic en **💾 Guardar calendario**.

✓ El nuevo calendario aparece como una pestaña junto a los demás y se selecciona automáticamente.

> ⚠️ **No puede haber dos calendarios con el mismo año.** Si intenta crear uno duplicado, la aplicación mostrará un error.
>
> 📌 Después de crear el calendario, debe generar sus 12 períodos. Eso se hace en el [Paso 2](#6-paso-2--generar-los-períodos-del-año).

### 5.6 Ver los calendarios existentes

Para cambiar entre calendarios, haga clic en la pestaña correspondiente:

```
   ┌──────────────────────────┐  ┌──────────────────────────┐
   │ Comisiones 2026 (×)     │  │ Comisiones 2027 (×)     │
   └──────────────────────────┘  └──────────────────────────┘
            ▲ clic
   Pestaña activa (fondo negro, texto blanco)
```

> 💡 El botón **(×)** que aparece al lado del nombre permite eliminar el calendario (solo si no tiene períodos).

---

## 6. Paso 2 — Generar los períodos del año

> **Quién lo hace:** el **Administrador** de la aplicación.
> **Frecuencia:** una sola vez al año, justo después de crear el calendario.

### 6.1 Qué es un "período"

Un **período** es un mes dentro de un calendario. Sigue el patrón **21 → 20** (ej. del 21 de junio al 20 de julio). Cada año se generan 12 períodos: uno por mes.

| Código | Inicio | Fin |
| --- | --- | --- |
| MAY-2026 | 2026-04-21 | 2026-05-20 |
| JUN-2026 | 2026-05-21 | 2026-06-20 |
| JUL-2026 | 2026-06-21 | 2026-07-20 |
| AGO-2026 | 2026-07-21 | 2026-08-20 |
| ... | ... | ... |
| ABR-2027 | 2027-03-21 | 2027-04-20 |

> 📌 El código se genera automáticamente con el formato **MES-AÑO** (ENE-2027, FEB-2027, etc.).

### 6.2 Antes de empezar

- El calendario debe estar creado y seleccionado.
- El calendario **no debe tener períodos aún** (la aplicación se lo recordará si los tiene).

### 6.3 Generar los 12 períodos automáticamente (forma recomendada)

▶ **Procedimiento**

1. Asegúrese de que la pestaña del calendario recién creado esté seleccionada.
2. En la parte superior, haga clic en **Generar año**.

```
   [+ Nuevo calendario]  [Generar año]  [+ Nuevo período]
                          ▲ clic
```

3. Se abre un formulario de generación. Verá un resumen de lo que se va a crear:

```
   Generar 12 períodos del año
   ┌────────────────────────────────────────────────────────────┐
   │ ⓘ Genera los 12 períodos en una sola operación con el       │
   │   patrón 21 → 20 (por defecto día 21 del mes anterior al   │
   │   día 20 del mes actual). Solo es válido si el calendario   │
   │   aún no tiene períodos.                                    │
   └────────────────────────────────────────────────────────────┘

   ┌─────────────┐  ┌──────────┐  ┌──────────────────┐
   │ Calendario  │  │ Año     │  │ Patrón           │
   │ Comis. 2027 │  │ 2027    │  │ [21] → [20]      │
   └─────────────┘  └──────────┘  └──────────────────┘

   [🚀 Generar 12 períodos]   [Cancelar]
```

4. Verifique los datos:
   - **Calendario** y **Año** se completan solos (no se pueden cambiar).
   - **Patrón** está en 21 → 20 (déjelo así salvo instrucción contraria).
5. Haga clic en **🚀 Generar 12 períodos**.

✓ En pocos segundos verá los 12 períodos en la tabla inferior, todos en estado 🟢 **Abierto**.

> ⚠️ Si el calendario ya tiene períodos, la aplicación le mostrará un error. En ese caso, primero debe eliminarlos.

### 6.4 Crear un período individual (caso excepcional)

Solo use esta opción si necesita crear un período específico sin generar el año completo (por ejemplo, para una liquidación retroactiva).

▶ **Procedimiento**

1. En la parte superior, haga clic en **+ Nuevo período**.

2. Complete el formulario:

```
   Registrar nuevo período
   ┌──────────────────────────┐  ┌──────────────────────────┐
   │ Calendario               │  │ Código (opcional)        │
   │ Comisiones 2026       ▼  │  │ se genera automático     │
   └──────────────────────────┘  └──────────────────────────┘
   ┌──────────────────────────┐  ┌──────────────────────────┐
   │ Fecha inicio             │  │ Fecha fin                │
   │ 2026-06-21               │  │ 2026-07-20               │
   └──────────────────────────┘  └──────────────────────────┘
   [💾 Guardar período]  [Cancelar]
```

| Campo | Qué escribir | Ejemplo |
| --- | --- | --- |
| **Calendario** | El calendario al que pertenece. | `Comisiones 2026` |
| **Código** | Déjelo vacío para que se genere automático. | (vacío) |
| **Fecha inicio** | Primer día del período (formato AAAA-MM-DD). | `2026-06-21` |
| **Fecha fin** | Último día del período. | `2026-07-20` |

3. Haga clic en **💾 Guardar período**.

> ⚠️ La aplicación valida automáticamente:
> - Que la fecha fin sea **posterior** a la fecha inicio.
> - Que el período **no se solape** con otros del mismo calendario.
> - Que haya **continuidad** con los períodos vecinos (sin huecos).
>
> Si algo falla, la aplicación le dirá exactamente qué corregir.

### 6.5 Eliminar un período (administrador)

Solo se puede eliminar un período si está en estado 🟢 **Abierto**. Una vez liquidado, el período no se puede borrar.

▶ **Procedimiento**

1. Ubique el período en la tabla de períodos.
2. En la columna de la derecha, haga clic en el ícono de papelera (🗑).
3. Confirme la eliminación en el mensaje que aparece.

### 6.6 Resultado esperado

Después de este paso, su calendario debe verse así:

```
   Períodos — Comisiones 2027                          12 períodos
   ┌─────────┬────────────┬────────────┬──────────┐
   │ Código  │ Fecha ini. │ Fecha fin  │ Estado   │
   │ ENE-2027│ 2026-12-21 │ 2027-01-20 │ 🟢 Ab.   │
   │ FEB-2027│ 2027-01-21 │ 2027-02-20 │ 🟢 Ab.   │
   │ MAR-2027│ 2027-02-21 │ 2027-03-20 │ 🟢 Ab.   │
   │ ABR-2027│ 2027-03-21 │ 2027-04-20 │ 🟢 Ab.   │
   │ MAY-2027│ 2027-04-21 │ 2027-05-20 │ 🟢 Ab.   │
   │ JUN-2027│ 2027-05-21 │ 2027-06-20 │ 🟢 Ab.   │
   │ JUL-2027│ 2027-06-21 │ 2027-07-20 │ 🟢 Ab.   │
   │ AGO-2027│ 2027-07-21 │ 2027-08-20 │ 🟢 Ab.   │
   │ SEP-2027│ 2027-08-21 │ 2027-09-20 │ 🟢 Ab.   │
   │ OCT-2027│ 2027-09-21 │ 2027-10-20 │ 🟢 Ab.   │
   │ NOV-2027│ 2027-10-21 │ 2027-11-20 │ 🟢 Ab.   │
   │ DIC-2027│ 2027-11-21 │ 2027-12-20 │ 🟢 Ab.   │
   └─────────┴────────────┴────────────┴──────────┘
```

✓ Listo. Ya tiene los 12 períodos del año. Ahora puede pasar al Paso 3.

---

## 7. Paso 3 — Configurar las comisiones por cargo

> **Quién lo hace:** el **Profesional de Comisiones** o el **Administrador**.
> **Frecuencia:** cada mes (si las reglas no cambian) o cada vez que cambien las reglas de un cargo.

### 7.1 Qué es una "parametrización"

Una **parametrización** es la configuración de comisiones para un **cargo específico** durante un **período específico**. Define:

- Cuánto se paga por cada tipo de venta (Línea, Promoción, Línea Estrategia).
- Cómo se agrupa la comisión (por persona, por tienda, por grupo de tiendas).
- Cómo se reparte entre los colaboradores del mismo grupo.
- Qué reglas se aplican (presupuesto, crecimiento, novedades, etc.).
- Desde cuándo y hasta cuándo aplica.

> 📌 Una parametrización es como una "ficha" que le dice al motor cómo calcular las comisiones de un cargo durante un mes. Sin parametrización, no se puede liquidar.

### 7.2 El catálogo de cargos Midasoft

Los cargos que se pueden parametrizar vienen del **catálogo oficial de Midasoft** (no se pueden crear cargos nuevos). Son 11:

| Código | Cargo | Tipo de afectación típica |
| --- | --- | --- |
| `102058` | Administrador(a) de tienda | Novedades |
| `102110` | Coadministrador(a) de tienda | Novedades |
| `102502` | Partner comercial | Novedades |
| `102571` | Gestor comercial | Novedades |
| `104222` | Cajero(a) TC | Novedades |
| `104223` | Cajero(a) 36H | Novedades |
| `104275` | Asesor(a) de ventas 48H | **Horas laboradas** |
| `104341` | Asesor(a) de ventas 36H | **Horas laboradas** |
| `104517` | Staff comercial 36H | Novedades |
| `104518` | Staff comercial TC | Novedades |
| `104608` | Vendedor(a) | Novedades |

(Ver el [Anexo A](#anexo-a--catálogo-completo-de-cargos-midasoft) para la lista completa con descripciones.)

> 📌 Los cargos de **Asesores de ventas** trabajan con afectación por **Horas laboradas** (se suman las horas de las marcaciones). Los demás cargos usan **Novedades diarias** (se restan los días no laborados por vacaciones, incapacidades, etc.).

### 7.3 Acceder al módulo

▶ **Procedimiento**

1. En el sidebar, haga clic en **Parametrización de cargos**.

2. Verá la pantalla con los filtros en la parte superior y la tabla de parametrizaciones existentes en la parte inferior.

### 7.4 La pantalla de parametrización

```
┌────────────────────────────────────────────────────────────────────────┐
│  Automatización Comisiones / Parametrización de cargos                 │
├────────────────────────────────────────────────────────────────────────┤
│  Parametrización de cargos                  [Actualizar][+ Nueva par.] │
│                                                                        │
│  ⓘ Cada configuración se define por cargo (catálogo oficial Midasoft)  │
│    y período de calendario. Todo cambio exige un motivo y queda        │
│    registrado con usuario y fecha para auditoría.                      │
│                                                                        │
│  ┌─── Filtros ─────────────────────────────────────────────────┐      │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐  │      │
│  │  │ Calendario  │  │ Período     │  │ Cargo               │  │      │
│  │  │ Comis 2026▼│  │ JUL-2026 ▼  │  │ Todos          ▼    │  │      │
│  │  └─────────────┘  └─────────────┘  └─────────────────────┘  │      │
│  └──────────────────────────────────────────────────────────────┘      │
│                                                                        │
│  Parametrizaciones configuradas                        18 configuraciones│
│  ┌──────────┬─────────┬──────────┬──────────┬──────────────┬────────┐   │
│  │ Cargo    │ Período │ Liq.     │ Dist.    │ %L / %P / %E │ Afect. │   │
│  │ 104608   │ JUL-2026│ Indiv.   │ Indiv.   │ 2.5/1.8/2.0  │ Noved. │   │
│  │ Vendedor │ (Comis. │          │          │              │        │   │
│  │          │  2026)  │          │          │              │        │   │
│  │ 102058   │ JUL-2026│ Global   │ Proporc. │ 0.75/0.53/— │ Noved. │   │
│  │ Administr│         │ Tienda   │          │              │        │   │
│  └──────────┴─────────┴──────────┴──────────┴──────────────┴────────┘   │
└────────────────────────────────────────────────────────────────────────┘
```

### 7.5 Ver las parametrizaciones existentes

La tabla inferior muestra todas las parametrizaciones. Use los filtros para acotar la búsqueda:

| Filtro | Para qué sirve |
| --- | --- |
| **Calendario** | Limita a un año específico. |
| **Período** | Limita a un mes específico. |
| **Cargo** | Muestra solo las parametrizaciones de un cargo. |

> 💡 Si quiere ver las parametrizaciones de un período específico, filtre por **Calendario → Período** y deje el cargo en blanco.

### 7.6 Crear una nueva parametrización

▶ **Procedimiento — Resumen**

1. Haga clic en **+ Nueva parametrización** (esquina superior derecha).
2. Complete el formulario por secciones (cada sección se explica más abajo).
3. Escriba el **motivo** del cambio (obligatorio).
4. Haga clic en **💾 Guardar parametrización**.

A continuación verá cada sección del formulario en detalle.

#### 7.6.1 Sección 1 — Datos básicos

```
   ┌────────────────────────────┐  ┌────────────────────────────┐
   │ Cargo (Midasoft) *         │  │ Calendario *               │
   │ 104608 — Vendedor(a)    ▼  │  │ Comisiones 2026         ▼  │
   └────────────────────────────┘  └────────────────────────────┘
   ┌────────────────────────────┐
   │ Período de vigencia *       │
   │ JUL-2026                 ▼  │
   └────────────────────────────┘
```

| Campo | Qué elegir | Ejemplo |
| --- | --- | --- |
| **Cargo (Midasoft)** | El cargo del catálogo. | `104608 — Vendedor(a)` |
| **Calendario** | El año al que pertenece la parametrización. | `Comisiones 2026` |
| **Período de vigencia** | El mes específico. | `JUL-2026` |

> 💡 **Truco:** cuando usted elige un cargo, la aplicación le sugiere automáticamente el tipo de afectación típico (Horas o Novedades) según el catálogo. No tiene que cambiarlo salvo que tenga una razón.

#### 7.6.2 Sección 2 — Tipo de liquidación y distribución

```
   ┌────────────────────────────────┐  ┌──────────────────────────┐
   │ Tipo de liquidación *          │  │ Tipo de distribución *   │
   │ Individual por colaborador  ▼ │  │ Individual            ▼  │
   └────────────────────────────────┘  └──────────────────────────┘
```

Estos dos campos controlan **cómo se calcula y reparte** la comisión.

**Tipo de liquidación** (elija UNO):

| Opción | Significado | Cuándo usarla |
| --- | --- | --- |
| `Individual por colaborador` | Cada vendedor recibe según sus propias ventas. | Vendedores, Asesores, Cajeros. |
| `Global por tienda` | La comisión se calcula para toda la tienda y luego se reparte. | Administradores de tienda, Coadministradores. |
| `Global por grupo de tiendas` | Igual pero agrupando varias tiendas (ej. regionales). | Managers regionales. |

**Tipo de distribución** (elija UNO):

| Opción | Significado | Cuándo usarla |
| --- | --- | --- |
| `Individual` | Cada quien recibe su parte fija. | Cuando la liquidación es individual, o cuando cada persona tiene ventas propias. |
| `Proporcional entre colaboradores` | Se reparte según las horas laboradas o los días trabajados. | Cuando es Global y los colaboradores comparten una bolsa de comisión. |

> ⚠️ **Regla importante:** si elige "Individual por colaborador", la única distribución permitida es "Individual". Si intenta elegir "Proporcional", la aplicación le mostrará un error.

#### 7.6.3 Sección 3 — Afectación (excluyente)

```
   ┌────────────────────────────────────────┐
   │ Afectación (excluyente) *              │
   │ Novedades diarias                  ▼  │
   └────────────────────────────────────────┘
```

Este campo define **cómo se cuentan los días efectivamente laborados** de cada colaborador:

| Opción | Cómo funciona | Cuándo usarla |
| --- | --- | --- |
| `Novedades diarias` | Se restan los días con Vacaciones, Incapacidad, Ausentismo. | Cargos administrativos, vendedores, cajeros. |
| `Horas laboradas` | Se suman las horas de las marcaciones y se comparan contra un tope. | Asesores de ventas (cargos `104275` y `104341`). |

> 📌 **Excepciones importantes** (no excluyen la comisión, se cuentan como laborados): Licencia de Luto, Día de la Familia, Compensatorio Legal.

#### 7.6.4 Sección 4 — Porcentajes por tipo de venta

```
   ┌─────────────┐  ┌─────────────┐  ┌─────────────┐
   │ % Línea *   │  │ % Prom. *   │  │ % Estrat. * │
   │ 2.5         │  │ 1.8         │  │ 2.0         │
   └─────────────┘  └─────────────┘  └─────────────┘
```

Aquí va el **corazón** de la parametrización: cuánto se paga por cada peso vendido, según el tipo de venta.

| Campo | Significado | Valor típico |
| --- | --- | --- |
| **% Línea** | Comisión por ventas de **Línea** (la mayoría de las ventas). | 2,5 % para Vendedor |
| **% Promoción** | Comisión por ventas en **Promoción** (con descuento). | 1,8 % para Vendedor |
| **% Línea Estrategia** | Comisión por ventas de **Línea Estrategia** (productos clave). | 2,0 % para Vendedor |

> 💡 Los valores en la aplicación se manejan como **porcentaje** (no como decimal). Es decir, para 2,5 % escriba `2.5`, no `0.025`.

#### 7.6.5 Sección 5 — Estrategia de Línea Estrategia

Si las ventas de Línea Estrategia se pagan distinto que las de Línea normal, configure aquí la fórmula:

```
   Descuento Línea Estrategia
   ┌──────────────────────────┐  ┌──────────────────────┐  ┌──────────────────┐
   │ Origen del descuento     │  │ % Descuento corp.    │  │ % Estrat. efect. │
   │ Corporativo (% fijo)  ▼ │  │ 0.5                  │  │ 2.0000           │
   └──────────────────────────┘  └──────────────────────┘  └──────────────────┘
```

**Origen del descuento** (elija UNO):

| Opción | Cómo se calcula el % de Línea Estrategia | Ejemplo |
| --- | --- | --- |
| `— Sin descuento —` | El % Estrategia se toma tal cual del campo "% Línea Estrategia". | Úselo si el cargo paga igual en Línea y Estrategia. |
| `Corporativo (% fijo)` | `Línea - descuento corporativo` | Si Línea = 2,5 y descuento = 0,5, Estrategia = 2,0. |
| `Real (% del descuento aplicado)` | Se calcula venta por venta según el descuento real de cada venta. | Para casos especiales con descuentos variables. |

> 💡 El campo **% Estrategia efectivo** se calcula automáticamente y se muestra para que usted verifique.

#### 7.6.6 Sección 6 — Vigencia de la parametrización

```
   Vigencia de la parametrización
   ┌──────────────┐  ┌──────────────┐
   │ Desde        │  │ Hasta (opc.) │
   │ 2026-06-21   │  │ 2026-07-20   │
   └──────────────┘  └──────────────┘
```

| Campo | Significado | Sugerencia |
| --- | --- | --- |
| **Desde** | Fecha inicial de vigencia (opcional). | Déjelo vacío para que aplique "siempre". |
| **Hasta** | Fecha final de vigencia (opcional). | Déjelo vacío para que no tenga tope. |

> ⚠️ Si ya tiene una parametrización activa del mismo cargo, las vigencias no deben solaparse. La aplicación se lo advertirá.

#### 7.6.7 Sección 7 — Validaciones activables

```
   ●○  Validar cumplimiento de presupuesto
   ●○  Validar crecimiento de ventas
```

Estos interruptores activan validaciones opcionales contra las tablas de presupuesto y crecimiento:

- **Validar cumplimiento de presupuesto** — active si el cargo tiene metas de venta.
- **Validar crecimiento de ventas** — active si quiere comparar contra el período anterior.

> 📌 Las tablas de presupuesto y crecimiento las configura el **Administrador** (ver [sección 13](#13-cargar-presupuestos-y-crecimiento)).

#### 7.6.8 Sección 8 — Rangos por cumplimiento

Esta sección aplica a cargos que tienen una tabla de comisiones por tramos (caso típico: Staff Comercial).

```
   Rangos de comisión por cumplimiento
   ┌────────────────┬────────────────┬──────────────┬──────┐
   │ Desde (%)      │ Hasta (% — ∞)  │ Comisión (%) │      │
   ├────────────────┼────────────────┼──────────────┼──────┤
   │ 0              │ 80             │ 0.19         │ [🗑] │
   │ 80             │ 90             │ 0.29         │ [🗑] │
   │ 90             │ 95             │ 0.48         │ [🗑] │
   │ 95             │ 100            │ 0.60         │ [🗑] │
   │ 100            │ ∞              │ 0.72         │ [🗑] │
   └────────────────┴────────────────┴──────────────┴──────┘
   [+ Agregar rango]
```

Reglas para los rangos:
- **Deben ser continuos:** el "Hasta" de un rango debe coincidir con el "Desde" del siguiente.
- **Sin huecos ni solapamientos.**
- **Solo el último rango puede ser abierto** (dejar "Hasta" vacío para indicar infinito).

> 💡 Si no necesita rangos, deje solo un rango con `Desde = 0` y `Hasta = ∞` y comisión = 0. La aplicación le advertirá si la lista está vacía.

#### 7.6.9 Sección 9 — Motivo del cambio

```
   ┌──────────────────────────────────────────────────────────┐
   │ Motivo del cambio (requerido para auditoría) *           │
   │                                                          │
   │ Describa el motivo de esta configuración...              │
   └──────────────────────────────────────────────────────────┘
```

**Este campo es obligatorio.** Todo cambio en una parametrización queda registrado con quién lo hizo, cuándo y por qué. Escriba algo descriptivo, por ejemplo:

- "Ajustes de % solicitados por el área comercial para JUL-2026"
- "Vigencia hasta fin de trimestre"
- "Carga inicial de parametrización del año 2026"

> ⚠️ Si no escribe un motivo, la aplicación no lo dejará guardar.

#### 7.6.10 Guardar la parametrización

Cuando haya completado todas las secciones:

1. Revise que los datos sean correctos.
2. Haga clic en **💾 Guardar parametrización** (esquina inferior derecha del formulario).

✓ Verá la parametrización aparecer en la tabla inferior y un mensaje de éxito en la parte superior.

### 7.7 Editar una parametrización existente

▶ **Procedimiento**

1. Ubique la parametrización a editar en la tabla inferior.
2. En la columna de la derecha, haga clic en el ícono de **lápiz** (✎).
3. Modifique los campos que necesite.
4. Es importante: **escriba un nuevo motivo** en el campo de motivo (es obligatorio, aunque sea similar al anterior).
5. Haga clic en **💾 Guardar parametrización**.

> 📌 Editar una parametrización **no afecta** a liquidaciones ya ejecutadas. Ellas conservan el snapshot (la "foto") de la parametrización que se usó en su momento.

### 7.8 Desactivar una parametrización

Si la parametrización ya no debe aplicar (por ejemplo, terminó la vigencia y no la va a renovar), puede **desactivarla** en lugar de eliminarla. Esto conserva el histórico para auditoría.

▶ **Procedimiento**

1. Ubique la parametrización a desactivar.
2. En la columna de la derecha, haga clic en el ícono de **toggle** (◐).
3. Confirme la desactivación.

✓ La parametrización cambia a estado **Inactiva** (gris). Sigue visible en la tabla pero ya no se usa en nuevas liquidaciones.

> 💡 **Desactivar ≠ Eliminar.** Solo el Administrador puede eliminar definitivamente.

### 7.9 Ejemplo completo: parametrización de Vendedor JUL-2026

Para que tenga una referencia concreta, esta es la parametrización típica del cargo `104608 — Vendedor(a)` en el mes `JUL-2026`:

```
   Cargo:           104608 — Vendedor(a)
   Calendario:      Comisiones 2026
   Período:         JUL-2026

   Tipo de liquidación:   Individual por colaborador
   Tipo de distribución:  Individual
   Afectación:            Novedades diarias

   % Línea:               2,5
   % Promoción:           1,8
   % Línea Estrategia:    2,0 (Corporativo, con descuento 0,5)

   Vigencia:              2026-06-21 → 2026-07-20

   Validar presupuesto:   No
   Validar crecimiento:   No
   Rangos:                (un solo rango 0 → ∞ con 0%)

   Motivo:                "Parametrización regular JUL-2026 vendedor"
```

### 7.10 Ejemplo completo: parametrización de Administrador de tienda JUL-2026

Para el cargo `102058 — Administrador(a) de tienda)`, donde la comisión se reparte entre toda la tienda:

```
   Cargo:           102058 — Administrador(a) de tienda
   Calendario:      Comisiones 2026
   Período:         JUL-2026

   Tipo de liquidación:   Global por tienda
   Tipo de distribución:  Proporcional entre colaboradores
   Afectación:            Novedades diarias

   % Línea:               0,75
   % Promoción:           0,53
   % Línea Estrategia:    0,22 (Corporativo, con descuento 0,53)

   Vigencia:              2026-06-21 → 2026-07-20

   Motivo:                "Parametrización regular JUL-2026 administrador"
```

> 💡 Note cómo cambia el tipo de distribución: aquí la comisión se reparte **proporcionalmente** según los días laborados de cada persona, porque la comisión de toda la tienda se reparte entre los que estuvieron activos.

---

## 8. Paso 4 — Verificar las fuentes de datos

> **Quién lo hace:** el **Profesional de Comisiones** o el **Administrador** (opcional).
> **Frecuencia:** recomendable antes de cada liquidación.

### 8.1 Por qué verificar las fuentes

Antes de liquidar, es buena práctica **confirmar que las fuentes externas están llegando bien**. Esto le permite detectar a tiempo problemas como:
- Falta de conexión con Midasoft.
- Datos de ventas que no llegaron.
- Empleados que no aparecen en la base.

### 8.2 Acceder al módulo

▶ **Procedimiento**

1. En el sidebar, haga clic en **Datos de origen**.

### 8.3 La pantalla de datos de origen

```
┌────────────────────────────────────────────────────────────────────────┐
│  Automatización Comisiones / Datos de origen (solo consulta)           │
├────────────────────────────────────────────────────────────────────────┤
│  Datos de origen (solo consulta)              [🔍 Consultar]            │
│                                                                        │
│  ⓘ Consulta directa a las fuentes externas en modo solo lectura:      │
│    ventas/comisiones POS desde INDICADORES (ICG) y base de empleados   │
│    desde Midasoft. Son los mismos datos que consumirá el motor de       │
│    liquidación.                                                        │
│                                                                        │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐                  │
│  │ 📊 Comisiones │  │ 📋 Comisiones │  │ 👥 Empleados  │ ◀ Pestañas   │
│  │ resumen (ICG) │  │ detalle (ICG) │  │ (Midasoft)    │               │
│  └──────────────┘  └──────────────┘  └──────────────┘                  │
│                                                                        │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────────┐       │
│  │ Fecha inicial│  │ Fecha final  │  │ Buscar en resultados     │       │
│  │ 2026-06-21   │  │ 2026-07-20   │  │ Filtrar filas...         │       │
│  └──────────────┘  └──────────────┘  └──────────────────────────┘       │
│                                                                        │
│  Comisiones resumen (ICG)                         18 filas                │
│  ┌────────┬────────────────┬────────────────────┐                      │
│  │ CO     │ TotalImporte   │ ComisionBancaria   │                      │
│  │ T01    │ $ 4,500,000    │ $ 67,500           │                      │
│  │ T02    │ $ 3,800,000    │ $ 57,000           │                      │
│  │ T03    │ $ 4,200,000    │ $ 63,000           │                      │
│  └────────┴────────────────┴────────────────────┘                      │
└────────────────────────────────────────────────────────────────────────┘
```

### 8.4 Consultar las ventas (ICG)

Hay dos pestañas para ICG:

- **Comisiones resumen (ICG):** muestra totales por tienda. Más compacto.
- **Comisiones detalle (ICG):** muestra cada transacción individual. Más detallado.

▶ **Procedimiento**

1. Haga clic en la pestaña que prefiera (resumen o detalle).
2. Escriba la **Fecha inicial** y **Fecha final** (formato AAAA-MM-DD).
3. (Opcional) Escriba texto en **Buscar en resultados** para filtrar.
4. Haga clic en **🔍 Consultar**.

✓ La tabla se llena con los datos. Puede revisar:
- ¿Aparecen todas las tiendas que deberían?
- ¿Los importes son razonables?
- ¿La comisión bancaria es coherente?

### 8.5 Consultar los empleados (Midasoft)

▶ **Procedimiento**

1. Haga clic en la pestaña **Empleados (Midasoft)**.
2. (No requiere fechas.)
3. (Opcional) Use el campo de búsqueda.
4. Haga clic en **🔍 Consultar**.

✓ Verá la lista de empleados. Confirme:
- ¿Aparecen los colaboradores que deberían estar activos este mes?
- ¿Los códigos de oficio son correctos?

### 8.6 Interpretar las columnas

**Pestaña "Comisiones resumen (ICG)":**

| Columna | Significado |
| --- | --- |
| `CO` | Código de la tienda. |
| `TotalImporte` | Suma de todas las ventas de la tienda en el período. |
| `ComisionBancaria` | Comisión bancaria del período (se descuenta de la venta neta). |

**Pestaña "Comisiones detalle (ICG)":**

| Columna | Significado |
| --- | --- |
| `Empresa` | `PERMODA`. |
| `Fecha` | Fecha de la venta. |
| `CO` | Código de la tienda. |
| `Codigo` | Código del producto. |
| `Cedula` | Cédula del vendedor. |
| `LineaICG` | `LÍNEA` / `LÍNEA ESTRATEGIA` / `PROMOCIÓN`. |
| `Uds` | Unidades vendidas. |
| `Importe` | Valor bruto (con IVA). |

**Pestaña "Empleados (Midasoft)":**

| Columna | Significado |
| --- | --- |
| `Empleado` | Código Midasoft del colaborador. |
| `Docto_Ident` | Cédula. |
| `F_Ingreso` | Fecha de ingreso. |
| `Fecha_Retiro` | Fecha de retiro (vacío si está activo). |
| `Codigo_Oficio` | Código del cargo (`102058`, `104608`, etc.). |
| `Ccosto` | Centro de costo. |

> 💡 **La tabla tiene un límite de 300 filas en pantalla** para que la aplicación no se ponga lenta. Si necesita más datos, exporte directamente desde ICG o Midasoft.

### 8.7 Qué hacer si algo no se ve bien

| Situación | Qué hacer |
| --- | --- |
| Una tienda no aparece | Verifique con el equipo de TI si ICG está reportando datos. |
| Un empleado no aparece | Verifique con RRHH si el alta en Midasoft está completa. |
| Los importes están vacíos | Verifique que la fecha final no exceda los 62 días desde la inicial (limitación de seguridad). |
| La aplicación muestra error 503 | La fuente externa no está disponible. Avise al equipo de soporte. |

---

## 9. Paso 5 — Ejecutar la liquidación del mes

> **Quién lo hace:** el **Profesional de Comisiones** o el **Administrador**.
> **Frecuencia:** una vez por mes, al cierre.

### 9.1 Cuándo se puede liquidar

Para poder liquidar un período, deben cumplirse **dos condiciones** en simultáneo:

1. ✅ El período **anterior** del mismo calendario debe estar 🔴 **Cerrado** (no basta con que esté 🔵 Liquidado).
2. ✅ Debe existir al menos una **parametrización vigente** para algún cargo del período.

Si falta alguna, la aplicación le mostrará el motivo exacto y no le dejará continuar.

### 9.2 Acceder al módulo

▶ **Procedimiento**

1. En el sidebar, haga clic en **Liquidación automática**.

### 9.3 La pantalla de liquidación

```
┌────────────────────────────────────────────────────────────────────────┐
│  Automatización Comisiones / Liquidación automática                    │
├────────────────────────────────────────────────────────────────────────┤
│  Liquidación automática                  [Actualizar][▶ Iniciar liq.]   │
│                                                                        │
│  Selección de período                                                  │
│  ┌──────────────────┐  ┌──────────────────────────────────────────┐  │
│  │ Calendario       │  │ Período (estado Abierto)                 │  │
│  │ Comisiones 2026▼│  │ JUL-2026 (2026-06-21 → 2026-07-20)    ▼ │  │
│  └──────────────────┘  └──────────────────────────────────────────┘  │
│                                                                        │
│  ✓ Elegible para liquidación: período anterior cerrado ✓               │
│    parametrización vigente ✓                                          │
│                                                                        │
└────────────────────────────────────────────────────────────────────────┘
```

### 9.4 Verificar la elegibilidad

▶ **Procedimiento**

1. En el campo **Calendario**, seleccione el año (ej. `Comisiones 2026`).
2. En el campo **Período**, seleccione el mes. Solo aparecerán los que estén 🟢 **Abierto**.
3. Observe el panel de elegibilidad que aparece debajo:

```
   ✓ Elegible para liquidación: período anterior cerrado ✓
     parametrización vigente ✓
```

✓ **Si el panel es verde**, puede liquidar.

```
   ✗ El período anterior del calendario no está Cerrado.
```

✗ **Si el panel es rojo**, la aplicación le dice qué falta. Resuélvalo antes de continuar.

### 9.5 Ejecutar la liquidación

▶ **Procedimiento**

1. Asegúrese de que el panel de elegibilidad está en verde.
2. Haga clic en **▶ Iniciar liquidación**.
3. La aplicación le mostrará un mensaje de confirmación:

```
   ┌────────────────────────────────────────────────────┐
   │ ¿Iniciar la liquidación del período seleccionado?   │
   │                                                    │
   │ Esta operación consume las fuentes externas y no   │
   │ se puede deshacer hasta que se ejecute de nuevo.   │
   │                                                    │
   │              [ Aceptar ]    [ Cancelar ]            │
   └────────────────────────────────────────────────────┘
```

4. Lea el mensaje y haga clic en **Aceptar**.

5. La aplicación ejecuta el cálculo. Esto toma entre **5 y 30 segundos** según el tamaño del período. Durante este tiempo verá el período en estado 🟡 **En curso**.

```
   Procesando la liquidación...
   ┌────────────────────────────────────┐
   │  🟡 En curso                       │
   │                                    │
   │  ⏱ Calculando...                   │
   └────────────────────────────────────┘
```

✓ Cuando termina, el resultado aparece automáticamente en la misma pantalla.

### 9.6 Entender el resultado

Una vez finalizada, la liquidación se muestra en una tarjeta de resultados:

```
┌────────────────────────────────────────────────────────────────────────┐
│  Liquidación — JUL-2026                              [🔵 LIQUIDADO]     │
├────────────────────────────────────────────────────────────────────────┤
│  ┌────────────┐  ┌────────┐  ┌─────────────────┐  ┌────────────────┐   │
│  │ Colaborad. │  │Tiendas │  │ Comisión total  │  │ Ejecutada por  │   │
│  │            │  │        │  │                 │  │                │   │
│  │     38     │  │   12   │  │  $ 4,250,000    │  │ maria.gonzalez │   │
│  └────────────┘  └────────┘  └─────────────────┘  └────────────────┘   │
│                                                                        │
│  [🔒 Cerrar período]                                                   │
└────────────────────────────────────────────────────────────────────────┘
```

| Tarjeta | Significado |
| --- | --- |
| **Colaboradores** | Cuántas personas fueron liquidadas. |
| **Tiendas** | Cuántas tiendas distintas aparecen en la liquidación. |
| **Comisión total** | Suma total de la comisión del mes. |
| **Ejecutada por** | Su usuario (quien ejecutó la liquidación). |

### 9.7 Ver el historial de liquidaciones

Más abajo, en la misma pantalla, está la tabla de **Historial de liquidaciones**:

```
   Historial de liquidaciones
   ┌─────────┬────────┬────────┬─────────────┬────────────┬──────┬──────┐
   │ Período │ Estado │Colab.  │ Comisión    │ Ejecutada  │ Inic.│ Archivo│
   │ MAY-2026│ 🔵 Liq.│ 36     │ $ 3,900,000 │ maria.g.   │ 30/5 │ [📥] │
   │ JUN-2026│ 🔵 Liq.│ 37     │ $ 4,100,000 │ maria.g.   │ 30/6 │ [📥] │
   │ JUL-2026│ 🔵 Liq.│ 38     │ $ 4,250,000 │ maria.g.   │ 31/7 │ [📥] │
   │ AGO-2026│ 🟡 EnC.│ —      │ —           │ maria.g.   │ 31/7 │ —    │
   └─────────┴────────┴────────┴─────────────┴────────────┴──────┴──────┘
```

El botón **📥 Plano** en la última columna le permite descargar el archivo plano de nómina (ver [Paso 8](#12-paso-8--entregar-el-archivo-a-nómina)).

### 9.8 Si la liquidación queda en ERROR

Si algo falla durante el cálculo, la liquidación aparece en estado 🟤 **ERROR**:

```
   ┌────────────────────────────────────────┐
   │  🟤 ERROR                              │
   │                                        │
   │  [Detalles del error]                  │
   └────────────────────────────────────────┘
```

Esto **no bloquea el período**: puede volver a intentarlo cuantas veces quiera hasta que funcione. Revise la [sección 17](#17-errores-frecuentes-al-liquidar) para ver los errores más comunes y cómo solucionarlos.

### 9.9 Reintentar una liquidación

Si la primera ejecución falló, simplemente:

▶ **Procedimiento**

1. Asegúrese de que el período sigue 🟢 **Abierto** (o ya liquidado pero sin cerrar).
2. Corrija la causa del error (ver [sección 17](#17-errores-frecuentes-al-liquidar)).
3. Haga clic en **▶ Iniciar liquidación** de nuevo.

> 📌 Cada ejecución crea un nuevo registro en el historial. La aplicación no sobrescribe la anterior. Use esto para comparar.

---

## 10. Paso 6 — Validar el resultado

> **Quién lo hace:** el **Profesional de Comisiones** o el **Administrador**.
> **Cuándo:** inmediatamente después de liquidar, antes de cerrar.

### 10.1 Por qué validar

Una liquidación es **definitiva** una vez que se cierra el período. Por eso, antes de cerrar, debe verificar que el cálculo es correcto. La aplicación le permite hacer drill-down (zoom) hasta el detalle de cada colaborador.

### 10.2 Acceder al módulo

▶ **Procedimiento**

1. En el sidebar, haga clic en **Trazabilidad y salida**.

### 10.3 La pantalla de trazabilidad

```
┌────────────────────────────────────────────────────────────────────────┐
│  Automatización Comisiones / Trazabilidad y salida                     │
├────────────────────────────────────────────────────────────────────────┤
│  Trazabilidad y salida                       [🔄 Consultar] [📥 CSV]     │
│                                                                        │
│  🔒 Esta vista es de solo lectura sobre liquidaciones LIQUIDADO o     │
│     CERRADO. Cada consulta queda registrada en la bitácora de          │
│     auditoría.                                                        │
│                                                                        │
│  ┌─── Filtros ─────────────────────────────────────────────────┐      │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐  │      │
│  │  │ Calendario  │  │ Período     │  │ Tipo liquidación    │  │      │
│  │  │ Todos    ▼  │  │ Todos    ▼  │  │ Todos           ▼  │  │      │
│  │  └─────────────┘  └─────────────┘  └─────────────────────┘  │      │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐  │      │
│  │  │ Cargo       │  │ Comis. mín. │  │ Comis. máx.         │  │      │
│  │  │ 104608      │  │             │  │                     │  │      │
│  │  └─────────────┘  └─────────────┘  └─────────────────────┘  │      │
│  └──────────────────────────────────────────────────────────────┘      │
│                                                                        │
│  Resumen de liquidaciones                                  3 liquid. │
│  ┌─────────┬────────┬────────┬────────┬─────────────┬──────┐         │
│  │ Período │ Estado │Colab.  │Tiendas │ Comisión    │      │         │
│  │ MAY-2026│ 🔵 Liq.│ 36     │ 12     │ $ 3,900,000 │[👁 Ver]│       │
│  │ JUN-2026│ 🔵 Liq.│ 37     │ 12     │ $ 4,100,000 │[👁 Ver]│       │
│  │ JUL-2026│ 🔵 Liq.│ 38     │ 12     │ $ 4,250,000 │[👁 Ver]│       │
│  └─────────┴────────┴────────┴────────┴─────────────┴──────┘         │
└────────────────────────────────────────────────────────────────────────┘
```

### 10.4 Buscar la liquidación que quiere validar

▶ **Procedimiento**

1. Configure los filtros según lo que quiera buscar (todos son opcionales):
   - **Calendario** — filtre por año.
   - **Período** — filtre por mes.
   - **Tipo liquidación** — Individual / Global tienda / Global grupo.
   - **Cargo (Midasoft)** — filtre por un cargo específico (ej. `104608`).
   - **Comisión mín / máx** — rango en pesos.
2. Haga clic en **🔄 Consultar**.

✓ La tabla de **Resumen de liquidaciones** muestra las liquidaciones que coinciden con los filtros.

> 💡 Si no aplica ningún filtro, verá todas las liquidaciones del año.

### 10.5 Ver el detalle por colaborador

▶ **Procedimiento**

1. En la fila de la liquidación que le interesa, haga clic en el botón **👁 Ver colaboradores**.

```
   ┌─────────────────────────────────────────────────────────────────────┐
   │ Detalle por colaboradores — JUL-2026              [× Cerrar]        │
   ├─────────────────────────────────────────────────────────────────────┤
   │  ┌────────┬──────┬───────┬────────┬──────┬───────┬──────┬──────┐  │
   │  │Colab.  │Cargo │Tienda │V.bruta │S/IVA │C.ban. │V.neta│Com.  │  │
   │  ├────────┼──────┼───────┼────────┼──────┼───────┼──────┼──────┤  │
   │  │▶123456 │104608│ T01   │1.500K  │1.260K│ 19K   │1.241K│ 31K  │  │
   │  │▶789012 │104608│ T01   │1.400K  │1.176K│ 17K   │1.159K│ 29K  │  │
   │  │▶345678 │102058│ T01   │ 0      │   0  │  0    │   0  │  0   │  │
   │  └────────┴──────┴───────┴────────┴──────┴───────┴──────┴──────┘  │
   └─────────────────────────────────────────────────────────────────────┘
```

2. Verá una lista de todos los colaboradores liquidados. Para ver el detalle de uno:

▶ **Procedimiento (drill-down)**

1. Haga clic en la fila del colaborador (en cualquier columna).

2. La fila se expande mostrando:

```
   ┌─────────────────────────────────────────────────────────────────────┐
   │  ▶ 123456                                                          │
   │  104608 │ T01 │ $1.500K │ $1.260K │ $19K │ $1.241K │ 2,5% │ $31K  │
   │  ┌─────────────────────────────────────────────────────────────────┐│
   │  │ Subperíodo:  2026-06-21 → 2026-07-20    [INICIAL]              ││
   │  │ Días laborados:  30    Días excluidos:  0                      ││
   │  │                                                                 ││
   │  │ Parametrización:  Individual · Individual                      ││
   │  │                  Línea 2,5% / Prom 1,8%                         ││
   │  │                  Estrategia: CORPORATIVO (-0,5%)                ││
   │  │                                                                 ││
   │  │ ┌─────────┬──────┬──────┬──────┬──────┬──────┬──────┐          ││
   │  │ │Tipo vta │V.bru │S/IVA │C.ban │V.net│   %  │Com.  │          ││
   │  │ │LINEA    │1.0M  │ 840K │ 12K  │ 828K│ 2,5% │ 21K  │          ││
   │  │ │PROMOC.  │ 350K │ 294K │  4K  │ 290K│ 1,8% │  5K  │          ││
   │  │ │LINEA ES │ 150K │ 126K │  3K  │ 123K│ 2,0% │  2K  │          ││
   │  │ └─────────┴──────┴──────┴──────┴──────┴──────┴──────┘          ││
   │  └─────────────────────────────────────────────────────────────────┘│
   └─────────────────────────────────────────────────────────────────────┘
```

**Interpretación del drill-down:**

| Sección | Qué le dice |
| --- | --- |
| **Subperíodo** | El tramo de tiempo que el cálculo asignó al colaborador. Si cambió de cargo o de centro de costo, vería varios subperíodos. |
| **Días laborados / excluidos** | Días que efectivamente trabajó. Si hay excluidos, el motivo aparece (ej. "Vacaciones", "Incapacidad"). |
| **Parametrización** | La regla que se aplicó: tipo de liquidación, distribución, % por tipo, estrategia. Esta es la "foto" del momento en que se liquidó, no la parametrización actual. |
| **Desglose por tipo de venta** | Cuánto vendió y cuánto ganó por cada tipo (Línea, Promoción, Línea Estrategia). |

### 10.6 Cuándo preocuparse

| Lo que ve | Qué significa | Acción |
| --- | --- | --- |
| Comisión = $0 | El colaborador no tuvo ventas en el período, o no estaba activo. | Verifique con Midasoft. |
| Días excluidos = 0 pero días laborados < 30 | El colaborador no estuvo todo el mes (ingresó o se retiró durante el período). | Verifique fechas de ingreso / retiro. |
| Motivo de exclusión = "Vacaciones" | El colaborador tomó vacaciones que se descuentan. | No requiere acción; el sistema lo gestionó automáticamente. |
| Motivo de exclusión = "Licencia de luto" | NO se descuenta: las excepciones legales se cuentan como laboradas. | No requiere acción. |
| La comisión es muy baja | Revise si la comisión bancaria se aplicó correctamente (ver columna "Com. bancaria"). | Si es muy alta, la comisión neta puede quedar negativa. |

### 10.7 Exportar a Excel/CSV

Si quiere analizar los datos en Excel, use la exportación.

▶ **Procedimiento**

1. Con la tabla de detalle abierta, haga clic en **📥 Exportar CSV** (esquina superior derecha).
2. El navegador descargará un archivo `trazabilidad_<id>.csv`.
3. Ábralo con Excel.

> 💡 El archivo CSV usa punto y coma (`;`) como separador, así que Excel lo abre directamente sin necesidad de configuración adicional.

---

## 11. Paso 7 — Cerrar el período

> **Quién lo hace:** el **Profesional de Comisiones** o el **Administrador**.
> **Cuándo:** una vez que la liquidación fue validada y aprobada.

### 11.1 Qué significa "cerrar"

"Cerrar" un período es la **confirmación definitiva** de que la liquidación es correcta y no se va a modificar. Después de cerrar:

- El período pasa a 🔴 **Cerrado** (no se puede editar ni liquidar de nuevo).
- El nuevo mes se puede liquidar (porque se libera la restricción del "período anterior cerrado").

> ⚠️ **Cerrar es IRREVERSIBLE.** Antes de cerrar, asegúrese de haber validado todo y de haber descargado el archivo de nómina.

### 11.2 Antes de cerrar

Confirme que tiene todo listo:

- [ ] Ya validó el resultado en la pantalla de **Trazabilidad** (Paso 6).
- [ ] Ya descargó el archivo plano de nómina (Paso 8, lo puede hacer también después).
- [ ] El equipo de compensación está de acuerdo con los totales.
- [ ] El equipo de nómina está avisado de que viene el archivo.

### 11.3 Cómo cerrar

▶ **Procedimiento**

1. Vaya a **Liquidación automática**.
2. Seleccione el período a cerrar (debe estar 🔵 **Liquidado**, no 🟡 En curso).
3. En la tarjeta de resultado, haga clic en **🔒 Cerrar período**.

```
   ┌──────────────────────────────────────────────────────────┐
   │ ¿Cerrar el período? Esta acción es irreversible.         │
   │                                                          │
   │            [ Aceptar ]    [ Cancelar ]                    │
   └──────────────────────────────────────────────────────────┘
```

4. Confirme la operación.

✓ El período cambia a 🔴 **Cerrado**. Ya no se puede modificar.

### 11.4 Qué pasa si necesita recalcular después de cerrar

**No es posible** desde la aplicación. Una vez cerrado, el resultado es definitivo.

Si necesita un ajuste, las opciones son:
- Contactar al equipo de soporte para que gestione una excepción.
- Crear un período adicional (no recomendado, crea complejidad administrativa).

> 💡 Por eso es tan importante validar **antes** de cerrar.

---

## 12. Paso 8 — Entregar el archivo a nómina

> **Quién lo hace:** el **Profesional de Comisiones** o el **Administrador**.

### 12.1 Qué es el archivo plano

Es un archivo de texto con la información lista para que el sistema de nómina procese el pago. Tiene 37 columnas separadas por punto y coma (`;`).

### 12.2 Cómo descargarlo

▶ **Procedimiento**

1. Vaya a **Liquidación automática**.
2. En la sección **Historial de liquidaciones**, ubique la liquidación correspondiente.
3. Solo las liquidaciones 🔵 **Liquidado** o 🔴 **Cerrado** tienen el botón **📥 Plano**.
4. Haga clic en **📥 Plano**.
5. El navegador descargará un archivo `plano_<código>.txt`.

```
   ┌──────────────────────────────────────────────────────────────────┐
   │  ¿Desea descargar plano_JUL-2026.txt?                            │
   │                                                                  │
   │            [ Guardar ]    [ Cancelar ]                            │
   └──────────────────────────────────────────────────────────────────┘
```

### 12.3 Cómo se ve el archivo

Las primeras líneas se ven así (ejemplo abreviado):

```
   EMPLEADO;CONCEPTO;HORAS;VALOR;CANTIDAD;CCOSTO;N_PRESTAMO;LABOR;SUERTE;...
   00200470;A201;0;968465;0;T01;;;;...
   00200480;A201;0;1245800;0;T02;;;;...
   00200512;A201;0;485320;0;T01;;;;...
   ...
```

> 💡 Si Excel le pregunta por la codificación al abrir, elija **UTF-8**.

### 12.4 Qué campos mirar antes de enviar

| Campo | Qué revisar |
| --- | --- |
| `EMPLEADO` | Es el código Midasoft del colaborador (no la cédula). |
| `CONCEPTO` | Siempre es `A201` (concepto de comisión). |
| `VALOR` | La comisión del colaborador, redondeada al entero. |
| `CCOSTO` | El código de tienda. |
| `OFICIO` | El código del cargo. |

### 12.5 Cómo enviarlo al equipo de nómina

▶ **Procedimiento**

1. Renombre el archivo si quiere seguir una convención interna (ej. `Comisiones_JUL-2026.txt`).
2. Envíelo al equipo de nómina por el canal habitual (correo, SharePoint, etc.).
3. Espere la confirmación de recibido.

> 📌 **Conserve una copia** del archivo en su equipo como respaldo. La aplicación también lo almacena en su servidor, pero tener una copia local es buena práctica.

---

# PARTE 2 · Tareas del Administrador

> Esta parte está dirigida únicamente al **Administrador de la aplicación**. Si su rol es Profesional de Comisiones, puede saltarla.

## 13. Cargar presupuestos y crecimiento

### 13.1 Qué son los presupuestos y el crecimiento

- **Presupuesto** es la **meta de ventas** que se espera que cada colaborador (o tienda o grupo) alcance en un período. Se usa para validar el cumplimiento.
- **Crecimiento** es la **variación** de las ventas de un período contra el anterior. Se usa para validar la mejora.

Ambas son tablas auxiliares que el motor de liquidación puede consumir (cuando esté activa la integración completa).

### 13.2 Tipos de presupuesto

| Tipo | Significado | Ejemplo |
| --- | --- | --- |
| `INDIVIDUAL` | Por colaborador. | "Juan debe vender $ 30M este mes." |
| `TIENDA` | Por tienda completa. | "La tienda T01 debe vender $ 250M este mes." |
| `GRUPO` | Por grupo de tiendas. | "La zona norte debe vender $ 800M este mes." |

### 13.3 Carga actual

> 📌 La carga de presupuestos y rangos se realiza actualmente a través de la **API REST** del backend. Si necesita hacerlo, contacte al equipo de soporte para que le proporcione los endpoints y el formato de los datos.

Una vez cargados, usted puede ver las tablas en la pantalla de **Parametrización de cargos**, en la sección inferior "Tablas de presupuesto y crecimiento (referencia)" al editar una parametrización existente.

```
   Tablas de presupuesto y crecimiento (referencia)
   ────────────────────────────────────────────────
   💲 Presupuestos (3)
   ┌──────────┬──────────┬──────────────┐
   │ Tienda  │ Tipo     │ Valor (COP)  │
   │ T01     │TIENDA    │ $ 250,000,000│
   │ T02     │TIENDA    │ $ 280,000,000│
   │ Global  │GRUPO     │$ 1,200,000,000│
   └──────────┴──────────┴──────────────┘

   📊 Rangos por cumplimiento de presupuesto (5)
   ┌───────────┬──────────┬─────────┬─────────┐
   │ Desde (%) │ Hasta(%) │ % Línea │ % Prom. │
   │ 80        │ 90       │ 0.29    │ 0.20    │
   │ 90        │ 95       │ 0.48    │ 0.34    │
   │ 95        │ 100      │ 0.60    │ 0.42    │
   │ 100       │ ∞        │ 0.72    │ 0.50    │
   └───────────┴──────────┴─────────┴─────────┘
```

---

## 14. Activar el modo de trabajo sin conexión

### 14.1 Qué es el modo "sin conexión" (mock)

La aplicación puede trabajar **sin acceso a las fuentes externas reales** (ICG y Midasoft) usando datos de prueba almacenados en una carpeta local llamada `Datatest/`. Esto es útil para:

- **Capacitar** a nuevos profesionales sin tocar datos reales.
- **Probar** nuevas parametrizaciones sin afectar la producción.
- **Trabajar en oficinas** con conexión limitada a la intranet de Permoda.

### 14.2 Cómo se activa

El modo se controla con la variable de entorno `FUENTES_MODO` en el archivo de configuración del backend (`.env`).

| Valor | Significado |
| --- | --- |
| `mock` | La aplicación usa datos de prueba (no toca ICG ni Midasoft). |
| `real` | La aplicación se conecta a ICG y Midasoft. |

> ⚠️ Cambiar el modo requiere **reiniciar el backend**. No afecta a la base de datos propia de la aplicación, pero sí al origen de los datos que se procesan.

### 14.3 Quién puede activarlo

Solo el **Administrador del sistema** (con acceso al servidor donde corre el backend) puede modificar el archivo `.env`. Si necesita el modo mock, solicítelo al equipo de soporte.

---

## 15. Auditoría y reportes

### 15.1 Qué se audita automáticamente

La aplicación registra automáticamente:

| Tipo de cambio | Dónde queda | Qué contiene |
| --- | --- | --- |
| Cambios en calendarios, períodos y parametrizaciones | Tabla `log_cambios_estructurales` | Quién, cuándo, qué cambió, motivo. |
| Cada paso del motor de liquidación | Tabla `liquidacion_log` | Inicio, consumo ICG, normalización, consumo Midasoft, cálculo, archivo plano, etc. |
| Cada consulta en Trazabilidad | Tabla `auditoria_consulta` | Quién consultó, qué filtros, cuándo. |
| Cada inicio de sesión | Logs del backend | Email, fecha, hora, IP. |

### 15.2 Cómo consultar los logs

Para reportes avanzados (logs de auditoría, logs de un paso específico del motor), contacte al equipo de soporte técnico. Ellos pueden:

- Generar consultas SQL sobre las tablas de auditoría.
- Exportar a Excel.
- Filtrar por usuario, período, fecha, etc.

> 📌 La auditoría es **solo de consulta**; usted no puede modificar los registros.

---

## 16. Gestión de usuarios

### 16.1 Usuarios actuales del sistema

Por defecto, la aplicación trae dos usuarios preconfigurados:

| Email | Contraseña | Rol |
| --- | --- | --- |
| `admin@permoda.com` | `Admin123!` (por defecto) | **Administrador** |
| `comisiones@permoda.com` | `Comisiones123!` (por defecto) | **Profesional de Comisiones** |

> ⚠️ **En producción, cambie inmediatamente las contraseñas por defecto** y desactive el repositorio de usuarios en memoria (reemplace por la tabla de usuarios en BD).

### 16.2 Cambio de contraseña de un usuario

▶ **Procedimiento (modo actual)**

1. Pida al equipo de soporte técnico que modifique la contraseña.
2. El equipo edita el archivo `users-mock.repository.ts` (en desarrollo) o la tabla de usuarios en la BD (en producción).
3. El equipo reinicia el backend.

> 💡 La contraseña se almacena con **bcrypt** (cifrado), nunca en texto plano.

### 16.3 Creación de nuevos usuarios

Actualmente la creación de usuarios no tiene interfaz propia. Solicite al equipo de soporte la creación de nuevos usuarios indicando:

- Email.
- Nombre completo.
- Rol (`ADMINISTRADOR` o `PROFESIONAL_COMISIONES`).
- Contraseña inicial (la persona la deberá cambiar en su primer inicio de sesión).

---

# PARTE 3 · Resolución de problemas

## 17. Errores frecuentes al liquidar

### 17.1 La liquidación queda en 🟤 ERROR

| Causa probable | Qué hacer |
| --- | --- |
| No hay empleados activos en Midasoft para el período. | Verifique en **Datos de origen → Empleados (Midasoft)** que aparezcan colaboradores con `F_Ingreso ≤ fecha_inicio_periodo` y sin `Fecha_Retiro` (o con `Fecha_Retiro > fecha_inicio_periodo`). |
| No hay ventas en ICG para el período. | Verifique en **Datos de origen → Comisiones resumen (ICG)** que aparezcan tiendas con importes. |
| Las cédulas de ICG no coinciden con las de Midasoft. | Es un problema de fuente de datos. Contacte al equipo de soporte. |
| La conexión con ICG o Midasoft se cayó durante el cálculo. | Espere unos minutos y vuelva a intentar. Si persiste, contacte al soporte. |
| La fecha del período es incorrecta (ej. fin < inicio). | Verifique en **Calendarios y períodos** que las fechas del período estén bien. |

### 17.2 "El período anterior del calendario no está Cerrado"

Esto significa que el período previo del mismo calendario sigue en 🔵 **Liquidado** (no se ha cerrado).

▶ **Procedimiento**

1. Vaya a **Liquidación automática**.
2. Seleccione el período previo (ej. si quiere liquidar JUL-2026, vaya a JUN-2026).
3. Valide el resultado (Paso 6).
4. Cierre el período previo (Paso 7).
5. Vuelva a intentar la liquidación del mes actual.

### 17.3 "No existe parametrización vigente para este período"

Esto significa que falta crear o activar al menos una parametrización para el período.

▶ **Procedimiento**

1. Vaya a **Parametrización de cargos**.
2. Filtre por el período que quiere liquidar.
3. Si no hay parametrizaciones, cree al menos una (Paso 3).
4. Vuelva a intentar la liquidación.

### 17.4 La comisión total es $0

| Causa probable | Qué hacer |
| --- | --- |
| No hay ventas para el período. | Verifique en Datos de origen. |
| Los vendedores no tienen empleado asociado en Midasoft. | Verifique que las cédulas coincidan. |
| La parametrización está mal configurada. | Revise que tenga %s y reglas correctos. |

### 17.5 La comisión es negativa o muy alta

Esto suele deberse a que la **comisión bancaria** es mayor que las ventas netas. Revise la pestaña "Comisiones detalle" en Trazabilidad para ver el valor de la comisión bancaria asignada a cada tipo de venta.

---

## 18. Errores frecuentes al parametrizar

### 18.1 "Ya existe una parametrización activa para el cargo X en el período Y"

Esto significa que ya tiene una parametrización vigente para ese cargo y período. Soluciones:

1. **Editar** la parametrización existente (recomendado).
2. **Desactivar** la existente y crear una nueva.
3. **Cambiar las vigencias** de una de las dos para que no se solapen.

### 18.2 "La vigencia se solapa con la parametrización Z"

Si crea una parametrización con vigencias que se cruzan con otra activa del mismo cargo, la aplicación le advertirá. Ajuste la fecha de inicio o fin para que no haya solapamiento.

### 18.3 "Liquidación Individual solo admite Distribución Individual"

Si eligió "Individual por colaborador" como tipo de liquidación, la única distribución permitida es "Individual". Cambie el tipo de distribución.

### 18.4 "Los rangos deben ser continuos"

Sus rangos tienen un hueco o se solapan. Verifique que el "Hasta" de un rango sea igual al "Desde" del siguiente. Y que solo el último rango tenga "Hasta" vacío (= infinito).

### 18.5 "El cargo X no existe en el catálogo oficial"

Está usando un código de oficio que no está en el catálogo. Use uno de los 11 oficiales (ver [Anexo A](#anexo-a--catálogo-completo-de-cargos-midasoft)).

### 18.6 El formulario no me deja guardar (no muestra error específico)

Revise que haya completado:
- ✓ Cargo.
- ✓ Período.
- ✓ Al menos un rango (con comisión).
- ✓ Motivo del cambio (texto).

Si todo está completo y aún así no guarda, contacte al soporte.

---

## 19. Preguntas frecuentes

### 19.1 Sobre el ciclo mensual

**P: ¿Puedo ejecutar la liquidación más de una vez para el mismo mes?**
R: Sí, cada ejecución crea un nuevo registro en el historial. La aplicación no sobrescribe. Si quiere reemplazar el resultado, simplemente ejecute de nuevo.

**P: ¿Qué pasa si modifico la parametrización después de liquidar?**
R: La liquidación ya ejecutada **no se ve afectada**. Ella conserva el "snapshot" (la foto) de la parametrización que se usó en su momento. Si quiere que el cambio aplique, debe ejecutar una nueva liquidación.

**P: ¿Puedo editar una liquidación ya cerrada?**
R: No. Una vez cerrada, es definitiva. Si necesita un ajuste, debe solicitar una excepción al equipo de soporte.

**P: ¿Cuándo es el mejor momento del mes para liquidar?**
R: Lo más común es ejecutar la liquidación los primeros días del mes siguiente (ej. el 1 o 2 de julio para el período JUN-2026), una vez que ICG y Midasoft ya tengan los datos completos del mes anterior.

### 19.2 Sobre los datos

**P: ¿De dónde vienen los datos de ventas?**
R: Del sistema **ICG**, vía el servidor SQL Server `INDICADORES` (10.1.5.61).

**P: ¿De dónde vienen los datos de empleados?**
R: Del sistema **Midasoft** (REST API).

**P: ¿La aplicación modifica las ventas o los empleados?**
R: **No.** La aplicación solo lee de ICG y Midasoft. Nunca escribe en ellos.

**P: ¿Qué pasa si Midasoft no está disponible?**
R: La aplicación no puede liquidar. Le mostrará un error 503. Espere a que Midasoft vuelva a estar disponible y vuelva a intentar.

### 19.3 Sobre los cargos y las reglas

**P: ¿Puedo crear un nuevo cargo?**
R: **No.** El catálogo viene de Midasoft. Si Midasoft añade un nuevo cargo, el Administrador de la aplicación lo incorporará en una actualización.

**P: ¿Por qué el mismo cargo paga distinto en dos meses?**
R: Porque puede haber parametrizaciones distintas con vigencias diferentes. Por ejemplo, en enero el Vendedor paga 2,0 % y en febrero paga 2,5 % (por una campaña puntual). Cada parametrización tiene su propia vigencia.

**P: ¿Cómo sé qué parametrización se usó en una liquidación?**
R: En la pantalla de Trazabilidad, al hacer drill-down sobre un colaborador, la sección "Parametrización" muestra la regla aplicada (la "foto" del momento de la liquidación).

### 19.4 Sobre los archivos de nómina

**P: ¿Qué hace el archivo de nómina?**
R: Contiene la información de la comisión de cada colaborador, lista para que el sistema de nómina la procese.

**P: ¿Cada cuánto se genera?**
R: Una vez por mes, al cierre de cada período.

**P: ¿Qué pasa si Midasoft carga empleados nuevos después de la liquidación?**
R: La liquidación ya ejecutada no incluye a esos empleados. Si quiere incluirlos, debe ejecutar una nueva liquidación (lo cual requerirá primero reabrir el período, que solo puede hacer el equipo de soporte).

---

# Anexos

## Anexo A · Catálogo completo de cargos Midasoft

| Código | Cargo | Tipo de afectación | Notas |
| --- | --- | --- | --- |
| `102058` | Administrador(a) de tienda | Novedades | Cargo gerencial de tienda. |
| `102110` | Coadministrador(a) de tienda | Novedades | Segundo al mando. |
| `102502` | Partner comercial | Novedades | Socio comercial. |
| `102571` | Gestor comercial | Novedades | Gestiona equipo de ventas. |
| `104222` | Cajero(a) TC | Novedades | Tiempo completo. |
| `104223` | Cajero(a) 36H | Novedades | 36 horas semanales. |
| `104275` | Asesor(a) de ventas 48H | **Horas laboradas** | 48 horas semanales. |
| `104341` | Asesor(a) de ventas 36H | **Horas laboradas** | 36 horas semanales. |
| `104517` | Staff comercial 36H | Novedades | Personal de apoyo 36h. |
| `104518` | Staff comercial TC | Novedades | Personal de apoyo tiempo completo. |
| `104608` | Vendedor(a) | Novedades | Vendedor de piso. |

## Anexo B · Tabla de rangos de Staff Comercial

Esta tabla se usa como referencia para los cargos `104517` y `104518` (Staff comercial 36H y TC). La comisión se ajusta según el cumplimiento del presupuesto:

| Rango de cumplimiento (% del presupuesto) | % Línea | % Promoción |
| --- | --- | --- |
| 0 % a 79,99 % | 0 % | 0 % |
| 80 % a 89,99 % | 0,29 % | 0,20 % |
| 90 % a 94,99 % | 0,48 % | 0,34 % |
| 95 % a 99,99 % | 0,60 % | 0,42 % |
| 100 % o más | 0,72 % | 0,50 % |

## Anexo C · Glosario de términos

| Término | Definición en lenguaje de negocio |
| --- | --- |
| **Afectación** | Mecanismo por el cual se determina qué días se cuentan como laborados. Hay dos: por Novedades (se restan vacaciones, etc.) o por Horas (se suman las marcaciones). |
| **Archivo plano de nómina** | Archivo de texto con 37 columnas y separador `;` que se envía a nómina. |
| **Calendario** | El conjunto de 12 meses (períodos) de un año. |
| **Cargo** | Rol del colaborador en Midasoft. Solo se pueden usar los 11 oficiales. |
| **Cesantías, prima, etc.** | Prestaciones sociales que **no** se calculan en esta aplicación. |
| **Comisión** | Pago variable al colaborador por ventas. |
| **Comisión bancaria** | Lo que el banco cobra por las transacciones con tarjeta. Se descuenta de la venta neta. |
| **Distribución (Individual / Proporcional)** | Cómo se reparte la comisión entre los miembros de un grupo (la tienda, por ejemplo). |
| **Drill-down** | Zoom desde el resumen al detalle. |
| **Estado de un período** | Abierto → En curso → Liquidado → Cerrado. |
| **ICG** | Sistema comercial del que vienen las ventas. |
| **IVA** | Impuesto al valor agregado. La aplicación lo descuenta dividiendo entre 1,19. |
| **Línea** | Tipo de venta estándar. |
| **Línea Estrategia** | Tipo de venta con comisión diferente (productos clave). |
| **Liquidación** | El proceso mensual de calcular las comisiones. |
| **Midasoft** | Sistema de RRHH del que vienen los empleados. |
| **Mock** | Modo de trabajo con datos de prueba (sin conexión a ICG/Midasoft). |
| **Novedades** | Incidencias del colaborador: Vacaciones, Incapacidad, Luto, etc. |
| **Parametrización** | La configuración de comisiones de un cargo en un período. |
| **Período** | Un mes dentro de un calendario. |
| **Promoción** | Tipo de venta con descuento comercial. |
| **Rangos por cumplimiento** | Tabla que define % de comisión según % de cumplimiento de presupuesto. |
| **Snapshot** | "Foto" inmutable de la parametrización al momento de liquidar. |
| **Subperíodo** | Tramo de un período generado por un cambio de cargo o centro de costo. |
| **Tipo de liquidación** | Cómo se calcula la comisión: por persona, por tienda, o por grupo de tiendas. |
| **Vigencia** | Rango de fechas en que aplica una parametrización. |

## Anexo D · Contactos de soporte

| Necesidad | Contacto |
| --- | --- |
| Problemas técnicos con la aplicación | Equipo de soporte TI (correo / extensión) |
| Dudas sobre reglas de negocio de comisiones | Líder de Compensación |
| Cambios en la parametrización de un cargo | Líder de Compensación → Profesional de Comisiones |
| Gestión de usuarios y permisos | Administrador de la aplicación |
| Solicitudes de nuevas funcionalidades | Comité de producto |
| Incidencias en ICG / Midasoft | Equipo de TI responsable de esas plataformas |

> 📌 Al reportar un problema, incluya: **captura de pantalla del error**, pasos para reproducirlo, navegador y sistema operativo, su usuario y rol.

---

**Fin de la guía.**
