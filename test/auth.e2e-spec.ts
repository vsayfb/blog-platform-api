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
} from 'src/common/error-messages';

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
    await databaseService.clearTableRows('codes');
    await databaseService.removeTestUser();
    await app.close();
  });

  describe('/ (POST) login', () => {
    beforeAll(async () => {
      await databaseService.createTestUser();
    });

    afterAll(async () => {
      await databaseService.removeTestUser();
    });

    describe('the given dto includes wrong values', () => {
      it('should return Invalid Credentials error', async () => {
        const result = await request(app.getHttpServer())
          .post('/auth/login')
          .send({
            username: DatabaseService.testUsername,
            password: DatabaseService.testUserWrongPassword,
          });

        expect(result.body.message).toBe(INVALID_CREDENTIALS);
      });
    });

    describe('the given dto includes correct values', () => {
      it('should return Invalid Credentials error', async () => {
        const result = await request(app.getHttpServer())
          .post('/auth/login')
          .send({
            username: DatabaseService.testUsername,
            password: DatabaseService.testUserCorrectPassword,
          });

        expect(result.body.access_token).toEqual(expect.any(String));
      });
    });
  });

  describe('/ (POST) new local account', () => {
    beforeAll(async () => {
      //private method
      jest
        .spyOn(CodesService.prototype, 'generateCode' as any)
        .mockReturnValue(verification_code);

      // don't send a real mail
      jest
        .spyOn(mailgunService, 'sendMail')
        .mockImplementation(() => '' as any);
    });

    const verification_code = '12345';
    const invalid_code = '12344';
    const dto = accountStub();

    beforeEach(async () => {
      // sends a verification code which email adress requests
      await request(app.getHttpServer())
        .post('/accounts/begin_verification')
        .send({ email: dto.email });
    });

    describe('scenario : invalid verification code is sent', () => {
      it('should return "invalid code" error', async () => {
        const result = await request(app.getHttpServer())
          .post('/auth/register')
          .send({ ...dto, verification_code: invalid_code });

        expect(result.body.message).toEqual(INVALID_CODE);
      });
    });

    describe('scenario : invalid email address is sent', () => {
      it('should return "invalid email" error', async () => {
        const result = await request(app.getHttpServer())
          .post('/auth/register')
          .send({
            ...dto,
            email: 'invalid@gmail.com',
            verification_code,
          });

        expect(result.body.message).toEqual(INVALID_EMAIL);
      });
    });

    describe('valid email address & valid verification code is sent', () => {
      it('should return an access_token and account', async () => {
        const result = await request(app.getHttpServer())
          .post('/auth/register')
          .send({ ...dto, verification_code });

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
