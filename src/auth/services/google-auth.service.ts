import { Injectable } from '@nestjs/common';
import { GoogleAccountsService } from 'src/accounts/services/google-accounts.service';
import { SelectedAccountFields } from 'src/accounts/types/selected-account-fields';
import { GoogleService } from 'src/apis/google/google.service';
import { RegisterDto } from '../response-dto/register.dto';
import { IAuthService } from '../interfaces/auth-service.interface';
import { BaseAuthService } from './base-auth.service';

@Injectable()
export class GoogleAuthService extends BaseAuthService implements IAuthService {
  constructor(
    private readonly googleService: GoogleService,
    private readonly googleAccountsService: GoogleAccountsService,
  ) {
    super();
  }

  async register(accessToken: string): Promise<RegisterDto> {
    const googleAccount = await this.googleService.getUserCredentials(
      accessToken,
    );

    const registered = await this.googleAccountsService.create(googleAccount);

    return this.login(registered);
  }

  async validateAccount(
    access_token: string,
  ): Promise<SelectedAccountFields | null> {
    const googleAccount = await this.googleService.getUserCredentials(
      access_token,
    );

    if (!googleAccount) return null;

    const account = await this.googleAccountsService.getOneByEmail(
      googleAccount.email,
    );

    if (!account) return null;

    delete account.email;

    delete account.password;

    return account;
  }
}
