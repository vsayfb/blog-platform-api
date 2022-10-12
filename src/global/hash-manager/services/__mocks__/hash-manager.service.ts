import { hashStub } from '../../test/stub/hash.stub';

export const HashManagerService = jest.fn().mockReturnValue({
  manager: {
    hash: jest.fn().mockResolvedValue(hashStub().hashedText),
    compare: jest.fn().mockResolvedValue(true),
  },
});
