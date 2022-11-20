import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Client, QueryResult } from 'pg';
import {
  Account,
  RegisterType,
  Role,
} from 'src/accounts/entities/account.entity';
import { PasswordManagerService } from 'src/accounts/services/password-manager.service';
import { ProcessEnv } from 'src/lib/enums/env';
import { generateFakeUser } from 'test/helpers/utils/generateFakeUser';

export type DatabaseUser = {
  id: string;
  username: string;
  display_name: string;
  email: string;
  password: string;
  image: null | string;
  via: RegisterType;
  role: Role;
};

@Injectable()
export class TestDatabaseService {
  private db: Client;

  constructor(
    private readonly configService: ConfigService,
    private readonly passwordManagerService: PasswordManagerService,
  ) {}

  async connectDatabase(): Promise<void> {
    this.db = new Client({
      connectionString: this.configService.get<string>(ProcessEnv.DEV_DATABASE),
    });

    await this.db.connect();
  }

  async clearAllTables() {
    await this.db.query(`DELETE FROM follow`);
    await this.db.query(`DELETE FROM post_tags_tag`);
    await this.db.query(`DELETE FROM code`);
    await this.db.query(`DELETE FROM notification`);
    await this.db.query(`DELETE FROM tag`);
    await this.db.query(`DELETE FROM bookmark`);
    await this.db.query(`DELETE FROM post`);
    await this.db.query(`DELETE FROM comment`);
    await this.db.query(`DELETE FROM chat`);
    await this.db.query(`DELETE FROM message`);
    await this.db.query(`DELETE FROM account`);
    await this.db.query(`DELETE FROM expression`);
  }

  async clearTableRows(table: string) {
    await this.db.query(`DELETE FROM ${table}`);
  }

  async disconnectDatabase() {
    return await this.db.end();
  }

  async getAccountByID(id: string): Promise<QueryResult<Account>> {
    return await this.db.query(`SELECT * FROM account WHERE id='${id}'`);
  }

  async createRandomTestUser(role?: Role): Promise<DatabaseUser> {
    const { username, email, password, display_name, image } =
      generateFakeUser();

    const hashedPassword = await this.passwordManagerService.hashPassword(
      password,
    );

    const query = `INSERT INTO 
    account (username,password,email,display_name,image,role) 
    VALUES ('${username}','${hashedPassword}','${email}','${display_name}','${image}','${
      role || Role.USER
    }')`;

    await this.db.query(query);

    const result = await this.db.query(
      `SELECT * FROM account WHERE username='${username}'`,
    );

    result.rows[0].password = password;

    const { created_at, updated_at, ...user } = result.rows[0];

    return user;
  }
}
