import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { mockRepository } from '../../../test/helpers/mockRepository';
import { Repository } from 'typeorm';
import { Follow } from '../entities/follow.entity';
import { FollowService } from '../follow.service';
import { AccountsService } from 'src/accounts/accounts.service';
import { jwtPayloadStub } from 'src/auth/stub/jwt-payload.stub';
import { accountStub } from 'src/accounts/test/stub/account.stub';
import { AccountMessages } from 'src/accounts/enums/account-messages';
import { FollowMessages } from '../enums/follow-messages';
import { followStub } from '../stub/follow-stub';
import { randomUUID } from 'crypto';
import { Account } from 'src/accounts/entities/account.entity';

jest.mock('src/accounts/accounts.service');

describe('FollowService', () => {
  let followService: FollowService;
  let accountsService: AccountsService;
  let followRepository: Repository<Follow>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FollowService,
        AccountsService,
        {
          provide: getRepositoryToken(Follow),
          useClass: Repository,
        },
      ],
    }).compile();

    followService = module.get<FollowService>(FollowService);
    accountsService = module.get<AccountsService>(AccountsService);
    followRepository = module.get<Repository<Follow>>(
      getRepositoryToken(Follow),
    );

    mockRepository(followRepository, Follow);
  });

  describe('followAccount', () => {
    describe('when followAccount is called', () => {
      const followerID = jwtPayloadStub.sub;
      const followedUsername = accountStub().username;

      describe('scenario : account not found with given followedUsername', () => {
        test('should throw Accont not found error', async () => {
          jest.spyOn(accountsService, 'getAccount').mockResolvedValueOnce(null);

          await expect(
            followService.followAccount(followerID, followedUsername),
          ).rejects.toThrow(AccountMessages.NOT_FOUND);
        });
      });

      describe('scenario : followedUsername and followerUsername is same', () => {
        test('should throw You cannot follow yourself error', async () => {
          await expect(
            followService.followAccount(followerID, followerID),
          ).rejects.toThrow(FollowMessages.CANNOT_FOLLOW_YOURSELF);
        });
      });

      describe('scenario : all conditions are met', () => {
        let result: string;

        beforeEach(async () => {
          // return random id so that the function does not throw an error(CANNOT_FOLLOW_YOURSELF)
          jest
            .spyOn(accountsService, 'getAccount')
            .mockResolvedValue({ ...accountStub(), id: randomUUID() });

          result = await followService.followAccount(
            followerID,
            followedUsername,
          );
        });

        test('calls followRepository.save', () => {
          expect(followRepository.save).toHaveBeenCalledWith({
            followed: { ...accountStub(), id: expect.any(String) },
            follower: { id: followerID },
          });
        });

        test('should return followed username', async () => {
          expect(result).toEqual(followedUsername);
        });
      });
    });
  });

  describe('unfollowAccount', () => {
    describe('when unfollowAccount is called', () => {
      const followerUsername = jwtPayloadStub.username;
      const unfollowedUsername = accountStub().username;

      describe("scenario : a follow entity doesn't found with given parameters", () => {
        test('should throw Account not found', async () => {
          jest.spyOn(followRepository, 'findOne').mockResolvedValueOnce(null);

          await expect(
            followService.unfollowAccount(followerUsername, unfollowedUsername),
          ).rejects.toThrow(AccountMessages.NOT_FOUND);
        });
      });

      describe('scenario : a follow entity found with given parameters', () => {
        let result: string;

        beforeEach(async () => {
          result = await followService.unfollowAccount(
            followerUsername,
            unfollowedUsername,
          );
        });

        test('calls followRepository.remove', () => {
          expect(followRepository.remove).toHaveBeenCalledWith(followStub());
        });

        it('should return unfollowedUsername', () => {
          expect(result).toBe(unfollowedUsername);
        });
      });
    });
  });

  describe('getUserFollowers', () => {
    describe('when getUserFollowers is called', () => {
      let result: { createdAt: Date; id: string; follower: Account }[];

      const username = accountStub().username;

      beforeEach(async () => {
        result = await followService.getUserFollowers(username);
      });

      test('calls followRepository.find', () => {
        expect(followRepository.find).toHaveBeenCalledWith({
          where: {
            followed: { username },
          },
          relations: { follower: true },
        });
      });

      it("should return an array of user's followers", () => {
        expect(result[0].follower).toEqual({
          ...accountStub(),
          username: 'follower',
        });
      });
    });
  });

  describe('getUserFollowed', () => {
    describe('when getUserFollowed is called', () => {
      let result: { createdAt: Date; id: string; followed: Account }[];

      const username = accountStub().username;

      beforeEach(async () => {
        result = await followService.getUserFollowed(username);
      });

      test('calls followRepository.find', () => {
        expect(followRepository.find).toHaveBeenCalledWith({
          where: {
            follower: { username },
          },
          relations: { followed: true },
        });
      });

      it("should return an array of user's followed", () => {
        expect(result[0].followed).toEqual(accountStub());
      });
    });
  });
});
