import { Test } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import { NormalizacionService, VentaBruta } from '../services/normalizacion.service';
import { TipoVenta } from '../entities/liquidacion-detalle.entity';

describe('NormalizacionService', () => {
  let svc: NormalizacionService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [NormalizacionService],
    }).compile();
    svc = module.get(NormalizacionService);
  });

  const mkVenta = (over: Partial<VentaBruta> = {}): VentaBruta => ({
    fecha: '2026-06-15',
    idTienda: 'T01',
    idColaborador: 'EMP001',
    tipoVenta: TipoVenta.LINEA,
    importe: 1000,
    incluyeIva: true,
    tasaComisionBancaria: 0,
    ...over,
  });

  describe('÷1.19 (IVA)', () => {
    it('divide entre 1.19 cuando incluyeIva=true', () => {
      const r = svc.normalizar([mkVenta({ importe: 1190, incluyeIva: true })], 0);
      expect(r[0].porTipo[TipoVenta.LINEA].ventaSinIva).toBeCloseTo(1000, 2);
    });

    it('no divide cuando incluyeIva=false', () => {
      const r = svc.normalizar([mkVenta({ importe: 1000, incluyeIva: false })], 0);
      expect(r[0].porTipo[TipoVenta.LINEA].ventaSinIva).toBe(1000);
    });
  });

  describe('Agrupación por (colaborador, tienda, tipo)', () => {
    it('suma múltiples ventas del mismo colab/tienda/tipo', () => {
      const ventas = [
        mkVenta({ importe: 1190 }),
        mkVenta({ importe: 595 }),
        mkVenta({ importe: 119 }),
      ];
      const r = svc.normalizar(ventas, 0);
      expect(r).toHaveLength(1);
      expect(r[0].porTipo[TipoVenta.LINEA].ventaSinIva).toBeCloseTo(1600, 2);
    });

    it('separa por tienda', () => {
      const ventas = [
        mkVenta({ idTienda: 'T01', importe: 1190 }),
        mkVenta({ idTienda: 'T02', importe: 1190 }),
      ];
      const r = svc.normalizar(ventas, 0);
      expect(r).toHaveLength(2);
    });

    it('separa por tipo de venta', () => {
      const ventas = [
        mkVenta({ tipoVenta: TipoVenta.LINEA, importe: 1190 }),
        mkVenta({ tipoVenta: TipoVenta.PROMOCION, importe: 1190 }),
      ];
      const r = svc.normalizar(ventas, 0);
      expect(r[0].porTipo[TipoVenta.LINEA].ventaSinIva).toBeCloseTo(1000, 2);
      expect(r[0].porTipo[TipoVenta.PROMOCION].ventaSinIva).toBeCloseTo(1000, 2);
    });
  });

  describe('Comisión bancaria al tipo de mayor valor', () => {
    it('se aplica al tipo con mayor acumulado', () => {
      const ventas = [
        mkVenta({ tipoVenta: TipoVenta.LINEA,            importe: 1190 }),
        mkVenta({ tipoVenta: TipoVenta.PROMOCION,        importe: 5950 }),
        mkVenta({ tipoVenta: TipoVenta.LINEA_ESTRATEGIA, importe: 119 }),
      ];
      const r = svc.normalizar(ventas, 500);
      expect(r[0].porTipo[TipoVenta.PROMOCION].comisionBancaria).toBe(500);
      expect(r[0].porTipo[TipoVenta.LINEA].comisionBancaria).toBe(0);
      expect(r[0].porTipo[TipoVenta.LINEA_ESTRATEGIA].comisionBancaria).toBe(0);
    });

    it('no se aplica si todas las ventas son 0', () => {
      const ventas = [mkVenta({ importe: 0, incluyeIva: false })];
      const r = svc.normalizar(ventas, 500);
      expect(r[0].totalComBancaria).toBe(0);
    });

    it('se prorratea entre colaboradores según su participación en la venta', () => {
      const ventas = [
        mkVenta({ idColaborador: 'EMP001', importe: 3000, incluyeIva: false }),
        mkVenta({ idColaborador: 'EMP002', importe: 1000, incluyeIva: false }),
      ];
      const r = svc.normalizar(ventas, 400);
      const emp1 = r.find((c) => c.idColaborador === 'EMP001')!;
      const emp2 = r.find((c) => c.idColaborador === 'EMP002')!;
      expect(emp1.totalComBancaria).toBeCloseTo(300, 2); // 75% de 400
      expect(emp2.totalComBancaria).toBeCloseTo(100, 2); // 25% de 400
      // La suma de los prorrateos debe ser exactamente el total
      expect(emp1.totalComBancaria + emp2.totalComBancaria).toBeCloseTo(400, 2);
    });
  });

  describe('calcularVentaNeta', () => {
    it('resta la comisionBancaria del tipo donde se aplicó', () => {
      const porTipo = {
        [TipoVenta.LINEA]:            { ventaSinIva: 1000, comisionBancaria: 0 },
        [TipoVenta.PROMOCION]:        { ventaSinIva: 500,  comisionBancaria: 0 },
        [TipoVenta.LINEA_ESTRATEGIA]: { ventaSinIva: 200,  comisionBancaria: 500 },
      } as any;
      const neta = NormalizacionService.calcularVentaNeta(porTipo);
      expect(neta[TipoVenta.LINEA_ESTRATEGIA]).toBe(-300);   // 200 - 500
      expect(neta[TipoVenta.LINEA]).toBe(1000);
      expect(neta[TipoVenta.PROMOCION]).toBe(500);
    });
  });
});