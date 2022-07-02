import { INestApplication } from '@nestjs/common';
import { AccessToken } from 'src/auth/dto/access-token.dto';
import * as request from 'supertest';

export async function loginAccount(
  app: INestApplication,
  usernameOrEmail: string,
  password: string,
): Promise<{
  user: { username: string; password: string };
  access_token: string;
}> {
  const result: { body: AccessToken } = await request(app.getHttpServer())
    .post('/auth/login')
    .send({ username: usernameOrEmail, password });

  return {
    user: { username: usernameOrEmail, password },
    access_token: result.body.access_token,
  };
}
