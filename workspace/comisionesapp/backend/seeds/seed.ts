import { NestFactory } from '@nestjs/core';
import { SeedModule } from './seed.module';
import { SeedService } from './seed.service';

async function runSeed() {
  const app = await NestFactory.createApplicationContext(SeedModule, { logger: ['log', 'error', 'warn'] });

  try {
    const seeder = app.get(SeedService);
    await seeder.seed();
    process.exit(0);
  } catch (err) {
    console.error('Error durante el seed:', err);
    process.exit(1);
  } finally {
    await app.close();
  }
}

runSeed();
