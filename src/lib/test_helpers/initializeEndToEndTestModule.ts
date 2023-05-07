import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from 'src/app.module';
import { DatabaseModule } from '../database/database.module';
import { TestDatabaseService } from '../database/database.service';
import { HelpersModule } from '../helpers.module';
import { HelpersService } from '../helpers.service';

export async function initializeEndToEndTestModule(): Promise<{
  nestApp: INestApplication;
  database: TestDatabaseService;
  helpers: HelpersService;
  moduleRef: TestingModule;
}> {
  const moduleRef = await Test.createTestingModule({
    imports: [AppModule, DatabaseModule, HelpersModule],
  }).compile();

  const app = moduleRef.createNestApplication();

  app.useGlobalPipes(
    new ValidationPipe({ forbidUnknownValues: true, whitelist: true }),
  );

  await app.init();

  const databaseService =
    moduleRef.get<TestDatabaseService>(TestDatabaseService);

  const helpersService = moduleRef.get<HelpersService>(HelpersService);

  await databaseService.connectDatabase();

  await databaseService.clearAllTables();

  return {
    nestApp: app,
    database: databaseService,
    helpers: helpersService,
    moduleRef,
  };
}
