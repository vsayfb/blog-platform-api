import { hashDummy } from '../../dummy/hash.dummy';

export const HashManagerService = jest.fn().mockReturnValue({
  manager: {
    hash: jest.fn().mockResolvedValue(hashDummy().hashedText),
    compare: jest.fn().mockResolvedValue(true),
  },
});
