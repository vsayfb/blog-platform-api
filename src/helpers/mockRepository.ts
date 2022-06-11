import { randomUUID } from 'crypto';
import { accountStub } from '../accounts/tests/stub/account.stub';

const data = { id: randomUUID(), ...accountStub() } as any;

export const mockRepository = {
  findOne: jest.fn().mockResolvedValue(data),
  save: jest.fn().mockResolvedValue(data),
};
