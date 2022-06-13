import { Test, TestingModule } from '@nestjs/testing';
import {
  ForbiddenException,
  INestApplication,
  ValidationPipe,
} from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from 'src/app.module';
import { DatabaseService } from 'src/database/database.service';
import { accountStub } from 'src/accounts/tests/stub/account.stub';
import { MailsService } from 'src/mails/mails.service';
import { CodesService } from 'src/codes/codes.service';
import { randomUUID } from 'crypto';
import { MailgunService } from 'src/apis/mailgun/mailgun.service';
import { RegisterViewDto } from 'src/accounts/dto/register-view.dto';
import { INVALID_CODE, INVALID_EMAIL } from 'src/common/error-messages';

describe('AuthController (e2e)', () => {
  let app: INestApplication;
  let databaseService: DatabaseService;
  let codesService: CodesService;
  let mailgunService: MailgunService;

  beforeEach(async () => {
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

  describe('/ (POST) new local account', () => {
    describe('the given dto is missing verification code', () => {
      it('should return "verification_code" error', async () => {
        const result = await request(app.getHttpServer())
          .post('/auth/register')
          .send(accountStub());

        expect(result.body.message[0]).toBe(
          'verification_code must be longer than or equal to 5 characters',
        );

        expect(result.statusCode).toBe(400);
      });
    });

    describe('the given dto meets all conditions', () => {
      const verification_code = '12345';
      const invalid_code = '12344';
      const dto = accountStub();

      beforeEach(async () => {
        //private method
        jest
          .spyOn(CodesService.prototype, 'generateCode' as any)
          .mockReturnValue(verification_code);

        jest
          .spyOn(mailgunService, 'sendMail')
          .mockImplementationOnce(() => '' as any);

        // sends a verification code which email adress requests
        await request(app.getHttpServer())
          .post('/accounts/begin_verification')
          .send({ email: dto.email });
      });

      describe('invalid verification code is sent', () => {
        it('should return "invalid code" error', async () => {
          const result = await request(app.getHttpServer())
            .post('/auth/register')
            .send({ ...dto, verification_code: invalid_code });

          expect(result.body.message).toEqual(INVALID_CODE);
        });
      });

      describe('invalid email address is sent', () => {
        it('should return "invalid email" error', async () => {
          const result = await request(app.getHttpServer())
            .post('/auth/register')
            .send({
              ...dto,
              email: 'foo2@gmail.com',
              verification_code,
            });

          expect(result.body.message).toEqual(INVALID_EMAIL);
        });
      });

      describe('valid email address & verification code is sent', () => {
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
});
