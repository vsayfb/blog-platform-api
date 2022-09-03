export const ChatsGateway = jest.fn().mockReturnValue({
  handleChat: jest.fn(),
  sendMessageToChat: jest.fn(),
});
