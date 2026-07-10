import { Test } from '@nestjs/testing';
import { AfectacionesService } from '../services/afectaciones.service';

describe('AfectacionesService', () => {
  let svc: AfectacionesService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [AfectacionesService],
    }).compile();
    svc = module.get(AfectacionesService);
  });

  describe('Cálculo de afectación', () => {
    it('cuenta todos los días como laborados si no hay novedades', () => {
      const r = svc.calcular('2026-06-01', '2026-06-30', [], []);
      expect(r.diasLaborados).toBe(30);
      expect(r.diasExcluidos).toBe(0);
      expect(r.motivoExclusion).toBeNull();
    });

    it('excluye días con Vacaciones', () => {
      const r = svc.calcular(
        '2026-06-01', '2026-06-30',
        [{ idColaborador: 'x', fechaInicio: '2026-06-10', fechaFin: '2026-06-12', tipo: 'Vacaciones' }],
        [],
      );
      expect(r.diasExcluidos).toBe(3);
      expect(r.diasLaborados).toBe(27);
      expect(r.motivoExclusion).toBe('Vacaciones');
    });

    it('NO excluye días con LicenciaLuto (excepción legal)', () => {
      const r = svc.calcular(
        '2026-06-01', '2026-06-30',
        [{ idColaborador: 'x', fechaInicio: '2026-06-10', fechaFin: '2026-06-12', tipo: 'LicenciaLuto' }],
        [],
      );
      expect(r.diasExcluidos).toBe(0);
      expect(r.diasLaborados).toBe(30);
    });

    it('NO excluye días con DiaFamilia', () => {
      const r = svc.calcular(
        '2026-06-01', '2026-06-30',
        [{ idColaborador: 'x', fechaInicio: '2026-06-15', fechaFin: '2026-06-15', tipo: 'DiaFamilia' }],
        [],
      );
      expect(r.diasExcluidos).toBe(0);
    });

    it('excluye días con Incapacidad', () => {
      const r = svc.calcular(
        '2026-06-01', '2026-06-30',
        [{ idColaborador: 'x', fechaInicio: '2026-06-15', fechaFin: '2026-06-19', tipo: 'Incapacidad' }],
        [],
      );
      expect(r.diasExcluidos).toBe(5);
      expect(r.motivoExclusion).toBe('Incapacidad');
    });

    it('combina múltiples motivos de exclusión distintos', () => {
      const r = svc.calcular(
        '2026-06-01', '2026-06-30',
        [
          { idColaborador: 'x', fechaInicio: '2026-06-05', fechaFin: '2026-06-07', tipo: 'Vacaciones' },
          { idColaborador: 'x', fechaInicio: '2026-06-20', fechaFin: '2026-06-22', tipo: 'Incapacidad' },
        ],
        [],
      );
      expect(r.diasExcluidos).toBe(6);
      expect(r.motivoExclusion).toContain('Vacaciones');
      expect(r.motivoExclusion).toContain('Incapacidad');
    });

    it('ignora novedades fuera del rango del período', () => {
      const r = svc.calcular(
        '2026-06-01', '2026-06-30',
        [{ idColaborador: 'x', fechaInicio: '2026-05-25', fechaFin: '2026-05-28', tipo: 'Vacaciones' }],
        [],
      );
      expect(r.diasExcluidos).toBe(0);
    });
  });

  describe('Cumplimiento de presupuesto y crecimiento', () => {
    it('calcula % cumplimiento correctamente', () => {
      expect(svc.calcularCumplimientoPresupuesto(50000, 100000)).toBe(50);
      expect(svc.calcularCumplimientoPresupuesto(0, 100000)).toBe(0);
      expect(svc.calcularCumplimientoPresupuesto(100000, 0)).toBe(0);
    });

    it('calcula % crecimiento correctamente', () => {
      expect(svc.calcularCumplimientoCrecimiento(120000, 100000)).toBe(20);
      expect(svc.calcularCumplimientoCrecimiento(100000, 100000)).toBe(0);
      expect(svc.calcularCumplimientoCrecimiento(50000, 100000)).toBe(-50);
    });
  });
});