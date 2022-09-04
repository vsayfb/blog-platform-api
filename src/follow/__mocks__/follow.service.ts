import { accountStub } from 'src/accounts/test/stub/account.stub';
import { followStub } from '../stub/follow-stub';

export const FollowService = jest.fn().mockReturnValue({
  followAccount: jest.fn((_followerID: string, followedUsername: string) =>
    Promise.resolve(followedUsername),
  ),
  unfollowAccount: jest.fn((_followerID: string, followedUsername: string) =>
    Promise.resolve(followedUsername),
  ),
  getUserFollowers: jest
    .fn()
    .mockResolvedValue([
      { follower: accountStub(), createdAt: new Date(), id: followStub().id },
    ]),
  getUserFollowed: jest
    .fn()
    .mockResolvedValue([
      { followed: accountStub(), createdAt: new Date(), id: followStub().id },
    ]),
});
