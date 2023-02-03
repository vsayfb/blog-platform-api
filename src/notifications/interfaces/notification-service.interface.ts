import {
  CodeProcess,
  VerificationCode,
} from 'src/resources/verification_codes/entities/code.entity';

export interface INotificationService {
  notify(receiver: string, data: string): Promise<VerificationCode>;

  notifyForTFA(
    receiver: string,
    process: CodeProcess,
  ): Promise<VerificationCode>;

  notifyForRegister(
    username: string,
    receiver: string,
  ): Promise<VerificationCode>;
}
