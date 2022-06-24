import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from 'src/app.module';
import { DatabaseService } from 'src/database/database.service';
import { accountStub } from 'src/accounts/tests/stub/account.stub';
import { CodesService } from 'src/codes/codes.service';
import { MailgunService } from 'src/apis/mailgun/mailgun.service';
import {
  INVALID_CODE,
  INVALID_CREDENTIALS,
  INVALID_EMAIL,
} from 'src/lib/error-messages';
import { faker } from '@faker-js/faker';

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
    await databaseService.clearTableRows('code');

    await app.close();
  });

  describe('/ (POST) login', () => {
    beforeAll(async () => {
      await databaseService.createTestUser();
    });

    describe('the given dto includes wrong values', () => {
      it('should return Invalid Credentials error', async () => {
        const result = await request(app.getHttpServer())
          .post('/auth/login')
          .send({ ...databaseService.getTestUser(), password: 'incorrect' });

        expect(result.body.message).toBe(INVALID_CREDENTIALS);
      });
    });

    describe('the given dto includes correct values', () => {
      it('should return an access_token', async () => {
        const result = await request(app.getHttpServer())
          .post('/auth/login')
          .send(databaseService.getTestUser());

        expect(result.body.access_token).toEqual(expect.any(String));
      });
    });
  });

  describe('/ (POST) new local account', () => {
    let verification_code: string;
    const INVALID_VERIFICATION_CODE = '12344';
    const dto = accountStub();
    let email: string;

    beforeAll(async () => {
      // don't send a real mail
      jest
        .spyOn(mailgunService, 'sendMail')
        .mockImplementation(() => Promise.resolve() as any);
    });

    beforeEach(async () => {
      //private method return custom code
      const code = faker.datatype.number({ min: 10000, max: 99999 });

      verification_code = code.toString();

      jest
        .spyOn(CodesService.prototype, 'generateCode' as any)
        .mockReturnValue(code);

      // send verification request for generating a code before each request

      email = faker.internet.email();

      await request(app.getHttpServer())
        .post('/accounts/begin_verification')
        .send({ email });
    });

    afterEach(async () => {
      await databaseService.removeTestUser();
    });

    describe('scenario : invalid verification code is sent', () => {
      it('should return "invalid code" error', async () => {
        const result = await request(app.getHttpServer())
          .post('/auth/register')
          .send({
            ...dto,
            email,
            verification_code: INVALID_VERIFICATION_CODE,
          });

        expect(result.body.message).toEqual(INVALID_CODE);
      });
    });

    describe('scenario : invalid email address is sent', () => {
      it('should return "invalid email" error', async () => {
        const result = await request(app.getHttpServer())
          .post('/auth/register')
          .send({
            ...dto,
            verification_code,
            email: 'invalid@gmail.com',
          });

        expect(result.body.message).toEqual(INVALID_EMAIL);
      });
    });

    describe('valid email address & valid verification code is sent', () => {
      it('should return an access_token and account', async () => {
        const result = await request(app.getHttpServer())
          .post('/auth/register')
          .send({ ...dto, email, verification_code });

        const { account, access_token } = result.body;

        expect(account).toEqual({
          id: expect.any(String),
          image: expect.any(String),
          username: dto.username,
        });

        expect(access_token).toEqual(expect.any(String));
      });
    });
  });
});
