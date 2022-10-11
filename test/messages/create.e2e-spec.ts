jest.setTimeout(30000);

import { INestApplication } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { ChatMessages } from 'src/chats/enums/chat-messages';
import { MESSAGES_ROUTE } from 'src/lib/constants';
import { MessageMessages } from 'src/messages/enums/message-messages';
import { MessageRoutes } from 'src/messages/enums/message-routes';
import * as request from 'supertest';
import { HelpersService } from 'test/helpers/helpers.service';
import { generateFakeMessage } from 'test/helpers/utils/generateFakeMessage';
import { initializeEndToEndTestModule } from 'test/helpers/utils/initializeEndToEndTestModule';

describe('(POST) create', () => {
  let app: INestApplication;
  let helpersService: HelpersService;
  let server: any;

  beforeAll(async () => {
    const { nestApp, helpers } = await initializeEndToEndTestModule();

    app = nestApp;
    server = app.getHttpServer();
    helpersService = helpers;
  });

  describe('scenario : if chat is not found', () => {
    test('should return chat not found message', async () => {
      const user = await helpersService.loginRandomAccount(app);

      const result = await request(server)
        .post(MESSAGES_ROUTE + MessageRoutes.CREATE + randomUUID())
        .send(generateFakeMessage())
        .set('Authorization', user.token);

      expect(result.body.message).toBe(ChatMessages.NOT_FOUND);
    });
  });

  describe("scenario : if user is chat's initiator", () => {
    test('should return the message', async () => {
      const chat = await helpersService.createRandomChat(app);

      const result = await request(server)
        .post(MESSAGES_ROUTE + MessageRoutes.CREATE + chat.data.id)
        .send(generateFakeMessage())
        .set('Authorization', chat.initiator.token);

      expect(result.body.message).toBe(MessageMessages.SENT);
    });
  });
});
