import * as dotenv from 'dotenv';
import { env } from 'process';
import { join } from 'path';
import { DEV_DATABASE, NODE_ENV, PROD_DATABASE } from 'src/lib/env';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';

dotenv.config();

const productionEnviroment = env[NODE_ENV] === 'production';

export const config: TypeOrmModuleOptions = {
  type: 'postgres',
  url: productionEnviroment ? env[PROD_DATABASE] : env[DEV_DATABASE],
  entities: [join(__dirname, '**', '*.entity.{ts,js}')],
  migrations: [join(__dirname + '/src/database/migrations/*.{ts,js}')],
  migrationsRun: productionEnviroment,
  synchronize: !productionEnviroment,

  ssl: {
    rejectUnauthorized: false,
  },
};
