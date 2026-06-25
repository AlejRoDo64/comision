import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Calendario } from '../src/modules/calendarios/entities/calendario.entity';
import { Periodo } from '../src/modules/calendarios/entities/periodo.entity';
import { GrupoTiendas } from '../src/modules/catalogos/entities/grupo-tiendas.entity';
import { Tienda } from '../src/modules/catalogos/entities/tienda.entity';
import { Colaborador } from '../src/modules/catalogos/entities/colaborador.entity';
import { VentaICG } from '../src/modules/catalogos/entities/venta-icg.entity';
import { CALENDARIOS_SEED } from './data/calendarios.data';
import { GRUPOS_TIENDAS_SEED, TIENDAS_SEED, COLABORADORES_SEED } from './data/catalogos.data';
import { VENTAS_ICG_SEED } from './data/ventas.data';

@Injectable()
export class SeedService {
  private readonly logger = new Logger(SeedService.name);

  constructor(
    @InjectRepository(Calendario)  private readonly calendariosRepo: Repository<Calendario>,
    @InjectRepository(Periodo)     private readonly periodosRepo: Repository<Periodo>,
    @InjectRepository(GrupoTiendas) private readonly gruposRepo: Repository<GrupoTiendas>,
    @InjectRepository(Tienda)      private readonly tiendasRepo: Repository<Tienda>,
    @InjectRepository(Colaborador) private readonly colaboradoresRepo: Repository<Colaborador>,
    @InjectRepository(VentaICG)    private readonly ventasRepo: Repository<VentaICG>,
  ) {}

  async seed(): Promise<void> {
    this.logger.log('Iniciando seed de datos de prueba HU-1...');

    await this.limpiar();
    const grupos   = await this.seedGruposTiendas();
    const tiendas  = await this.seedTiendas(grupos);
    await this.seedColaboradores(tiendas);
    await this.seedCalendarios();
    await this.seedVentas(tiendas);

    this.logger.log('Seed completado exitosamente.');
    this.logger.log(`  Grupos de tiendas : ${grupos.length}`);
    this.logger.log(`  Tiendas           : ${tiendas.length}`);
    this.logger.log(`  Colaboradores     : ${COLABORADORES_SEED.length}`);
    this.logger.log(`  Calendarios       : ${CALENDARIOS_SEED.length}`);
    this.logger.log(`  Ventas ICG        : ${VENTAS_ICG_SEED.length}`);
  }

  // ── Limpieza ────────────────────────────────────────────────────────────────
  private async limpiar(): Promise<void> {
    this.logger.log('Limpiando tablas en orden inverso de dependencias...');
    await this.ventasRepo.query('DELETE FROM venta_icg');
    await this.colaboradoresRepo.query('DELETE FROM colaborador');
    await this.periodosRepo.query('DELETE FROM periodo');
    await this.calendariosRepo.query('DELETE FROM calendario');
    await this.tiendasRepo.query('DELETE FROM tienda');
    await this.gruposRepo.query('DELETE FROM grupo_tiendas');
  }

  // ── Grupos de Tiendas ────────────────────────────────────────────────────────
  private async seedGruposTiendas(): Promise<GrupoTiendas[]> {
    const entities = GRUPOS_TIENDAS_SEED.map(g => this.gruposRepo.create(g));
    const saved = await this.gruposRepo.save(entities);
    this.logger.log(`  [OK] ${saved.length} grupos de tiendas insertados`);
    return saved;
  }

  // ── Tiendas ──────────────────────────────────────────────────────────────────
  private async seedTiendas(grupos: GrupoTiendas[]): Promise<Tienda[]> {
    const entities = TIENDAS_SEED.map(t => {
      const grupoTiendas = grupos.find(g => g.codigo === t.codigoGrupo);
      return this.tiendasRepo.create({ codigo: t.codigo, nombre: t.nombre, activo: t.activo, grupoTiendas });
    });
    const saved = await this.tiendasRepo.save(entities);
    this.logger.log(`  [OK] ${saved.length} tiendas insertadas`);
    return saved;
  }

  // ── Colaboradores ────────────────────────────────────────────────────────────
  private async seedColaboradores(tiendas: Tienda[]): Promise<void> {
    const entities = COLABORADORES_SEED.map(c => {
      const tienda = tiendas.find(t => t.codigo === c.codigoTienda);
      return this.colaboradoresRepo.create({
        idMidasoft: c.idMidasoft, nombres: c.nombres, apellidos: c.apellidos,
        tipoDocumento: c.tipoDocumento, numeroDocumento: c.numeroDocumento,
        cargo: c.cargo, activo: c.activo, tienda,
      });
    });
    await this.colaboradoresRepo.save(entities);
    this.logger.log(`  [OK] ${entities.length} colaboradores insertados`);
  }

  // ── Calendarios y Períodos ───────────────────────────────────────────────────
  private async seedCalendarios(): Promise<void> {
    for (const calData of CALENDARIOS_SEED) {
      const calendario = this.calendariosRepo.create({
        nombre: calData.nombre, anio: calData.anio, estadoActivo: calData.estadoActivo,
      });
      const savedCal = await this.calendariosRepo.save(calendario);

      const periodos = calData.periodos.map(p =>
        this.periodosRepo.create({
          calendario: savedCal,
          codigo: p.codigo,
          fechaInicio: p.fechaInicio,
          fechaFin: p.fechaFin,
          estadoOperativo: p.estadoOperativo,
        }),
      );
      await this.periodosRepo.save(periodos);
      this.logger.log(`  [OK] Calendario "${calData.nombre}" con ${periodos.length} periodos`);
    }
  }

  // ── Ventas ICG ───────────────────────────────────────────────────────────────
  private async seedVentas(tiendas: Tienda[]): Promise<void> {
    const entities = VENTAS_ICG_SEED.map(v => {
      const tienda = tiendas.find(t => t.codigo === v.codigoTienda);
      return this.ventasRepo.create({
        fecha: v.fecha, tienda, idColaboradorMidasoft: v.idColaboradorMidasoft,
        tipoVenta: v.tipoVenta, importe: v.importe,
        incluyeIva: v.incluyeIva, tasaComisionBancaria: v.tasaComisionBancaria,
      });
    });
    await this.ventasRepo.save(entities);
    this.logger.log(`  [OK] ${entities.length} ventas ICG insertadas (7 escenarios de prueba)`);
  }
}
