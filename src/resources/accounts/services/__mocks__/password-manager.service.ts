import { hashStub } from 'src/global/hash-manager/test/stub/hash.stub';

export const PasswordManagerService = jest.fn().mockReturnValue({
  comparePassword: jest.fn().mockResolvedValue(true),
  hashPassword: jest.fn().mockResolvedValue(hashStub().hashedText),
});
