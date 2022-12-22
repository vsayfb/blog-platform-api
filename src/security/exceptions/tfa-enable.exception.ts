import { HttpException, HttpStatus } from '@nestjs/common';
import { TFAAccount } from 'src/accounts/types/tfa-account';

export class TFAEnabledException extends HttpException {
  constructor(account: TFAAccount) {
    super(account, HttpStatus.OK);
  }
}
