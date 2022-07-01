import { randomUUID } from 'crypto';
import { accountStub } from '../accounts/tests/stub/account.stub';

const data = { id: randomUUID(), ...accountStub() } as any;

export const mockRepository = {
  findOne: jest.fn().mockResolvedValue(data),
  find: jest.fn().mockResolvedValue([]),
  save: jest
    .fn()
    .mockImplementation((dto) => Promise.resolve({ id: randomUUID(), ...dto })),
};
