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
export class CheckUniquePhone implements ValidatorConstraintInterface {
  constructor(
    private readonly accountsService: AccountsService,
    private readonly tempAccountsService: TemporaryAccountsService,
  ) {}

  async validate(mobile_phone: string, args: ValidationArguments) {
    const account = await this.accountsService.getOneByMobilePhone(
      mobile_phone,
    );

    const tempAccount = await this.tempAccountsService.getOneByMobilePhone(
      mobile_phone,
    );

    if (account || tempAccount) return false;

    return true;
  }

  defaultMessage(validationArguments?: ValidationArguments): string {
    return AccountMessages.MOBILE_PHONE_TAKEN;
  }
}

export function UniquePhone(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: CheckUniquePhone,
    });
  };
}
