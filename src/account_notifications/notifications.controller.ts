import { Controller, Get, Patch, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Client } from 'src/auth/decorator/client.decorator';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { NOTIFICATIONS_ROUTE } from 'src/lib/constants';
import { Data } from 'src/lib/decorators/request-data.decorator';
import { CanManageData } from 'src/lib/guards/CanManageData';
import { JwtPayload } from 'src/lib/jwt.payload';
import { Notification } from './entities/notification.entity';
import { NotificationMessages } from './enums/notification-messages';
import { NotificationRoutes } from './enums/notification-routes';
import { AccountNotifications } from './response-dto/account-notifications';
import { NotificationsService } from './services/notifications.service';

@ApiTags(NOTIFICATIONS_ROUTE)
@Controller(NOTIFICATIONS_ROUTE)
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @UseGuards(JwtAuthGuard)
  @Get(NotificationRoutes.CLIENT)
  async findClientNotifications(@Client() client: JwtPayload): Promise<{
    data: AccountNotifications;
    message: NotificationMessages;
  }> {
    return {
      data: await this.notificationsService.getAccountNotifications(client.sub),
      message: NotificationMessages.ALL_FOUND,
    };
  }

  @UseGuards(JwtAuthGuard)
  @Get(NotificationRoutes.COUNT)
  async findClientNotificationCount(
    @Client() client: JwtPayload,
  ): Promise<{ data: { count: number }; message: NotificationMessages }> {
    return {
      data: {
        count: await this.notificationsService.getAccountNotificationCount(
          client.sub,
        ),
      },
      message: NotificationMessages.COUNT_FOUND,
    };
  }

  @UseGuards(JwtAuthGuard, CanManageData)
  @Patch(NotificationRoutes.SEEN + ':id')
  async makeVisibilitySeen(
    @Data() notification: Notification,
  ): Promise<{
    data: { id: string; seen: boolean };
    message: NotificationMessages;
  }> {
    const id = await this.notificationsService.update(notification);

    return {
      data: { id, seen: true },
      message: NotificationMessages.HIDDEN,
    };
  }
}
