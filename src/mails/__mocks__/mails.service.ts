import { CodeMessages } from 'src/codes/enums/code-messages';

export const MailsService = jest.fn().mockReturnValue({
  sendVerificationCode: jest
    .fn()
    .mockResolvedValue({ message: CodeMessages.CODE_SENT }),
});
