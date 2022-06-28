import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from 'src/app.module';
import { DatabaseService } from 'src/database/database.service';
import { CodesService } from 'src/codes/codes.service';
import { MailgunService } from 'src/apis/mailgun/mailgun.service';
import {
  INVALID_CODE,
  INVALID_CREDENTIALS,
  INVALID_EMAIL,
} from 'src/lib/api-messages';
import { faker } from '@faker-js/faker';
import { generateFakeUser } from 'src/lib/fakers/generateFakeUser';

describe('AuthController (e2e)', () => {
  let app: INestApplication;
  let databaseService: DatabaseService;
  let codesService: CodesService;
  let mailgunService: MailgunService;

  beforeAll(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();

    app.useGlobalPipes(new ValidationPipe());

    await app.init();

    databaseService = moduleRef.get<DatabaseService>(DatabaseService);
    codesService = moduleRef.get<CodesService>(CodesService);
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
          .post('/auth/login')
          .send({ ...generateFakeUser() });

        expect(result.body.message).toBe(INVALID_CREDENTIALS);
      });
    });

    describe('the given dto includes correct values', () => {
      it('should return an access_token', async () => {
        const user = { ...generateFakeUser() };

        await databaseService.createTestUser(user);

        const result = await request(app.getHttpServer())
          .post('/auth/login')
          .send(user);

        expect(result.body.access_token).toEqual(expect.any(String));
      });
    });
  });

  describe('/ (POST) new local account', () => {
    const INVALID_VERIFICATION_CODE = '111111';
    let verification_code: string;

    async function sendVerificationCodeForNewUser() {
      const user = generateFakeUser();

      // generate a verification code for this user
      await request(app.getHttpServer())
        .post('/accounts/begin_verification')
        .send(user);

      return user;
    }

    async function sendRegisterRequest(
      invalidCode?: string,
      invalidEmail?: string,
    ) {
      const user = await sendVerificationCodeForNewUser();

      const dto = { ...user };

      if (invalidEmail) dto.email = invalidEmail;

      verification_code = invalidCode || verification_code;

      const result = await request(app.getHttpServer())
        .post('/auth/register')
        .send({ ...dto, verification_code });

      return result;
    }

    beforeEach(async () => {
      // don't send a real mail
      jest
        .spyOn(mailgunService, 'sendVerificationMail')
        .mockImplementation(() => Promise.resolve() as any);

      verification_code = faker.datatype
        .number({ min: 100000, max: 999999 })
        .toString();

      //private method, return a custom generated code

      jest
        .spyOn(CodesService.prototype, 'generateCode' as any)
        .mockReturnValue(verification_code);
    });

    describe('scenario : invalid verification code is sent', () => {
      it('should return "invalid code" error', async () => {
        const result = await sendRegisterRequest(INVALID_VERIFICATION_CODE);

        expect(result.body.message).toEqual(INVALID_CODE);
      });
    });

    describe('scenario : invalid email address is sent', () => {
      it('should return "invalid email" error', async () => {
        const result = await sendRegisterRequest(null, 'invalid@gmail.com');

        expect(result.body.message).toEqual(INVALID_EMAIL);
      });
    });

    describe('valid email address & valid verification code is sent', () => {
      it('should return an access_token and account', async () => {
        const result = await sendRegisterRequest(null);

        const { account, access_token } = result.body;

        expect(account).toEqual({
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
