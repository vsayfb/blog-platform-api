import { CodeProcess, VerificationCode } from '../entities/code.entity';

export const verificationCodeDummy = (): VerificationCode => ({
  code: '123123',
  id: 'uuid',
  receiver: 'foo@gmail.com',
  process: CodeProcess.REGISTER_WITH_EMAIL,
  token: 'token',
  created_at: new Date(),
});
