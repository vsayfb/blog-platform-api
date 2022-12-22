import { TFAProcess } from "src/security/types/tfa-process";

export interface INotificationService {
  notify(receiver: string, data: string): Promise<void>;

  notifyForTFA(receiver: string, process: TFAProcess): Promise<void>;

  notifyForRegister(username: string, receiver: string): Promise<void>;
}
