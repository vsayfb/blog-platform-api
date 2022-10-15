export const TwilioService = jest.fn().mockReturnValue({
  sendMessage: jest.fn().mockResolvedValue(undefined),
});
