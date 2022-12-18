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
export class CheckUniqueEmail implements ValidatorConstraintInterface {
  constructor(private readonly accountsService: AccountsService) {}

  async validate(email: string, args: ValidationArguments) {
    const account = await this.accountsService.getOneByEmail(email);

    return !account;
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
