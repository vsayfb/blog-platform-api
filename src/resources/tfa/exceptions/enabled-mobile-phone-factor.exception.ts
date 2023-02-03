import { HttpException, HttpStatus } from '@nestjs/common';
import { AccountWithCredentials } from 'src/resources/accounts/types/account-with-credentials';

export class EnabledMobilePhoneFactorException extends HttpException {
  constructor(account: AccountWithCredentials) {
    super(account, HttpStatus.FORBIDDEN);
  }
}
