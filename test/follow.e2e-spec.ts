import { INestApplication, NotFoundException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { Account, Role } from 'src/accounts/entities/account.entity';
import { AccountMessages } from 'src/accounts/enums/account-messages';
import { AppModule } from 'src/app.module';
import { CreateCommentDto } from 'src/comments/dto/create-comment.dto';
import { UpdateCommentDto } from 'src/comments/dto/update-comment.dto';
import { Comment } from 'src/comments/entities/comment.entity';
import { CommentMessages } from 'src/comments/enums/comment-messages';
import { CommentRoutes } from 'src/comments/enums/comment-routes';
import { DatabaseService } from 'src/database/database.service';
import { FollowMessages } from 'src/follow/enums/follow-messages';
import { FollowRoutes } from 'src/follow/enums/follow-routes';
import { Post } from 'src/posts/entities/post.entity';
import * as request from 'supertest';
import { generateFakeComment } from './helpers/faker/generateFakeComment';
import { generateFakePost } from './helpers/faker/generateFakePost';
import { generateFakeUser } from './helpers/faker/generateFakeUser';
import { loginAccount } from './helpers/loginAccount';

const PREFIX = '/follow';

describe('Follow (e2e)', () => {
  let app: INestApplication;
  let databaseService: DatabaseService;
  let server: any;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();

    await app.init();

    server = app.getHttpServer();
    databaseService = moduleRef.get<DatabaseService>(DatabaseService);
  });

  afterAll(async () => {
    await databaseService.clearTableRows('follow');
    await databaseService.closeDatabase();
    await app.close();
  });

  async function takeToken(role?: Role) {
    const user = await databaseService.createRandomTestUser(role);

    const result = await loginAccount(app, user.username, user.password);

    return { token: 'Bearer ' + result.access_token, user };
  }

  async function followAccount(
    followerToken: string,
    followedUsername: string,
  ): Promise<{
    body: { data: string; message: FollowMessages };
    statusCode: number;
  }> {
    const follow = await request(server)
      .post(PREFIX + FollowRoutes.FOLLOW + followedUsername)
      .set('Authorization', followerToken);

    return follow;
  }

  async function unfollowAccount(
    followerToken: string,
    unfollowedUsername: string,
  ): Promise<{
    body: { data: string; message: FollowMessages };
    statusCode: number;
  }> {
    const unfollow = await request(server)
      .delete(PREFIX + FollowRoutes.UNFOLLOW + unfollowedUsername)
      .set('Authorization', followerToken);

    return unfollow;
  }

  describe('follow', () => {
    describe('when follow is called', () => {
      describe('scenario : user follows an account that does not exist', () => {
        test('should return Account Not Found', async () => {
          const user = await takeToken();

          const result = await followAccount(
            user.token,
            generateFakeUser().username,
          );

          expect(result.body.message).toBe(AccountMessages.NOT_FOUND);
        });
      });

      describe('scenario : user re-follows the user', () => {
        test('should return Already followed message', async () => {
          const user = await takeToken();

          const follewedUser = await takeToken();

          await followAccount(user.token, follewedUser.user.username);

          const result = await followAccount(
            user.token,
            follewedUser.user.username,
          );

          expect(result.body.message).toBe(FollowMessages.ALREADY_FOLLOWED);
        });
      });

      describe('scenario : user follows ownself', () => {
        test('should return You cannot follow yourself.', async () => {
          const user = await takeToken();

          const result = await followAccount(user.token, user.user.username);

          expect(result.body.message).toBe(
            FollowMessages.CANNOT_FOLLOW_YOURSELF,
          );
        });
      });

      describe('scenario : user meets all conditions', () => {
        test("should return the followed account's username.", async () => {
          const user = await takeToken();

          const followedUser = await takeToken();

          const result = await followAccount(
            user.token,
            followedUser.user.username,
          );

          expect(result.body.data).toBe(followedUser.user.username);
          expect(result.body.message).toBe(FollowMessages.FOLLOWED);
        });
      });
    });
  });

  describe('unfollow', () => {
    describe('when unfollow is called', () => {
      describe('scenario : user unfollow an account it does not follow', () => {
        test('should return Account Not Found', async () => {
          const user = await takeToken();

          const result = await unfollowAccount(
            user.token,
            generateFakeUser().username,
          );

          expect(result.body.message).toBe(AccountMessages.NOT_FOUND);
        });
      });

      describe('scenario : user unfollow an account', () => {
        test("should return the unfollowed account's username", async () => {
          const user = await takeToken();

          const followedUser = await takeToken();

          await followAccount(user.token, followedUser.user.username);

          const result = await unfollowAccount(
            user.token,
            followedUser.user.username,
          );

          expect(result.body.data).toBe(followedUser.user.username);
          expect(result.body.message).toBe(FollowMessages.UNFOLLOWED);
        });
      });
    });
  });

  describe('findUserFollowers', () => {
    describe('when findUserFollowers is called', () => {
      test("should return an array of user's followers", async () => {
        const user_1 = await takeToken();

        const user1_username = user_1.user.username;

        const user_2 = await takeToken();

        const user_3 = await takeToken();

        await followAccount(user_2.token, user1_username);
        await followAccount(user_3.token, user1_username);

        const user_1_followers: {
          body: {
            data: { createdAt: Date; id: string; follower: Account }[];
            message: FollowMessages;
          };
        } = await request(server).get(
          PREFIX + FollowRoutes.USER_FOLLOWERS + user1_username,
        );

        expect(user_1_followers.body.data[0].follower.username).toBe(
          user_2.user.username,
        );

        expect(user_1_followers.body.data[1].follower.username).toBe(
          user_3.user.username,
        );

        expect(user_1_followers.body.message).toBe(
          FollowMessages.FOLLOWERS_FOUND,
        );
      });
    });
  });

  describe('findUserFollowed', () => {
    describe('when findUserFollowed is called', () => {
      test("should return an array of user's followed", async () => {
        const user_1 = await takeToken();

        const user1_username = user_1.user.username;

        const user_2 = await takeToken();

        const user_3 = await takeToken();

        await followAccount(user_1.token, user_2.user.username);
        await followAccount(user_1.token, user_3.user.username);

        const user_1_followed: {
          body: {
            data: { createdAt: Date; id: string; followed: Account }[];
            message: FollowMessages;
          };
        } = await request(server).get(
          PREFIX + FollowRoutes.USER_FOLLOWED + user1_username,
        );

        expect(user_1_followed.body.data[0].followed.username).toBe(
          user_2.user.username,
        );

        expect(user_1_followed.body.data[1].followed.username).toBe(
          user_3.user.username,
        );

        expect(user_1_followed.body.message).toBe(
          FollowMessages.FOLLOWED_FOUND,
        );
      });
    });
  });
});
