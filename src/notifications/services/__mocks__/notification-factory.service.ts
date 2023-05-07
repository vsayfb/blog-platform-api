import { verificationCodeDummy } from '../../../resources/verification_codes/dummy/verification-code.dummy';

export const NotificationFactory = jest.fn().mockReturnValue({
  createNotification: jest
    .fn()
    .mockReturnValue({
      notifyForTFA: jest.fn().mockReturnValue(verificationCodeDummy()),
    }),
});
