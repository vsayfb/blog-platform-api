import { Injectable } from '@nestjs/common';
import { GoogleAccountsService } from 'src/accounts/services/google-accounts.service';
import { SelectedAccountFields } from 'src/accounts/types/selected-account-fields';
import {
  GoogleService,
  GoogleUserCredentials,
} from 'src/apis/google/google.service';
import { RegisterDto } from '../response-dto/register.dto';
import { IAuthService } from '../interfaces/auth-service.interface';
import { BaseAuthService } from './base-auth.service';
import { EnabledMobilePhoneFactorException } from 'src/tfa/exceptions/enabled-mobile-phone-factor.exception';

@Injectable()
export class GoogleAuthService extends BaseAuthService implements IAuthService {
  constructor(
    private readonly googleService: GoogleService,
    private readonly googleAccountsService: GoogleAccountsService,
  ) {
    super();
  }

  async register(googleUser: GoogleUserCredentials): Promise<RegisterDto> {
    const { email, family_name, given_name } = googleUser;

    const registered = await this.googleAccountsService.create({
      email,
      familyName: family_name,
      givenName: given_name,
    });

    return this.login(registered);
  }

  async validateAccount(
    access_token: string,
  ): Promise<SelectedAccountFields | null> {
    const googleAccount = await this.googleService.getUserCredentials(
      access_token,
    );

    if (!googleAccount) return null;

    const account = await this.googleAccountsService.getCredentialsByEmail(
      googleAccount.email,
    );

    if (!account) return null;

    if (account.two_factor_auth)
      throw new EnabledMobilePhoneFactorException(account);

    delete account.mobile_phone;
    delete account.email;
    delete account.via;
    delete account.password;
    delete account.two_factor_auth;

    return account;
  }
}
