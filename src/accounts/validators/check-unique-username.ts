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
export class CheckUniqueUsername implements ValidatorConstraintInterface {
  constructor(
    private readonly accountsService: AccountsService,
    private readonly tempAccountsService: TemporaryAccountsService,
  ) {}

  async validate(username: string, args: ValidationArguments) {
    const account = await this.accountsService.getOneByUsername(username);

    const tempAccount = await this.tempAccountsService.getOneByUsername(
      username,
    );

    if (account || tempAccount) return false;

    return true;
  }

  defaultMessage(validationArguments?: ValidationArguments): string {
    return AccountMessages.USERNAME_TAKEN;
  }
}

export function UniqueUsername(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: CheckUniqueUsername,
    });
  };
}
