jest.setTimeout(30000);

import { INestApplication } from '@nestjs/common';
import { HelpersService } from 'test/helpers/helpers.service';
import { initializeEndToEndTestModule } from 'test/helpers/utils/initializeEndToEndTestModule';
import { randomUUID } from 'crypto';
import { AccountMessages } from 'src/accounts/enums/account-messages';
import { ChatMessages } from 'src/chats/enums/chat-messages';

describe('(POST) create', () => {
  let app: INestApplication;
  let helpersService: HelpersService;

  beforeAll(async () => {
    const { nestApp, helpers } = await initializeEndToEndTestModule();

    app = nestApp;
    helpersService = helpers;
  });

  describe('scenario : an account not found with toID', () => {
    test('should throw Account Not Found error', async () => {
      const chat = await helpersService.createRandomChat(app, '', randomUUID());

      expect(chat.message).toBe(AccountMessages.NOT_FOUND);
    });
  });

  describe('scenario : if an account found with toID', () => {
    test('should return created chat', async () => {
      const chat = await helpersService.createRandomChat(app);

      expect(chat.message).toBe(ChatMessages.CREATED);
    });
  });

  describe('scenario : if user re-create chat with same toID', () => {
    test('should throw error', async () => {
      const initiator = await helpersService.loginRandomAccount(app);

      const to = await helpersService.loginRandomAccount(app);

      await helpersService.createRandomChat(app, initiator.token, to.user.id);

      const result = await helpersService.createRandomChat(
        app,
        initiator.token,
        to.user.id,
      );

      expect(result.message).toBe(ChatMessages.ALREADY_CREATED);
    });
  });
});
