import { randomUUID } from 'crypto';
import { accountStub } from 'src/accounts/tests/stub/account.stub';

export const codeStub = {
  id: randomUUID(),
  code: 12345,
  receiver: accountStub().email,
  senderTime: Date.now(),
};

export const CodesService = jest.fn().mockReturnValue({
  getCode: jest.fn().mockResolvedValue(codeStub),
  createCode: jest.fn().mockResolvedValue(codeStub),
  removeCode: jest.fn().mockResolvedValue({}),
});
