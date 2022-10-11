jest.setTimeout(30000);

import { INestApplication } from '@nestjs/common';
import { AuthMessages } from 'src/auth/enums/auth-messages';
import { AuthRoutes } from 'src/auth/enums/auth-routes';
import { AUTH_ROUTE } from 'src/lib/constants';
import { TestDatabaseService } from 'test/helpers/database/database.service';
import { initializeEndToEndTestModule } from 'test/helpers/utils/initializeEndToEndTestModule';
import * as request from 'supertest';
import { MailgunService } from 'src/apis/mailgun/mailgun.service';
import {
  FakeUser,
  generateFakeUser,
} from 'test/helpers/utils/generateFakeUser';
import { faker } from '@faker-js/faker';
import { CodesService } from 'src/codes/codes.service';
import { AccountRoutes } from 'src/accounts/enums/account-routes';
import { CreateAccountDto } from 'src/accounts/dto/create-account.dto';
import { RegisterViewDto } from 'src/auth/dto/register-view.dto';
import { CodeMessages } from 'src/codes/enums/code-messages';
import { AccountMessages } from 'src/accounts/enums/account-messages';

describe('(POST) create', () => {
  let app: INestApplication;
  let databaseService: TestDatabaseService;
  let mailgunService: MailgunService;
  let server: any;

  beforeAll(async () => {
    const { nestApp, database, moduleRef } =
      await initializeEndToEndTestModule();

    app = nestApp;
    databaseService = database;
    mailgunService = moduleRef.get<MailgunService>(MailgunService);
    server = app.getHttpServer();
  });

  afterAll(async () => {
    await databaseService.clearAllTables();
    await databaseService.disconnectDatabase();
    await app.close();
  });

  const INVALID_VERIFICATION_CODE = '111111';
  const INVALID_EMAIL_ADDRESS = 'invalid@gmail.com';
  const user: FakeUser = generateFakeUser();
  let codeSentForRegister = false;

  const verification_code = faker.datatype
    .number({ min: 100000, max: 999999 })
    .toString();

  beforeEach(async () => {
    // don't send a real mail
    jest
      .spyOn(mailgunService, 'sendVerificationMail')
      .mockImplementation(() => Promise.resolve() as any);

    //private method, return a custom generated code
    jest
      .spyOn(CodesService.prototype, 'generateCode' as any)
      .mockReturnValue(verification_code);
  });

  async function sendVerificationCodeForNewUser(
    user: FakeUser,
  ): Promise<{ message: string } | void> {
    // send account verification request for user
    // create a code for given username and email
    // then sent a code to which email address received

    // just send once otherwise throws an error email or username already registered
    if (!codeSentForRegister) {
      const { body } = await request(server)
        .post('/accounts' + AccountRoutes.BEGIN_REGISTER_VERIFICATION)
        .send(user);

      codeSentForRegister = true;

      return body.message;
    }
  }

  async function sendRegisterRequest(createAccountDto: CreateAccountDto) {
    const result: { body: { data: RegisterViewDto; message: AuthMessages } } =
      await request(server)
        .post(AUTH_ROUTE + AuthRoutes.REGISTER)
        .send(createAccountDto);

    return result;
  }

  describe('scenario : invalid verification code is sent', () => {
    it('should return "invalid code" error', async () => {
      await sendVerificationCodeForNewUser(user);

      const result = await sendRegisterRequest({
        ...user,
        verification_code: INVALID_VERIFICATION_CODE,
      });

      expect(result.body.message).toEqual(CodeMessages.INVALID_CODE);
    });
  });

  describe('scenario : invalid email address is sent', () => {
    it('should return "invalid email" error', async () => {
      await sendVerificationCodeForNewUser(user);

      const result = await sendRegisterRequest({
        ...user,
        verification_code,
        email: INVALID_EMAIL_ADDRESS,
      });

      expect(result.body.message).toEqual(AccountMessages.INVALID_EMAIL);
    });
  });

  describe('valid email address & valid verification code is sent', () => {
    it('should return an access_token and account', async () => {
      await sendVerificationCodeForNewUser(user);

      const result = await sendRegisterRequest({
        ...user,
        verification_code,
      });

      expect(result.body.data.access_token).toEqual(expect.any(String));
    });
  });
});
