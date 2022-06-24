import {
  ValidationArguments,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';

@ValidatorConstraint({ async: false })
export class MaxTwoUnderscores implements ValidatorConstraintInterface {
  validate(text: string) {
    if (!text) return false;

    const underscores = text.match(/[_]/gi);

    if (underscores && underscores.length > 2) {
      return false;
    }

    return true;
  }

  defaultMessage(args:ValidationArguments) {
    return `The ${args.property} must contain no more than two underscores.`;
  }
}
