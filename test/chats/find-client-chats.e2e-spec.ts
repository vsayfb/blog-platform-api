jest.setTimeout(30000);

import { INestApplication } from '@nestjs/common';
import { HelpersService } from 'test/helpers/helpers.service';
import { initializeEndToEndTestModule } from 'test/helpers/utils/initializeEndToEndTestModule';
import { ChatMessages } from 'src/chats/enums/chat-messages';
import { Chat } from 'src/chats/entities/chat.entity';
import { CHATS_ROUTE } from 'src/lib/constants';
import * as request from 'supertest';
import { ChatRoutes } from 'src/chats/enums/chat-routes';

describe('(GET) client chats', () => {
  let app: INestApplication;
  let helpersService: HelpersService;
  let server: any;

  beforeAll(async () => {
    const { nestApp, helpers } = await initializeEndToEndTestModule();

    app = nestApp;
    helpersService = helpers;
    server = app.getHttpServer();
  });

  test('should return an array of chats', async () => {
    const chat = await helpersService.createRandomChat(app);

    const result: {
      body: { data: Chat[]; message: ChatMessages.ALL_FOUND };
    } = await request(server)
      .get(CHATS_ROUTE + ChatRoutes.FIND_CLIENT_CHATS)
      .set('Authorization', chat.initiator.token);

    expect(result.body.message).toEqual(ChatMessages.ALL_FOUND);
  });
});
