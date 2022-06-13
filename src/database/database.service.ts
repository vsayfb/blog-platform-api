import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Client } from 'pg';

@Injectable()
export class DatabaseService {
  private db: Client;

  static testUsername = 'test_user';
  static testUserCorrectPassword = 'test_correct_password';
  static testUserWrongPassword = 'test_wrong_password';

  constructor(configService: ConfigService) {
    this.db = new Client({
      connectionString: configService.get<string>('DEV_DATABASE'),
    });

    this.db.connect();
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
    await this.db.query(
      `DELETE FROM account WHERE username = '${DatabaseService.testUsername}'`,
    );
  }
}
