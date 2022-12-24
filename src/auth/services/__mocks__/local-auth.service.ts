import { accountStub } from 'src/accounts/test/stub/account.stub';
import { CodeMessages } from 'src/global/verification_codes/enums/code-messages';

export const LocalAuthService = jest.fn().mockReturnValue({
  register: jest
    .fn()
    .mockResolvedValue({ account: accountStub(), access_token: '' }),

  login: jest
    .fn()
    .mockReturnValue({ account: accountStub(), access_token: '' }),

  validateAccount: jest.fn().mockResolvedValue(accountStub()),

  beginRegisterVerification: jest
    .fn()
    .mockResolvedValue({ message: CodeMessages.CODE_SENT_TO_MAIL }),
});
