import { Controller, Get, Patch, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Account } from 'src/accounts/decorator/account.decorator';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { Data } from 'src/lib/decorators/request-data.decorator';
import { CanManageData } from 'src/lib/guards/CanManageData';
import { JwtPayload } from 'src/lib/jwt.payload';
import { Notification } from './entities/notification.entity';
import { NotificationMessages } from './enums/notification-messages';
import { NotificationRoutes } from './enums/notification-routes';
import { NotificationsService } from './services/notifications.service';

@ApiTags('notifications')
@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @UseGuards(JwtAuthGuard)
  @Get(NotificationRoutes.ME)
  async findMyNotifications(@Account() account: JwtPayload): Promise<{
    data: Notification[];
    message: NotificationMessages;
  }> {
    return {
      data: await this.notificationsService.getAccountNotifications(
        account.sub,
      ),
      message: NotificationMessages.ALL_FOUND,
    };
  }

  @UseGuards(JwtAuthGuard, CanManageData)
  @Patch(NotificationRoutes.SEEN + ':id')
  async changeNotificationStatus(@Data() notification: Notification) {
    return {
      id: await this.notificationsService.update(notification),
      message: NotificationMessages.HIDDEN,
    };
  }
}
