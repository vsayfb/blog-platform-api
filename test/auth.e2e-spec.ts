import { CreateAccountDto } from './../src/accounts/dto/create-account.dto';
import { FakeUser } from './helpers/faker/generateFakeUser';
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from 'src/app.module';
import { DatabaseService } from 'src/database/database.service';
import { CodesService } from 'src/codes/codes.service';
import { MailgunService } from 'src/apis/mailgun/mailgun.service';
import { faker } from '@faker-js/faker';
import { generateFakeUser } from 'test/helpers/faker/generateFakeUser';
import { AuthMessages } from 'src/auth/enums/auth-messages';
import { CodeMessages } from 'src/codes/enums/code-messages';
import { AccountMessages } from 'src/accounts/enums/account-messages';
import { AuthRoutes } from 'src/auth/enums/auth-routes';
import { AccountRoutes } from 'src/accounts/enums/account-routes';

const PREFIX = '/auth';

describe('AuthController (e2e)', () => {
  let app: INestApplication;
  let databaseService: DatabaseService;
  let mailgunService: MailgunService;

  beforeAll(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();

    app.useGlobalPipes(new ValidationPipe());

    await app.init();

    databaseService = moduleRef.get<DatabaseService>(DatabaseService);
    mailgunService = moduleRef.get<MailgunService>(MailgunService);
  });

  afterAll(async () => {
    await databaseService.clearTableRows('account');
    await databaseService.clearTableRows('code');
    await databaseService.closeDatabase();
    await app.close();
  });

  describe('/ (POST) login', () => {
    describe('the given dto includes wrong values', () => {
      it('should return Invalid Credentials error', async () => {
        const result = await request(app.getHttpServer())
          .post(PREFIX + AuthRoutes.LOGIN)
          .send({ ...generateFakeUser() });

        expect(result.body.message).toBe(AuthMessages.INVALID_CREDENTIALS);
      });
    });

    describe('the given dto includes correct values', () => {
      it('should return an access_token', async () => {
        const user = await databaseService.createRandomTestUser();

        const result = await request(app.getHttpServer())
          .post(PREFIX + AuthRoutes.LOGIN)
          .send(user);

        expect(result.body.access_token).toEqual(expect.any(String));
      });
    });
  });

  describe('/ (POST) new local account', () => {
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
        const { body } = await request(app.getHttpServer())
          .post('/accounts' + AccountRoutes.BEGIN_REGISTER_VERIFICATION)
          .send(user);

        codeSentForRegister = true;

        return body.message;
      }
    }

    async function sendRegisterRequest(createAccountDto: CreateAccountDto) {
      const result = await request(app.getHttpServer())
        .post(PREFIX + AuthRoutes.REGISTER)
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

        const { data, access_token } = result.body;

        expect(data).toEqual({
          id: expect.any(String),
          image: null,
          display_name: expect.any(String),
          username: expect.any(String),
        });

        expect(access_token).toEqual(expect.any(String));
      });
    });
  });
});
