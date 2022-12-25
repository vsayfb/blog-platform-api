import { Injectable } from '@nestjs/common';
import {
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { AccountsService } from '../services/accounts.service';

@Injectable()
@ValidatorConstraint({ async: true })
export class CheckUniquePhone implements ValidatorConstraintInterface {
  constructor(private readonly accountsService: AccountsService) {}

  async validate(mobile_phone: string, args: ValidationArguments) {
    const account = await this.accountsService.getOneByMobilePhone(mobile_phone);

    return !account;
  }

  defaultMessage(validationArguments?: ValidationArguments): string {
    return 'The phone number has been taken.';
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
