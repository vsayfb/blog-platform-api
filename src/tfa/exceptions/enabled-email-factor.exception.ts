import { HttpException, HttpStatus } from '@nestjs/common';
import { AccountWithCredentials } from 'src/accounts/types/account-with-credentials';

export class EnabledEmailFactorException extends HttpException {
  constructor(account: AccountWithCredentials) {
    super(account, HttpStatus.FORBIDDEN);
  }
}
