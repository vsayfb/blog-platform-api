import { Module } from '@nestjs/common';
import { MANAGE_DATA_SERVICE } from 'src/lib/constants';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TwoFactorAuth } from './entities/two-factor-auth.entity';
import { AccountsModule } from 'src/accounts/accounts.module';
import { TwoFactorAuthController } from './controllers/two-factor-auth.controller';
import { TwoFactorAuthService } from './services/two-factor-auth.service';

@Module({
  imports: [TypeOrmModule.forFeature([TwoFactorAuth]), AccountsModule],
  controllers: [TwoFactorAuthController],
  providers: [
    TwoFactorAuthService,
    { provide: MANAGE_DATA_SERVICE, useClass: TwoFactorAuthService },
  ],
})
export class SecurityModule {}
