import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { mockRepository } from '../../../test/helpers/utils/mockRepository';
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
import { UserFollowers } from '../dto/user-followers.dto';
import { UserFollowed } from '../dto/user-followed.dto';

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
      const followerID = jwtPayloadStub().sub;
      const followedUsername = accountStub().username;

      describe('scenario : account not found with given followedUsername', () => {
        test('should throw Account not found error', async () => {
          jest.spyOn(accountsService, 'getAccount').mockResolvedValueOnce(null);

          await expect(
            followService.followAccount(followerID, followedUsername),
          ).rejects.toThrow(AccountMessages.NOT_FOUND);
        });
      });
      describe('scenario : user re-follows the user', () => {
        test('should throw Already followed error', async () => {
          //private method
          jest
            .spyOn(FollowService.prototype, 'getFollow' as any)
            .mockResolvedValueOnce(true);

          await expect(
            followService.followAccount(followerID, followedUsername),
          ).rejects.toThrow(FollowMessages.ALREADY_FOLLOWED);
        });
      });

      describe('scenario : followedUsername and followerUsername is same', () => {
        test('should throw You cannot follow yourself error', async () => {
          //private method
          jest
            .spyOn(FollowService.prototype, 'getFollow' as any)
            .mockResolvedValueOnce(false);

          //
          // return random id so that the function does not throw an error(CANNOT_FOLLOW_YOURSELF)
          jest
            .spyOn(accountsService, 'getAccount')
            .mockResolvedValueOnce(accountStub() as Account);

          await expect(
            followService.followAccount(followerID, followerID),
          ).rejects.toThrow(FollowMessages.CANNOT_FOLLOW_YOURSELF);
        });
      });

      describe('scenario : all conditions are met', () => {
        let result: Follow;

        beforeEach(async () => {
          //private method, return false so the function does not throw error (ALREADY_FOLLOWED)
          jest
            .spyOn(FollowService.prototype, 'getFollow' as any)
            .mockResolvedValueOnce(false);

          // return random id so that the function does not throw an error(CANNOT_FOLLOW_YOURSELF)
          jest.spyOn(accountsService, 'getAccount').mockResolvedValueOnce({
            ...accountStub(),
            id: randomUUID(),
          } as Account);

          result = await followService.followAccount(
            followerID,
            followedUsername,
          );
        });

        test('calls followRepository.save', () => {
          expect(followRepository.save).toHaveBeenCalledWith({
            followed: { ...accountStub(), id: expect.any(String) }, // id = randomUUID,
            follower: { id: followerID },
          });
        });

        test('should return follow entity', async () => {
          expect(result).toEqual(followStub());
        });
      });
    });
  });

  describe('unfollowAccount', () => {
    describe('when unfollowAccount is called', () => {
      const followerUsername = jwtPayloadStub().username;
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
          jest.spyOn(followService, 'delete');

          result = await followService.unfollowAccount(
            followerUsername,
            unfollowedUsername,
          );
        });

        test('calls followService.delete', () => {
          expect(followService.delete).toHaveBeenCalledWith(followStub());
        });

        it('should return unfollowedUsername', () => {
          expect(result).toBe(unfollowedUsername);
        });
      });
    });
  });

  describe('getUserFollowers', () => {
    describe('when getUserFollowers is called', () => {
      let result: UserFollowers;

      const username = accountStub().username;

      beforeEach(async () => {
        jest.spyOn(followRepository, 'find').mockResolvedValue([
          {
            ...followStub(),
            followed: accountStub(),
          },
        ] as any);

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
        expect(result).toEqual([{ ...followStub(), followed: accountStub() }]);
      });
    });
  });

  describe('getUserFollowed', () => {
    describe('when getUserFollowed is called', () => {
      let result: UserFollowed;

      const username = accountStub().username;

      beforeEach(async () => {
        jest.spyOn(followRepository, 'find').mockResolvedValue([
          {
            ...followStub(),
            follower: accountStub(),
          },
        ] as any);

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
        expect(result).toEqual([{ ...followStub(), follower: accountStub() }]);
      });
    });
  });
});
