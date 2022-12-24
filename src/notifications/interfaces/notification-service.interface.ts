import { VerificationCode } from 'src/global/verification_codes/entities/code.entity';
import { TFAProcess } from 'src/security/types/tfa-process';

export interface INotificationService {
  notify(receiver: string, data: string): Promise<VerificationCode>;

  notifyForTFA(
    receiver: string,
    process: TFAProcess,
  ): Promise<VerificationCode>;

  notifyForRegister(
    username: string,
    receiver: string,
  ): Promise<VerificationCode>;
}
