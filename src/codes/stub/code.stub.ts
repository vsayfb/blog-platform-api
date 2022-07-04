import { randomUUID } from 'crypto';
import { accountStub } from 'src/accounts/test/stub/account.stub';

export const codeStub = {
  id: randomUUID(),
  code: 12345,
  receiver: accountStub().email,
  senderTime: Date.now(),
};
