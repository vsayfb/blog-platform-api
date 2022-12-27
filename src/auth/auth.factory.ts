import { Injectable } from '@nestjs/common';
import { RegisterType } from 'src/accounts/entities/account.entity';
import { IAuthService } from './interfaces/auth-service.interface';
import { GoogleAuthService } from './services/google-auth.service';
import { LocalAuthService } from './services/local-auth.service';

@Injectable()
export class AuthFactory {
  constructor(
    private readonly localAuthService: LocalAuthService,
    private readonly googleAuthService: GoogleAuthService,
  ) {}

  createAuth(via: RegisterType): IAuthService {
    switch (via) {
      case RegisterType.LOCAL:
        return this.localAuthService;
      case RegisterType.GOOGLE:
        return this.googleAuthService;
      default:
        throw new Error('Illegal argument');
    }
  }
}
