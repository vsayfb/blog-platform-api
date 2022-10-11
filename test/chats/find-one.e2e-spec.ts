jest.setTimeout(30000);

import { INestApplication } from '@nestjs/common';
import { HelpersService } from 'test/helpers/helpers.service';
import { initializeEndToEndTestModule } from 'test/helpers/utils/initializeEndToEndTestModule';
import { ChatMessages } from 'src/chats/enums/chat-messages';
import { Chat } from 'src/chats/entities/chat.entity';
import { CHATS_ROUTE } from 'src/lib/constants';
import { ChatRoutes } from 'src/chats/enums/chat-routes';
import * as request from 'supertest';
import { randomUUID } from 'crypto';

describe('(GET) find one', () => {
  let app: INestApplication;
  let helpersService: HelpersService;
  let server: any;

  beforeAll(async () => {
    const { nestApp, helpers } = await initializeEndToEndTestModule();

    app = nestApp;
    helpersService = helpers;
    server = app.getHttpServer();
  });

  describe('scenario : if a chat found with chatID', () => {
    test('should return a chat', async () => {
      const chat = await helpersService.createRandomChat(app);

      const result: { body: { data: Chat; message: ChatMessages } } =
        await request(server)
          .get(CHATS_ROUTE + ChatRoutes.FIND_ONE + chat.data.id)
          .set('Authorization', chat.initiator.token);

      expect(result.body.message).toBe(ChatMessages.FOUND);
    });
  });

  describe('scenario : if a chat not found with chatID', () => {
    test('should throw Chat Not Found', async () => {
      const chat = await helpersService.createRandomChat(app);

      const result: { body: { data: Chat; message: ChatMessages } } =
        await request(server)
          .get(CHATS_ROUTE + ChatRoutes.FIND_ONE + randomUUID())
          .set('Authorization', chat.initiator.token);

      expect(result.body.message).toBe(ChatMessages.NOT_FOUND);
    });
  });
});
