import {
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';

@ValidatorConstraint({ async: false })
class IsNotBlankConstraint implements ValidatorConstraintInterface {
  validate(value: any) {
    if (typeof value !== 'string') return true;

    return value.trim().length > 0;
  }

  defaultMessage(args: ValidationArguments) {
    return `The ${args.property} must not be blank.`;
  }
}

export function IsNotBlank(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: IsNotBlankConstraint,
    });
  };
}
