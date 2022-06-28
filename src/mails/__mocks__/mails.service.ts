import { CODE_SENT } from 'src/lib/api-messages';
export const MailsService = jest.fn().mockReturnValue({
  sendVerificationCode: jest.fn().mockResolvedValue({ message: CODE_SENT }),
});
