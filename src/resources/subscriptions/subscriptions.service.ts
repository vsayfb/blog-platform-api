import { ForbiddenException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  Follow,
  Subscriptions,
} from 'src/resources/follow/entities/follow.entity';
import { FollowMessages } from 'src/resources/follow/enums/follow-messages';
import { FollowService } from 'src/resources/follow/follow.service';
import { ICreateService } from 'src/lib/interfaces/create-service.interface';
import { IDeleteService } from 'src/lib/interfaces/delete-service.interface';
import { IFindService } from 'src/lib/interfaces/find-service.interface';
import { IUpdateService } from 'src/lib/interfaces/update-service.interface';
import { Repository } from 'typeorm';
import { SubscribeDto } from './dto/subcribe.dto';
import { OptionalSubscriptions } from './types/optional-subscriptions';

@Injectable()
export class SubscriptionsService
  implements IFindService, ICreateService, IDeleteService, IUpdateService
{
  constructor(
    @InjectRepository(Follow)
    private readonly followRepository: Repository<Follow>,
    private readonly followService: FollowService,
  ) {}

  async create({
    followedID,
    followerID,
    subscriptions,
  }: {
    followedID: string;
    followerID: string;
    subscriptions: OptionalSubscriptions;
  }): Promise<SubscribeDto> {
    const follow = await this.followService.getFollow(followerID, followedID);

    if (!follow) throw new ForbiddenException(FollowMessages.NOT_FOLLOWING);

    return await this.update(follow, subscriptions);
  }

  async getOneByID(followID: string): Promise<Subscriptions> {
    const data = await this.followRepository.findOneBy({ id: followID });

    return data.subscriptions;
  }

  async update(
    follow: Follow,
    subscriptions: OptionalSubscriptions,
  ): Promise<SubscribeDto> {
    for (const key in subscriptions) {
      const element = subscriptions[key];

      if (element === false || element === true) {
        follow.subscriptions[key] = element;
      }
    }

    await this.followService.update(follow, subscriptions);

    return { subscriptions: { ...follow.subscriptions, ...subscriptions } };
  }

  async delete({
    followedID,
    followerID,
    subscriptions,
  }: {
    followedID: string;
    followerID: string;
    subscriptions: OptionalSubscriptions;
  }): Promise<string> {
    const follow = await this.followService.getFollow(followerID, followedID);

    if (!follow) throw new ForbiddenException(FollowMessages.NOT_FOLLOWING);

    await this.update(follow, subscriptions);

    return follow.id;
  }

  async getSubscribers(
    followedAccountID: string,
  ): Promise<{ id: string; email: string }[]> {
    const followers = await this.followRepository.find({
      where: {
        followed: { id: followedAccountID },
      },
      relations: { follower: true },
      select: { follower: { email: true, id: true } },
    });

    const subscribers = followers.map((f) => ({
      id: f.follower.id,
      email: f.follower.email,
    }));

    return subscribers;
  }

  async getAll(): Promise<Subscriptions[]> {
    const data = await this.followRepository.find({});

    return data.map((d) => d.subscriptions);
  }
}
