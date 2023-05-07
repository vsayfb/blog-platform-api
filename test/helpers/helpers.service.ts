import { INestApplication, Injectable } from '@nestjs/common';
import { Role } from 'src/resources/accounts/entities/account.entity';
import { DatabaseUser, TestDatabaseService } from './database/database.service';
import * as request from 'supertest';
import { LoginDto } from '../../src/auth/response-dto/login.dto';
import { AuthRoutes } from '../../src/auth/enums/auth-routes';
import { AUTH_ROUTE, LOCAL_AUTH_ROUTE } from '../../src/lib/constants';

@Injectable()
export class HelpersService {
  constructor(private readonly testDatabaseService: TestDatabaseService) {}

  async loginRandomAccount(
    app: INestApplication,
    role?: Role,
  ): Promise<{
    token: string;
    user: DatabaseUser;
  }> {
    const user = await this.testDatabaseService.createRandomTestUser(role);

    const token = await this.takeToken(app, user.username, user.password);

    return { token, user };
  }

  async takeToken(
    app: INestApplication,
    usernameOrEmail: string,
    password: string,
  ) {
    const result: { body: { data: LoginDto; message: string } } = await request(
      app.getHttpServer(),
    )
      .post(LOCAL_AUTH_ROUTE + AuthRoutes.LOGIN)
      .send({ username: usernameOrEmail, password });

    return 'Bearer ' + result.body.data.access_token;
  }

  async takeTokenByID(app: INestApplication, accountID: string) {
    const account = await this.testDatabaseService.getAccountByID(accountID);

    return await this.takeToken(
      app,
      account.rows[0].username,
      account.rows[0].password,
    );
  }
}
