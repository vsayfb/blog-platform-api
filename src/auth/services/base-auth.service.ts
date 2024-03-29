import { Inject } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { PasswordManagerService } from 'src/resources/accounts/services/password-manager.service';
import { SelectedAccountFields } from 'src/resources/accounts/types/selected-account-fields';
import { ProcessEnv } from 'src/lib/enums/env';
import { JwtPayload } from 'src/lib/jwt.payload';

export abstract class BaseAuthService {
  @Inject(JwtService)
  protected readonly jwtService: JwtService;

  @Inject(ConfigService)
  protected readonly configService: ConfigService;

  @Inject(PasswordManagerService)
  protected readonly passwordManagerService: PasswordManagerService;

  login(account: SelectedAccountFields): {
    account: SelectedAccountFields;
    access_token: string;
  } {
    const payload: JwtPayload = {
      sub: account.id,
      username: account.username,
      display_name: account.display_name,
      image: account.image,
      role: account.role,
    };

    return {
      account,
      access_token: this.jwtService.sign(payload, {
        secret: this.configService.get<string>(ProcessEnv.JWT_SECRET),
      }),
    };
  }

  abstract validateAccount(...data: any): Promise<SelectedAccountFields> | null;
}
