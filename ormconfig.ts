import * as dotenv from 'dotenv';
import { DataSource } from 'typeorm';
import { env } from 'process';
import { join } from 'path';
import * as fs from 'fs';

dotenv.config();

console.log();

const productionEnviroment = env.NODE_ENV === 'production';

export const dataSource = new DataSource({
  type: 'postgres',
  url: env.DEV_DATABASE,
  entities: [join(__dirname, '**', '*.entity.{ts,js}')],
  migrations: [join(__dirname + '/src/database/migrations/*.{ts,js}')],
  ssl: {
    rejectUnauthorized: false,
  },
  migrationsRun: productionEnviroment,
  synchronize: !productionEnviroment,
});
