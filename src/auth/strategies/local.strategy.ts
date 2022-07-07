import { Strategy } from 'passport-local';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthService } from '../auth.service';
import { AuthMessages } from '../enums/auth-messages';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private authService: AuthService) {
    super();
  }

  async validate(username: string, password: string): Promise<any> {
    const account = await this.authService.validateAccount(username, password);

    if (!account)
      throw new UnauthorizedException(AuthMessages.INVALID_CREDENTIALS);

    return account;
  }
}
