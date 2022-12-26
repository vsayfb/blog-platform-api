import { CodeProcess, VerificationCode } from '../entities/code.entity';

export const codeStub = (): VerificationCode => ({
  id: '9b1deb4d-3b7d-4bad-9bdd-2b0d5f5dcb6d',
  code: '123456',
  receiver: 'receiver@gmail.com',
  process: CodeProcess.REGISTER_WITH_EMAIL,
  url_token:"asWDmdkQEIKOMD",
  created_at: '2022-07-18T12:55:25.513Z' as unknown as Date,
});
