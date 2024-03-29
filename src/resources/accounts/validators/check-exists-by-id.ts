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

@Injectable()
@ValidatorConstraint({ async: true })
export class CheckAccountExists implements ValidatorConstraintInterface {
  constructor(private readonly accountsService: AccountsService) {}

  async validate(id: string, args: ValidationArguments) {
    const account = await this.accountsService.getOneByID(id);

    return !!account;
  }

  defaultMessage(validationArguments?: ValidationArguments): string {
    return AccountMessages.NOT_FOUND;
  }
}

export function AccountExists(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: CheckAccountExists,
    });
  };
}
