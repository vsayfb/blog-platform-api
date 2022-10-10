import { ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { accountStub } from 'src/accounts/test/stub/account.stub';
import { MailgunService } from 'src/apis/mailgun/mailgun.service';
import { CodesService } from 'src/codes/codes.service';
import { CodeMessages } from 'src/codes/enums/code-messages';
import { codeStub } from 'src/codes/stub/code.stub';
import { JobsService } from 'src/global/jobs/jobs.service';
import { IMailSenderService } from '../interfaces/mail-sender-service.interface';
import { MailsService } from '../mails.service';

jest.mock('src/codes/codes.service');
jest.mock('src/apis/mailgun/mailgun.service');
jest.mock('src/global/jobs/jobs.service');

describe('MailsService', () => {
  let service: MailsService;
  let codesService: CodesService;
  let jobsService: JobsService;
  let mailSenderService: IMailSenderService;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MailsService,
        CodesService,
        { provide: IMailSenderService, useClass: MailgunService },
        JobsService,
        { provide: ConfigService, useValue: { get: jest.fn(() => '') } },
      ],
    }).compile();

    service = module.get<MailsService>(MailsService);
    codesService = module.get<CodesService>(CodesService);
    mailSenderService = module.get<IMailSenderService>(IMailSenderService);
    jobsService = module.get<JobsService>(JobsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('sendVerificationCode', () => {
    describe('when sendVerificationCode is called', () => {
      const to = {
        email: 'foo@gmail.com',
        username: accountStub().username,
      };
      let result: { message: string };

      beforeEach(
        async () =>
          (result = await service.sendVerificationCode({
            email: to.email,
            username: to.username,
          })),
      );

      test('calls codeService.createCode', () => {
        expect(codesService.createCode).toHaveBeenCalledWith(to.email);
      });

      test('calls mailSenderService.sendVerificationMail', () => {
        expect(mailSenderService.sendVerificationMail).toHaveBeenCalledWith(
          to,
          codeStub().code,
        );
      });

      test('calls jobsService.execAfterTwoMinutes', () => {
        expect(jobsService.execAfterTwoMinutes).toHaveBeenCalledWith(
          expect.any(Function),
        );
      });

      it('should return a message', () => {
        expect(result).toEqual({ message: CodeMessages.CODE_SENT });
      });
    });
  });
});
