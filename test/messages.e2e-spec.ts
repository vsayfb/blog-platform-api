import { randomUUID } from 'crypto';

jest.setTimeout(30000);

import { initializeEndToEndTestModule } from './utils/initializeEndToEndTestModule';
import { INestApplication } from '@nestjs/common';
import { HelpersService } from './helpers/helpers.service';
import * as request from 'supertest';
import { MessageRoutes } from '../src/messages/enums/message-routes';
import { MessageMessages } from '../src/messages/enums/message-messages';
import { ChatMessages } from '../src/chats/enums/chat-messages';

const PREFIX = '/messages';

describe('Messages (e2e)', () => {
  let app: INestApplication;
  let helpersService: HelpersService;
  let server: any;

  beforeAll(async () => {
    const { nestApp, helpers } = await initializeEndToEndTestModule();

    app = nestApp;
    server = app.getHttpServer();
    helpersService = helpers;
  });

  describe('POST create', () => {
    describe('when create is called', () => {
      describe('scenario : if chat is not found', () => {
        test('should throw Chat Not Found', async () => {
          const user = await helpersService.loginRandomAccount(app);

          const result = await request(server)
            .post(PREFIX + MessageRoutes.CREATE + randomUUID())
            .send({ content: 'blah' })
            .set('Authorization', user.token);

          expect(result.body.message).toBe(ChatMessages.NOT_FOUND);
        });
      });

      describe("scenario : if user is chat's initiator", () => {
        test('should return the message', async () => {
          const chat = await helpersService.createRandomChat(app);

          const result = await request(server)
            .post(PREFIX + MessageRoutes.CREATE + chat.data.id)
            .set('Authorization', chat.initiator.token)
            .send({ content: 'random-comment' });

          expect(result.body.message).toBe(MessageMessages.SENT);
        });
      });
    });
  });
});
