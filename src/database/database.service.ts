import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Client } from 'pg';

@Injectable()
export class DatabaseService {
  private db: Client;

  static testUsername = 'test_user';
  static testPassword = 'test_password';

  constructor(configService: ConfigService) {
    this.db = new Client({
      connectionString: configService.get<string>('DEV_DATABASE'),
    });

    this.db.connect();
  }

  async dropTable(table: string) {
    await this.db.query(`DROP TABLE ${table}`);
    return this.db.end();
  }

  async createTestUser() {
    await this.db.query(
      `INSERT INTO account (username,password,email) VALUES ('${DatabaseService.testUsername}','${DatabaseService.testPassword}','foo@gmail.com') `,
    );
  }

  async removeTestUser() {
    await this.db.query(
      `DELETE FROM account WHERE username = '${DatabaseService.testUsername}'`,
    );
  }
}
