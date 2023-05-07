import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { AccountsService } from 'src/resources/accounts/services/accounts.service';
import { AccountMessages } from 'src/resources/accounts/enums/account-messages';
import { IDeleteService } from 'src/lib/interfaces/delete-service.interface';
import { Repository } from 'typeorm';
import { Follow } from './entities/follow.entity';
import { FollowMessages } from './enums/follow-messages';
import { NotificationsService } from 'src/resources/account_notifications/services/notifications.service';
import { NotificationActions } from 'src/resources/account_notifications/entities/account-notification.entity';
import { IUpdateService } from 'src/lib/interfaces/update-service.interface';
import { UserFollowers } from './types/user-followers';
import { UserFollowed } from './types/user-followed';

@Injectable()
export class FollowService implements IDeleteService, IUpdateService {
  constructor(
    @InjectRepository(Follow)
    private readonly followRepository: Repository<Follow>,
    private readonly accountsService: AccountsService,
    private readonly notificationService: NotificationsService,
  ) {}

  async delete(subject: Follow): Promise<string> {
    const ID = subject.id;

    await this.followRepository.remove(subject);

    return ID;
  }

  async update(subject: Follow, updateDto: any): Promise<void> {
    await this.followRepository.save({ ...subject, ...updateDto });
  }

  async getFollow(followerID: string, followedID: string): Promise<Follow> {
    return await this.followRepository.findOne({
      where: { followed: { id: followedID }, follower: { id: followerID } },
      relations: { followed: true, follower: true },
    });
  }

  async followAccount(
    followerID: string,
    followedUsername: string,
  ): Promise<Follow> {
    const followed = await this.accountsService.getOneByUsername(
      followedUsername,
    );

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

    this.notificationService.deleteNotificationByIds(
      follow.follower.id,
      follow.followed.id,
      NotificationActions.FOLLOWED,
    );

    await this.delete(follow);

    return unfollowedUsername;
  }

  async getUserFollowers(username: string): Promise<UserFollowers> {
    const data = await this.followRepository.find({
      where: {
        followed: { username },
      },
      relations: { follower: true },
    });

    return data as unknown as UserFollowers;
  }

  async getUserFollowed(username: string): Promise<UserFollowed> {
    const data = await this.followRepository.find({
      where: {
        follower: { username },
      },
      relations: { followed: true },
    });

    return data as unknown as UserFollowed;
  }
}
