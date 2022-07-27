import { accountStub } from 'src/accounts/test/stub/account.stub';
import { Test } from '@nestjs/testing';
import { MailgunService } from 'src/apis/mailgun/mailgun.service';
import { ConfigService } from '@nestjs/config';
import { codeStub } from 'src/codes/stub/code.stub';

describe('MailgunService', () => {
  let mailgunService: MailgunService;
  const configService = { get: jest.fn().mockReturnValue('mailgun_username') };

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [
        MailgunService,
        { provide: ConfigService, useValue: configService },
      ],
    }).compile();

    mailgunService = moduleRef.get<MailgunService>(MailgunService);
  });

  describe('sendVerificationMail', () => {
    let result: boolean;

    const code = codeStub().code;

    const from = configService.get();

    const to = { email: 'foo@gmail.com', username: accountStub().username };

    const verificationMailOptions = {
      template: 'verification_code',
      'h:X-Mailgun-Variables': JSON.stringify({
        code,
        username: to.username,
      }),
    };

    describe('when sendVerificationMail is called', () => {
      beforeEach(async () => {
        //spyOn private method
        jest
          .spyOn(MailgunService.prototype, 'sendMail' as any)
          .mockResolvedValue(true);

        result = await mailgunService.sendVerificationMail(to, code);
      });

      test('calls configService.get method', () => {
        expect(configService.get).toHaveBeenCalled();
      });

      test('calls mailgunService.sendMail method', () => {
        //@ts-ignore private method
        expect(mailgunService.sendMail).toHaveBeenCalledWith(
          from,
          to.email,
          'Verification Code',
          verificationMailOptions,
        );
      });

      it('should return true', () => {
        expect(result).toBe(true);
      });
    });
  });
});
