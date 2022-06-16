import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Client } from 'pg';
import { DEV_DATABASE } from 'src/common/env';

@Injectable()
export class DatabaseService {
  private db: Client;

  private testUsername = 'test_user';
  private testUserCorrectPassword = 'test_correct_password';

  constructor(configService: ConfigService) {
    this.db = new Client({
      connectionString: configService.get<string>(DEV_DATABASE),
    });

    this.connect();
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

  getTestUser() {
    return {
      username: this.testUsername,
      password: this.testUserCorrectPassword,
    };
  }

  async createTestUser() {
    await this.db.query(
      `INSERT INTO account (username,password,email) VALUES ('${this.testUsername}','${this.testUserCorrectPassword}','foo@gmail.com')`,
    );
  }

  async removeTestUser() {
    await this.db.query(`DELETE FROM account`);
  }
}
