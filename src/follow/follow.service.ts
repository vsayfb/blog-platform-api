import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { AccountsService } from 'src/accounts/services/accounts.service';
import { AccountMessages } from 'src/accounts/enums/account-messages';
import { IDeleteService } from 'src/lib/interfaces/delete-service.interface';
import { Repository } from 'typeorm';
import { UserFollowed } from './dto/user-followed.dto';
import { UserFollowers } from './dto/user-followers.dto';
import { Follow } from './entities/follow.entity';
import { FollowMessages } from './enums/follow-messages';
import { NotificationsService } from 'src/global/notifications/services/notifications.service';

@Injectable()
export class FollowService implements IDeleteService {
  constructor(
    @InjectRepository(Follow)
    private readonly followRepository: Repository<Follow>,
    private readonly accountsService: AccountsService,
    private readonly notificationService: NotificationsService,
  ) {}

  private async getFollow(
    followerID: string,
    followedID: string,
  ): Promise<Follow> {
    return await this.followRepository.findOne({
      where: { followed: { id: followedID }, follower: { id: followerID } },
      relations: { followed: true, follower: true },
    });
  }

  async checkUserByFollowing(username: string, followingBy: string) {
    const result = await this.followRepository.findOne({
      where: { followed: { username }, follower: { username: followingBy } },
    });

    return result ? true : false;
  }

  async followAccount(
    followerID: string,
    followedUsername: string,
  ): Promise<Follow> {
    const followed = await this.accountsService.getAccount(followedUsername);

    if (!followed) throw new NotFoundException(AccountMessages.NOT_FOUND);

    const alreadyFollowed = await this.getFollow(followerID, followed.id);

    if (alreadyFollowed) {
      throw new ForbiddenException(FollowMessages.ALREADY_FOLLOWED);
    }

    if (followerID === followed.id) {
      throw new ForbiddenException(FollowMessages.CANNOT_FOLLOW_YOURSELF);
    }

    await this.followRepository.save({
      followed,
      follower: { id: followerID },
    });

    return await this.getFollow(followerID, followed.id);
  }

  async unfollowAccount(followerUsername: string, unfollowedUsername: string) {
    const follow = await this.followRepository.findOne({
      where: {
        followed: { username: unfollowedUsername },
        follower: { username: followerUsername },
      },
      relations: { followed: true, follower: true },
    });

    if (!follow) throw new NotFoundException(AccountMessages.NOT_FOUND);

    // cancel notification
    this.notificationService.deleteNotificationByIds(
      follow.follower.id,
      follow.followed.id,
    );

    await this.delete(follow);

    return unfollowedUsername;
  }

  async getUserFollowers(username: string): Promise<UserFollowers> {
    return (await this.followRepository.find({
      where: {
        followed: { username },
      },
      relations: { follower: true },
    })) as any;
  }

  async getUserFollowed(username: string): Promise<UserFollowed> {
    return (await this.followRepository.find({
      where: {
        follower: { username },
      },
      relations: { followed: true },
    })) as any;
  }

  async delete(subject: Follow): Promise<string> {
    const ID = subject.id;

    await this.followRepository.remove(subject);

    return ID;
  }
}
