import { Strategy } from 'passport-local';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthService } from '../services/local-auth.service';
import { AuthMessages } from '../enums/auth-messages';
import { SelectedAccountFields } from 'src/accounts/types/selected-account-fields';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private authService: AuthService) {
    super();
  }

  async validate(
    username: string,
    password: string,
  ): Promise<SelectedAccountFields> {
    const account = await this.authService.validateAccount(username, password);

    if (!account)
      throw new UnauthorizedException(AuthMessages.INVALID_CREDENTIALS);

    return account;
  }
}
