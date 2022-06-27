export const MailgunService = jest.fn().mockReturnValue({
  sendVerificationMail: jest.fn().mockResolvedValue(null),
});
