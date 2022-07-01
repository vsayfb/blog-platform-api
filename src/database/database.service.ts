import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Client } from 'pg';
import { DEV_DATABASE, NODE_ENV } from 'src/lib/env';
import { generateFakeUser } from 'src/lib/fakers/generateFakeUser';

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

  async createRandomTestUser(): Promise<{
    username: string;
    password: string;
    email: string;
    display_name: string;
  }> {
    const { username, email, password, display_name } = generateFakeUser();

    await this.db.query(
      `INSERT INTO account (username,password,email,display_name) VALUES ('${username}','${password}','${email}','${display_name}')`,
    );

    return { username, email, password, display_name };
  }
}
