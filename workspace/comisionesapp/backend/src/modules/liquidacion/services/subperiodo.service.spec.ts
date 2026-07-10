import { Test } from '@nestjs/testing';
import { SubPeriodoService } from '../services/subperiodo.service';
import { CambioCargoPeriodo, TipoCambio } from '../entities/cambio-cargo-periodo.entity';

describe('SubPeriodoService', () => {
  let svc: SubPeriodoService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [SubPeriodoService],
    }).compile();
    svc = module.get(SubPeriodoService);
  });

  it('genera 1 subperíodo INICIAL si no hay cambios', () => {
    const empleados = [
      { idColaborador: 'E1', idCargoInicial: '104608', idTiendaInicial: 'T01', idCentroCostoInicial: null },
    ];
    const cambios: CambioCargoPeriodo[] = [];
    const r = svc.generar(empleados, cambios, '2026-06-01', '2026-06-30');
    expect(r).toHaveLength(1);
    expect(r[0].motivo).toBe('INICIAL');
    expect(r[0].fechaInicio).toBe('2026-06-01');
    expect(r[0].fechaFin).toBe('2026-06-30');
  });

  it('ignora cambios fuera del rango del período', () => {
    const empleados = [
      { idColaborador: 'E1', idCargoInicial: '104608', idTiendaInicial: 'T01', idCentroCostoInicial: null },
    ];
    const cambios: CambioCargoPeriodo[] = [
      {
        idCambio: 'C1',
        idColaborador: 'E1',
        idPeriodo: 'P1',
        fechaCambio: '2026-05-15',                       // antes del período
        tipoCambio: TipoCambio.CAMBIO_CARGO,
        cargoAnterior: '104608', cargoNuevo: '102058',
        tiendaAnterior: null, tiendaNueva: null,
        centroCostoAnterior: null, centroCostoNuevo: null,
        fuente: 'Midasoft', createdAt: new Date(),
      } as CambioCargoPeriodo,
    ];
    const r = svc.generar(empleados, cambios, '2026-06-01', '2026-06-30');
    expect(r).toHaveLength(1);
    expect(r[0].motivo).toBe('INICIAL');
  });

  it('fragmenta en 2 subperíodos con un cambio de cargo', () => {
    const empleados = [
      { idColaborador: 'E1', idCargoInicial: '104608', idTiendaInicial: 'T01', idCentroCostoInicial: null },
    ];
    const cambios: CambioCargoPeriodo[] = [
      {
        idCambio: 'C1',
        idColaborador: 'E1',
        idPeriodo: 'P1',
        fechaCambio: '2026-06-15',
        tipoCambio: TipoCambio.CAMBIO_CARGO,
        cargoAnterior: '104608', cargoNuevo: '102058',
        tiendaAnterior: 'T01', tiendaNueva: 'T02',
        centroCostoAnterior: null, centroCostoNuevo: null,
        fuente: 'Midasoft', createdAt: new Date(),
      } as CambioCargoPeriodo,
    ];
    const r = svc.generar(empleados, cambios, '2026-06-01', '2026-06-30');
    expect(r).toHaveLength(2);
    expect(r[0].fechaInicio).toBe('2026-06-01');
    expect(r[0].fechaFin).toBe('2026-06-14');
    expect(r[0].idCargo).toBe('104608');
    expect(r[0].idTienda).toBe('T01');
    expect(r[0].motivo).toBe('CAMBIO_CARGO');
    expect(r[1].fechaInicio).toBe('2026-06-15');
    expect(r[1].fechaFin).toBe('2026-06-30');
    expect(r[1].idCargo).toBe('102058');
    expect(r[1].idTienda).toBe('T02');
  });

  it('maneja 2 cambios ordenando por fecha', () => {
    const empleados = [
      { idColaborador: 'E1', idCargoInicial: '104608', idTiendaInicial: 'T01', idCentroCostoInicial: null },
    ];
    const cambios: CambioCargoPeriodo[] = [
      {
        idCambio: 'C1', idColaborador: 'E1', idPeriodo: 'P1', fechaCambio: '2026-06-20',
        tipoCambio: TipoCambio.CAMBIO_CARGO,
        cargoAnterior: '102058', cargoNuevo: '104608',
        tiendaAnterior: null, tiendaNueva: null, centroCostoAnterior: null, centroCostoNuevo: null,
        fuente: 'Midasoft', createdAt: new Date(),
      } as CambioCargoPeriodo,
      {
        idCambio: 'C2', idColaborador: 'E1', idPeriodo: 'P1', fechaCambio: '2026-06-10',
        tipoCambio: TipoCambio.TRASLADO_CC,
        cargoAnterior: null, cargoNuevo: null,
        tiendaAnterior: 'T01', tiendaNueva: 'T02',
        centroCostoAnterior: null, centroCostoNuevo: null,
        fuente: 'Midasoft', createdAt: new Date(),
      } as CambioCargoPeriodo,
    ];
    const r = svc.generar(empleados, cambios, '2026-06-01', '2026-06-30');
    // Esperado: 1-9 (T01), 10-19 (T02), 20-30 (cargo 104608)
    expect(r).toHaveLength(3);
    expect(r[0].fechaInicio).toBe('2026-06-01');
    expect(r[0].fechaFin).toBe('2026-06-09');
    expect(r[0].idTienda).toBe('T01');
    expect(r[1].fechaInicio).toBe('2026-06-10');
    expect(r[1].fechaFin).toBe('2026-06-19');
    expect(r[1].idTienda).toBe('T02');
    expect(r[2].fechaInicio).toBe('2026-06-20');
    expect(r[2].fechaFin).toBe('2026-06-30');
    expect(r[2].idCargo).toBe('104608');
  });
});