import { tfaDummy } from '../../dummy/tfa-dummy';

export const TwoFactorAuthService = jest.fn().mockReturnValue({
  getOneByAccountID: jest.fn().mockResolvedValue(tfaDummy()),
  delete: jest.fn().mockResolvedValue(undefined),
});
