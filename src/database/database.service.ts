import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Client } from 'pg';
import { DEV_DATABASE, NODE_ENV } from 'src/lib/env';

@Injectable()
export class DatabaseService {
  private db: Client;

  constructor(configService: ConfigService) {
    // do not use on production
    if (configService.get<string>(NODE_ENV) !== 'production') {
      this.db = new Client({
        connectionString: configService.get<string>(DEV_DATABASE),
      });

      this.connect();
    }
  }

  private async connect() {
    return await this.db.connect();
  }

  async clearTableRows(table: string) {
    await this.db.query(`DELETE FROM ${table}`);
  }

  async closeDatabase() {
    return this.db.end();
  }

  async createTestUser({
    username,
    password,
    email,
  }: {
    username: string;
    password: string;
    email: string;
  }) {
    await this.db.query(
      `INSERT INTO account (username,password,email,display_name) VALUES ('${username}','${password}','${email}','fooDisplay')`,
    );
  }
}
