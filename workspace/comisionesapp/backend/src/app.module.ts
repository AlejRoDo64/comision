import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { JwtAuthGuard } from './auth/guards/jwt-auth.guard';
import { RolesGuard } from './auth/guards/roles.guard';
import { UsersModule } from './users/users.module';
import { IntegracionesModule } from './modules/integraciones/integraciones.module';
import { DatabaseModule } from './database/database.module';
import { CatalogosModule } from './modules/catalogos/catalogos.module';
import { ConfiguracionModule } from './modules/configuracion/configuracion.module';
import { LiquidacionModule } from './modules/liquidacion/liquidacion.module';
import { TrazabilidadModule } from './modules/trazabilidad/trazabilidad.module';
import { AuditModule } from './common/audit/audit.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    DatabaseModule,
    AuditModule,
    UsersModule,
    AuthModule,
    IntegracionesModule,
    CatalogosModule,
    ConfiguracionModule,
    LiquidacionModule,
    TrazabilidadModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    { provide: APP_GUARD, useClass: RolesGuard },
  ],
})
export class AppModule {}