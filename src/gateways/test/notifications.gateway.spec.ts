import { Test, TestingModule } from '@nestjs/testing';
import { NotificationsGateway } from '../notifications.gateway';
import { NotificationsGatewayService } from '../services/notifications-gateway.service';

describe('GatewaysGateway', () => {
  let gateway: NotificationsGateway;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [NotificationsGateway, NotificationsGatewayService],
    }).compile();

    gateway = module.get<NotificationsGateway>(NotificationsGateway);
  });

  it('should be defined', () => {
    expect(gateway).toBeDefined();
  });
});
