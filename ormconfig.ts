import * as dotenv from 'dotenv';
import { env } from 'process';
import { join } from 'path';
import { DataSource } from 'typeorm';
import { ProcessEnv } from 'src/lib/enums/env';

dotenv.config();

const productionEnvironment = env[ProcessEnv.NODE_ENV] === 'production';

export const dataSource: DataSource = new DataSource({
  type: 'postgres',
  url: productionEnvironment
    ? env[ProcessEnv.PROD_DATABASE]
    : env[ProcessEnv.DEV_DATABASE],
  entities: [join(__dirname, '**', '*.entity.{ts,js}')],
  migrations: [join(__dirname + '/src/migrations/*.{ts,js}')],
  migrationsRun: productionEnvironment,
  synchronize: !productionEnvironment,
});
