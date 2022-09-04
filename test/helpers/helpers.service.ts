import { INestApplication, Injectable } from '@nestjs/common';
import { Role } from 'src/accounts/entities/account.entity';
import { AccessToken } from 'src/auth/dto/access-token.dto';
import {
  DatabaseUser,
  TestDatabaseService,
} from '../database/database.service';
import * as request from 'supertest';
import { PostRoutes } from 'src/posts/enums/post-routes';
import { CreatedPostDto } from 'src/posts/dto/created-post.dto';
import { CommentRoutes } from 'src/comments/enums/comment-routes';
import { generateFakeComment } from 'test/utils/generateFakeComment';
import { SelectedCommentFields } from 'src/comments/types/selected-comment-fields';
import { TagRoutes } from 'src/tags/enums/tag-routes';
import { SelectedTagFields } from 'src/tags/types/selected-tag-fields';
import { generateFakePost } from 'test/utils/generateFakePost';
import { generateFakeTag } from 'test/utils/generateFakeTag';
import { ChatMessages } from '../../src/chats/enums/chat-messages';
import { MessageViewDto } from '../../src/messages/dto/message-view.dto';
import { MessageMessages } from '../../src/messages/enums/message-messages';

@Injectable()
export class HelpersService {
  constructor(private readonly testDatabaseService: TestDatabaseService) {}

  async loginRandomAccount(
    app: INestApplication,
    role?: Role,
  ): Promise<{
    token: string;
    user: DatabaseUser;
  }> {
    const user = await this.testDatabaseService.createRandomTestUser(role);

    const token = await this.takeToken(app, user.username, user.password);

    return { token, user };
  }

  async takeToken(
    app: INestApplication,
    usernameOrEmail: string,
    password: string,
  ) {
    const result: { body: { data: AccessToken; message: string } } =
      await request(app.getHttpServer())
        .post('/auth/login')
        .send({ username: usernameOrEmail, password });

    return 'Bearer ' + result.body.data.access_token;
  }

  async takeTokenByID(app: INestApplication, accountID: string) {
    const account = await this.testDatabaseService.getAccountByID(accountID);

    return await this.takeToken(
      app,
      account.rows[0].username,
      account.rows[0].password,
    );
  }

  async createRandomPost(
    app: INestApplication,
    role?: Role,
    token?: string,
  ): Promise<{ body: { data: CreatedPostDto; message: string } }> {
    const dto = generateFakePost();

    if (!token) {
      const account = await this.loginRandomAccount(app, role);
      token = account.token;
    }

    const { body } = await request(app.getHttpServer())
      .post('/posts' + PostRoutes.CREATE)
      .set('Authorization', token)
      .send(dto);

    return { body };
  }

  async createRandomComment(
    app: INestApplication,
    postID?: string,
    role?: Role,
    token?: string,
  ): Promise<{ body: { data: SelectedCommentFields; message: string } }> {
    const dto = generateFakeComment();

    const author = await this.loginRandomAccount(app, role);

    if (!postID) {
      const randomPost = await this.createRandomPost(app);

      postID = randomPost.body.data.id;
    }

    const { body } = await request(app.getHttpServer())
      .post('/comments' + CommentRoutes.CREATE + postID)
      .set('Authorization', token || author.token)
      .send(dto);

    return { body };
  }

  async createRandomTag(
    app: INestApplication,
    role?: Role,
  ): Promise<
    {
      body: { data: SelectedTagFields; message: string };
    } & {
      statusCode: number;
    }
  > {
    const moderator = await this.loginRandomAccount(
      app,
      role || Role.MODERATOR,
    );

    const result = await request(app.getHttpServer())
      .post('/tags' + TagRoutes.CREATE)
      .set('Authorization', moderator.token)
      .send(generateFakeTag());

    return { body: result.body, statusCode: result.statusCode };
  }

  async createRandomChat(
    app: INestApplication,
    initiatorToken?: string,
    toID?: string,
  ) {
    const chatInitiator = await this.loginRandomAccount(app);

    const to = await this.loginRandomAccount(app);

    const chat: {
      body: {
        data: {
          id: string;
          content: string;
        };
        message: ChatMessages;
      };
    } = await request(app.getHttpServer())
      .post('/chats')
      .set('Authorization', initiatorToken || chatInitiator.token)
      .send({ firstMessage: 'random-comment', toID: toID || to.user.id });

    return { ...chat.body, initiator: chatInitiator };
  }

  async createMessage(
    app: INestApplication,
    chatID: string,
    senderToken: string,
    message?: string,
  ): Promise<{
    data: MessageViewDto;
    message: MessageMessages;
  }> {
    const result: { body: { data: MessageViewDto; message: MessageMessages } } =
      await request(app.getHttpServer())
        .post(`/messages/to/${chatID}`)
        .set('Authorization', senderToken)
        .send({ content: message || 'random-message' });

    return result.body;
  }
}
