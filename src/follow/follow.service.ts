import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { AccountsService } from 'src/accounts/accounts.service';
import { Account } from 'src/accounts/entities/account.entity';
import { AccountMessages } from 'src/accounts/enums/account-messages';
import { Repository } from 'typeorm';
import { Follow } from './entities/follow.entity';
import { FollowMessages } from './enums/follow-messages';

@Injectable()
export class FollowService {
  constructor(
    @InjectRepository(Follow)
    private readonly followRepository: Repository<Follow>,
    private readonly accountsService: AccountsService,
  ) {}

  async followAccount(followerID: string, followedUsername: string) {
    const followed = await this.accountsService.getAccount(followedUsername);

    if (!followed) throw new NotFoundException(AccountMessages.NOT_FOUND);

    if (followerID === followed.id) {
      throw new ForbiddenException(FollowMessages.CANNOT_FOLLOW_YOURSELF);
    }

    await this.followRepository.save({
      followed,
      follower: { id: followerID },
    });

    return followedUsername;
  }

  async unfollowAccount(followerUsername: string, unfollowedUsername: string) {
    const follow = await this.followRepository.findOne({
      where: {
        followed: { username: unfollowedUsername },
        follower: { username: followerUsername },
      },
    });

    if (!follow) throw new NotFoundException(AccountMessages.NOT_FOUND);

    await this.followRepository.remove(follow);

    return unfollowedUsername;
  }

  async getUserFollowers(
    username: string,
  ): Promise<{ createdAt: Date; id: string; follower: Account }[]> {
    return await this.followRepository.find({
      where: {
        followed: { username },
      },
      relations: { follower: true },
    });
  }

  async getUserFollowed(
    username: string,
  ): Promise<{ createdAt: Date; id: string; followed: Account }[]> {
    return await this.followRepository.find({
      where: {
        follower: { username },
      },
      relations: { followed: true },
    });
  }
}
