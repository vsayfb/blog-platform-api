import { Controller, Delete, Param, Post, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Client } from 'src/auth/decorator/client.decorator';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { SUBSCRIPTIONS_ROUTE } from 'src/lib/constants';
import { JwtPayload } from 'src/lib/jwt.payload';
import { SubscriptionsMessages } from './enums/subscriptions-messages';
import { SubscriptionsRoutes } from './enums/subscriptions-routes';
import { SubscriptionsService } from './subscriptions.service';

@Controller(SUBSCRIPTIONS_ROUTE)
@ApiTags(SUBSCRIPTIONS_ROUTE)
@UseGuards(JwtAuthGuard)
export class SubscriptionsController {
  constructor(private readonly subscriptionsService: SubscriptionsService) {}

  @Post(SubscriptionsRoutes.SUBSCRIBE_EMAIL + '/:followed_id')
  async subscribeToMails(
    @Client() client: JwtPayload,
    @Param('followed_id') followedID: string,
  ) {
    return {
      data: await this.subscriptionsService.create({
        followedID,
        followerID: client.sub,
        subscriptions: { mails_turned_on: true },
      }),
      message: SubscriptionsMessages.SUBSCRIBED_TO_MAILS,
    };
  }

  @Delete(SubscriptionsRoutes.UNSUBSCRIBE_EMAIL + '/:followed_id')
  async unsubscribeToMails(
    @Client() client: JwtPayload,
    @Param('followed_id') followedID: string,
  ) {
    return {
      data: await this.subscriptionsService.delete({
        followedID,
        followerID: client.sub,
        subscriptions: { mails_turned_on: false },
      }),
      message: SubscriptionsMessages.UNSUBSCRIBED_TO_MAILS,
    };
  }

  @Post(SubscriptionsRoutes.SUBSCRIBE_NOTIFICATION + '/:followed_id')
  async subscribeToNotifications(
    @Client() client: JwtPayload,
    @Param('followed_id') followedID: string,
  ) {
    return {
      data: await this.subscriptionsService.create({
        followedID,
        followerID: client.sub,
        subscriptions: { notifications_turned_on: true },
      }),
      message: SubscriptionsMessages.SUBSCRIBED_TO_NOTIFICATIONS,
    };
  }

  @Delete(SubscriptionsRoutes.UNSUBSCRIBE_NOTIFICATION + '/:followed_id')
  async unsubscribeToNotifications(
    @Client() client: JwtPayload,
    @Param('followed_id') followedID: string,
  ) {
    return {
      data: await this.subscriptionsService.delete({
        followedID,
        followerID: client.sub,
        subscriptions: { notifications_turned_on: false },
      }),
      message: SubscriptionsMessages.UNSUBSCRIBED_TO_NOTIFICATIONS,
    };
  }
}
