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
export class CheckUniqueUsername implements ValidatorConstraintInterface {
  constructor(private readonly accountsService: AccountsService) {}

  async validate(username: string, args: ValidationArguments) {
    const account = await this.accountsService.getOneByEmail(username);

    return !account;
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
