import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
  OnModuleInit,
} from '@nestjs/common';
import { ModuleRef } from '@nestjs/core';
import { Request } from 'express';
import { map, Observable } from 'rxjs';
import { Subscriptions } from 'src/resources/follow/entities/follow.entity';
import { FollowService } from 'src/resources/follow/follow.service';
import { JwtPayload } from 'src/lib/jwt.payload';
import { ProfileDto } from 'src/resources/profiles/response-dto/profile.dto';
import { AccountMessages } from '../enums/account-messages';

@Injectable()
export class CheckClientIsFollowing implements NestInterceptor, OnModuleInit {
  private followService: FollowService;

  constructor(private readonly moduleRef: ModuleRef) {}

  async onModuleInit() {
    // use global scope to prevent circulary dependency between follow -> account modules
    this.followService = this.moduleRef.get(FollowService, { strict: false });
  }

  async intercept(
    context: ExecutionContext,
    next: CallHandler<any>,
  ): Promise<
    Observable<
      Promise<{
        data: ProfileDto & {
          following_by: boolean;
          subscriptions_by: Subscriptions;
        };
        message: AccountMessages;
      }>
    >
  > {
    const request: Request & { user: JwtPayload | null } = context
      .switchToHttp()
      .getRequest();

    const client = request.user;

    return next.handle().pipe(
      map(async (profile: { data: ProfileDto }) => {
        //

        let clientFollowsProfile = false;

        const subscriptions: Subscriptions = {
          mails_turned_on: false,
          notifications_turned_on: false,
        };

        if (client) {
          const follow = await this.followService.getFollow(
            client.sub,
            profile.data.id,
          );

          if (follow) {
            clientFollowsProfile = true;

            subscriptions.mails_turned_on =
              follow.subscriptions.mails_turned_on;

            subscriptions.notifications_turned_on =
              follow.subscriptions.notifications_turned_on;
          }
        }

        return {
          data: {
            ...profile.data,
            following_by: clientFollowsProfile,
            subscriptions_by: subscriptions,
          },
          message: AccountMessages.FOUND,
        };
      }),
    );
  }
}
