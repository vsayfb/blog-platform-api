import * as dotenv from 'dotenv';
import { DataSource } from 'typeorm';
import { env } from 'process';
import { join } from 'path';
import { DEV_DATABASE, NODE_ENV, PROD_DATABASE } from 'src/lib/env';

dotenv.config();

const productionEnviroment = env[NODE_ENV] === 'production';

export const dataSource = new DataSource({
  type: 'postgres',
  url: productionEnviroment ? env[PROD_DATABASE] : env[DEV_DATABASE],
  entities: [join(__dirname, '**', '*.entity.{ts,js}')],
  migrations: [join(__dirname + '/src/database/migrations/*.{ts,js}')],
  ssl: {
    require: true,
    rejectUnauthorized: false,
  },
  migrationsRun: productionEnviroment,
  synchronize: !productionEnviroment,
});
