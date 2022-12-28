import { Injectable } from '@nestjs/common';
import {
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { AccountMessages } from '../enums/account-messages';
import { AccountsService } from '../services/accounts.service';
import { TemporaryAccountsService } from '../services/temporary-accounts.service';

@Injectable()
@ValidatorConstraint({ async: true })
export class CheckUniqueEmail implements ValidatorConstraintInterface {
  constructor(
    private readonly accountsService: AccountsService,
    private readonly tempAccountsService: TemporaryAccountsService,
  ) {}

  async validate(email: string, args: ValidationArguments) {
    const account = await this.accountsService.getOneByEmail(email);

    const tempAccount = await this.tempAccountsService.getOneByEmail(email);

    if (account || tempAccount) return false;

    return true;
  }

  defaultMessage(validationArguments?: ValidationArguments): string {
    return AccountMessages.EMAIL_TAKEN;
  }
}

export function UniqueEmail(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: CheckUniqueEmail,
    });
  };
}
