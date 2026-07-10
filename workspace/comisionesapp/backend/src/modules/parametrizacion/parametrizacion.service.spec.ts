import { ParametrizacionService } from './parametrizacion.service';
import { CrearRangoTablaDto } from './dto/crear-rango-tabla.dto';
import {
  TipoDistribucion,
  TipoLiquidacion,
} from './entities/parametrizacion-cargo.entity';

/**
 * Tests de las validaciones de negocio internas del servicio.
 * Para evitar mockear TypeORM, se accede a los métodos privados vía `as any`.
 */
describe('ParametrizacionService — validaciones internas', () => {
  let svc: ParametrizacionService;

  beforeEach(() => {
    // El servicio real necesita repos. Creamos un mock mínimo.
    svc = new ParametrizacionService(
      {} as any, {} as any, {} as any,
      {} as any,   // CargosCatalogo (mock)
      {} as any,   // DataSource (mock)
      {} as any,   // LogEstructuralService (mock)
    );
  });

  describe('validarRangos (continuidad y solapamiento)', () => {
    const validar = (rangos: CrearRangoTablaDto[]) =>
      (svc as any).validarRangos(rangos);

    it('acepta una sola rango abierto (sin hastaPorc)', () => {
      expect(() => validar([{ desdePorc: 0, porcLinea: 0, porcPromocion: 0 }])).not.toThrow();
    });

    it('acepta rangos contiguos', () => {
      const rangos = [
        { desdePorc: 0,  hastaPorc: 80,  porcLinea: 0.19, porcPromocion: 0.13 },
        { desdePorc: 80, hastaPorc: 90,  porcLinea: 0.29, porcPromocion: 0.20 },
        { desdePorc: 90, hastaPorc: 100, porcLinea: 0.48, porcPromocion: 0.34 },
        { desdePorc: 100,                porcLinea: 0.60, porcPromocion: 0.42 },
      ];
      expect(() => validar(rangos)).not.toThrow();
    });

    it('rechaza rangos con hueco', () => {
      const rangos = [
        { desdePorc: 0,  hastaPorc: 70,  porcLinea: 0.1, porcPromocion: 0.1 },
        { desdePorc: 80, hastaPorc: 100, porcLinea: 0.2, porcPromocion: 0.2 },
      ];
      expect(() => validar(rangos)).toThrow(/continuos/);
    });

    it('rechaza rangos solapados', () => {
      const rangos = [
        { desdePorc: 0,  hastaPorc: 90,  porcLinea: 0.1, porcPromocion: 0.1 },
        { desdePorc: 80, hastaPorc: 100, porcLinea: 0.2, porcPromocion: 0.2 },
      ];
      expect(() => validar(rangos)).toThrow(/continuos/);
    });

    it('rechaza hastaPorc <= desdePorc', () => {
      const rangos = [
        { desdePorc: 80, hastaPorc: 80, porcLinea: 0.1, porcPromocion: 0.1 },
      ];
      expect(() => validar(rangos)).toThrow();
    });

    it('rechaza rango abierto (sin hastaPorc) antes del último', () => {
      const rangos = [
        { desdePorc: 0,   hastaPorc: 80,  porcLinea: 0.1, porcPromocion: 0.1 },
        { desdePorc: 80,                   porcLinea: 0.2, porcPromocion: 0.2 },
        { desdePorc: 90,  hastaPorc: 100, porcLinea: 0.3, porcPromocion: 0.3 },
      ];
      expect(() => validar(rangos)).toThrow(/abierto/);
    });
  });

  describe('validarCruzadaLiqDist', () => {
    const validar = (liq: TipoLiquidacion, dist: TipoDistribucion) =>
      (svc as any).validarCruzadaLiqDist(liq, dist);

    it('acepta Individual + Individual', () => {
      expect(() => validar(TipoLiquidacion.INDIVIDUAL, TipoDistribucion.INDIVIDUAL)).not.toThrow();
    });

    it('rechaza Individual + Proporcional', () => {
      expect(() => validar(TipoLiquidacion.INDIVIDUAL, TipoDistribucion.PROPORCIONAL))
        .toThrow(/Individual/);
    });

    it('acepta GlobalTienda + Proporcional', () => {
      expect(() => validar(TipoLiquidacion.GLOBAL_TIENDA, TipoDistribucion.PROPORCIONAL))
        .not.toThrow();
    });
  });
});