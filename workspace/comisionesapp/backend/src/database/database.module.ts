import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';

/**
 * Target canónico: SQL Server 2022 (DB_TYPE=mssql, puerto 1433).
 * Para pruebas locales con MySQL Workbench: DB_TYPE=mysql, puerto 3306.
 * synchronize=true solo en desarrollo — NUNCA en producción.
 */
@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (cfg: ConfigService) => {
        const isProd = cfg.get<string>('NODE_ENV') === 'production';
        const dbType = cfg.get<string>('DB_TYPE', 'mssql');
        const dbPort = Number(cfg.get<string>('DB_PORT', dbType === 'mysql' ? '3306' : '1433'));

        if (dbType === 'mysql') {
          return {
            type: 'mysql' as const,
            host: cfg.get<string>('DB_HOST', 'localhost'),
            port: dbPort,
            username: cfg.get<string>('DB_USERNAME'),
            password: cfg.get<string>('DB_PASSWORD'),
            database: cfg.get<string>('DB_DATABASE'),
            entities: [__dirname + '/../**/*.entity{.ts,.js}'],
            synchronize: !isProd,
            logging: !isProd,
          };
        }

        return {
          type: 'mssql' as const,
          host: cfg.get<string>('DB_HOST', 'localhost'),
          port: dbPort,
          username: cfg.get<string>('DB_USERNAME'),
          password: cfg.get<string>('DB_PASSWORD'),
          database: cfg.get<string>('DB_DATABASE'),
          entities: [__dirname + '/../**/*.entity{.ts,.js}'],
          synchronize: !isProd,
          logging: !isProd,
          options: { encrypt: false, trustServerCertificate: true },
        };
      },
    }),
  ],
  exports: [TypeOrmModule],
})
export class DatabaseModule {}
