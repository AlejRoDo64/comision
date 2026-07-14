export const GRUPOS_TIENDAS_SEED = [
  { codigo: 'GT-BOG-C', nombre: 'Bogotá Centro' },
  { codigo: 'GT-BOG-N', nombre: 'Bogotá Norte' },
  { codigo: 'GT-MED',   nombre: 'Medellín' },
];

export const TIENDAS_SEED = [
  { codigo: 'T001', nombre: 'Santa Fe',            codigoGrupo: 'GT-BOG-C', activo: true },
  { codigo: 'T002', nombre: 'Centro Mayor',         codigoGrupo: 'GT-BOG-C', activo: true },
  { codigo: 'T003', nombre: 'Unicentro',            codigoGrupo: 'GT-BOG-N', activo: true },
  { codigo: 'T004', nombre: 'Andino',               codigoGrupo: 'GT-BOG-N', activo: true },
  { codigo: 'T005', nombre: 'El Tesoro',            codigoGrupo: 'GT-MED',   activo: true },
  { codigo: 'T006', nombre: 'Vizcaya',              codigoGrupo: 'GT-MED',   activo: true },
];

// 20 colaboradores — mix de cargos y tiendas para probar todos los tipos de liquidación (HU-3)
export const COLABORADORES_SEED = [
  // T001 — Santa Fe (Bogotá Centro)
  { idMidasoft: 'EMP001', nombres: 'Laura',     apellidos: 'Gómez Ruiz',       tipoDocumento: 'CC', numeroDocumento: '52001001', cargo: 'Asesor Comercial',    codigoTienda: 'T001', activo: true },
  { idMidasoft: 'EMP002', nombres: 'Carlos',    apellidos: 'Martínez López',   tipoDocumento: 'CC', numeroDocumento: '80001002', cargo: 'Asesor Comercial',    codigoTienda: 'T001', activo: true },
  { idMidasoft: 'EMP003', nombres: 'Sofía',     apellidos: 'Herrera Díaz',     tipoDocumento: 'CC', numeroDocumento: '52001003', cargo: 'Asesor Comercial',    codigoTienda: 'T001', activo: true },
  { idMidasoft: 'EMP004', nombres: 'Pedro',     apellidos: 'Castro Mora',      tipoDocumento: 'CC', numeroDocumento: '80001004', cargo: 'Líder de Tienda',     codigoTienda: 'T001', activo: true },

  // T002 — Centro Mayor (Bogotá Centro)
  { idMidasoft: 'EMP005', nombres: 'Valentina', apellidos: 'Torres Salcedo',   tipoDocumento: 'CC', numeroDocumento: '52001005', cargo: 'Asesor Comercial',    codigoTienda: 'T002', activo: true },
  { idMidasoft: 'EMP006', nombres: 'Andrés',    apellidos: 'Rodríguez Peña',   tipoDocumento: 'CC', numeroDocumento: '80001006', cargo: 'Asesor Comercial',    codigoTienda: 'T002', activo: true },
  { idMidasoft: 'EMP007', nombres: 'Camila',    apellidos: 'Vargas Quintero',  tipoDocumento: 'CC', numeroDocumento: '52001007', cargo: 'Líder de Tienda',     codigoTienda: 'T002', activo: true },

  // T003 — Unicentro (Bogotá Norte)
  { idMidasoft: 'EMP008', nombres: 'Felipe',    apellidos: 'Mendoza Sierra',   tipoDocumento: 'CC', numeroDocumento: '80001008', cargo: 'Asesor Comercial',    codigoTienda: 'T003', activo: true },
  { idMidasoft: 'EMP009', nombres: 'Daniela',   apellidos: 'Pinto Ríos',       tipoDocumento: 'CC', numeroDocumento: '52001009', cargo: 'Asesor Comercial',    codigoTienda: 'T003', activo: true },
  { idMidasoft: 'EMP010', nombres: 'Julián',    apellidos: 'Ospina Cano',      tipoDocumento: 'CC', numeroDocumento: '80001010', cargo: 'Líder de Tienda',     codigoTienda: 'T003', activo: true },

  // T004 — Andino (Bogotá Norte)
  { idMidasoft: 'EMP011', nombres: 'Ana María', apellidos: 'Suárez Leal',      tipoDocumento: 'CC', numeroDocumento: '52001011', cargo: 'Asesor Comercial',    codigoTienda: 'T004', activo: true },
  { idMidasoft: 'EMP012', nombres: 'Diego',     apellidos: 'Ramírez Gómez',    tipoDocumento: 'CC', numeroDocumento: '80001012', cargo: 'Asesor Comercial',    codigoTienda: 'T004', activo: true },
  { idMidasoft: 'EMP013', nombres: 'Marcela',   apellidos: 'Álvarez Mejía',    tipoDocumento: 'CC', numeroDocumento: '52001013', cargo: 'Líder de Tienda',     codigoTienda: 'T004', activo: true },

  // T005 — El Tesoro (Medellín)
  { idMidasoft: 'EMP014', nombres: 'Santiago',  apellidos: 'Escobar Vélez',    tipoDocumento: 'CC', numeroDocumento: '98001014', cargo: 'Asesor Comercial',    codigoTienda: 'T005', activo: true },
  { idMidasoft: 'EMP015', nombres: 'Manuela',   apellidos: 'Cardona Arango',   tipoDocumento: 'CC', numeroDocumento: '52001015', cargo: 'Asesor Comercial',    codigoTienda: 'T005', activo: true },
  { idMidasoft: 'EMP016', nombres: 'Sebastián', apellidos: 'Ríos Muñoz',       tipoDocumento: 'CC', numeroDocumento: '98001016', cargo: 'Líder de Tienda',     codigoTienda: 'T005', activo: true },

  // T006 — Vizcaya (Medellín)
  { idMidasoft: 'EMP017', nombres: 'Natalia',   apellidos: 'Agudelo Castro',   tipoDocumento: 'CC', numeroDocumento: '52001017', cargo: 'Asesor Comercial',    codigoTienda: 'T006', activo: true },
  { idMidasoft: 'EMP018', nombres: 'Esteban',   apellidos: 'Giraldo Restrepo', tipoDocumento: 'CC', numeroDocumento: '98001018', cargo: 'Asesor Comercial',    codigoTienda: 'T006', activo: true },
  { idMidasoft: 'EMP019', nombres: 'Paola',     apellidos: 'Zapata Hoyos',     tipoDocumento: 'CC', numeroDocumento: '52001019', cargo: 'Líder de Tienda',     codigoTienda: 'T006', activo: true },

  // Sin tienda fija — Coordinador Regional (base T001)
  { idMidasoft: 'EMP020', nombres: 'Ricardo',   apellidos: 'Morales Guzmán',   tipoDocumento: 'CC', numeroDocumento: '80001020', cargo: 'Coordinador Regional', codigoTienda: 'T001', activo: true },
];
