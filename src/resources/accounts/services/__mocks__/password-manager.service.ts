import { hashDummy } from '../../../../global/hash-manager/dummy/hash.dummy';

export const PasswordManagerService = jest.fn().mockReturnValue({
  comparePassword: jest.fn().mockResolvedValue(true),
  hashPassword: jest.fn().mockResolvedValue(hashDummy().hashedText),
});
