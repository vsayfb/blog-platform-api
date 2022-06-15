import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Client } from 'pg';
import { DEV_DATABASE } from 'src/common/env';

@Injectable()
export class DatabaseService {
  private db: Client;

  static testUsername = 'test_user';
  static testUserCorrectPassword = 'test_correct_password';
  static testUserWrongPassword = 'test_wrong_password';

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

  async createTestUser() {
    await this.db.query(
      `INSERT INTO account (username,password,email) VALUES ('${DatabaseService.testUsername}','${DatabaseService.testUserCorrectPassword}','foo@gmail.com') `,
    );
  }

  async removeTestUser() {
    await this.db.query(`DELETE FROM account`);
  }
}
