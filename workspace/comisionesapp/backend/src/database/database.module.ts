import { Module } from '@nestjs/common';

/**
 * Módulo de base de datos — pendiente de asignación de BD.
 *
 * Cuando se asigne SQL Server 2022, descomentar el bloque TypeORM
 * y agregar las entidades correspondientes.
 *
 * Dependencias a instalar cuando se active:
 *   npm install @nestjs/typeorm typeorm mssql
 */

// import { TypeOrmModule } from '@nestjs/typeorm';
// import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [
    // TypeOrmModule.forRootAsync({
    //   imports: [ConfigModule],
    //   inject: [ConfigService],
    //   useFactory: (config: ConfigService) => ({
    //     type: 'mssql',
    //     host: config.get<string>('DB_HOST'),
    //     port: config.get<number>('DB_PORT', 1433),
    //     username: config.get<string>('DB_USERNAME'),
    //     password: config.get<string>('DB_PASSWORD'),
    //     database: config.get<string>('DB_DATABASE'),
    //     entities: [__dirname + '/../**/*.entity{.ts,.js}'],
    //     synchronize: false,           // NUNCA true en producción
    //     logging: config.get('NODE_ENV') === 'development',
    //     options: { encrypt: false },  // ajustar según certificado SQL Server
    //   }),
    // }),
  ],
  exports: [],
})
export class DatabaseModule {}
