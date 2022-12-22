import { Module } from '@nestjs/common';
import { MANAGE_DATA_SERVICE } from 'src/lib/constants';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TwoFactorAuth } from './entities/two-factor-auth.entity';
import { AccountsModule } from 'src/accounts/accounts.module';
import { TwoFactorAuthController } from './controllers/two-factor-auth.controller';
import { TwoFactorAuthService } from './services/two-factor-auth.service';
import { CodesModule } from 'src/codes/codes.module';
import { NotificationsModule } from 'src/notifications/notifications.module';
import { TwoFactorAuthManager } from './services/two-factor-auth-manager.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([TwoFactorAuth]),
    NotificationsModule,
    AccountsModule,
    CodesModule,
  ],
  controllers: [TwoFactorAuthController],
  providers: [
    TwoFactorAuthService,
    TwoFactorAuthManager,
    { provide: MANAGE_DATA_SERVICE, useClass: TwoFactorAuthService },
  ],
})
export class SecurityModule {}
