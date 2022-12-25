import {
  ValidationArguments,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';

@ValidatorConstraint({ async: false })
export class MinTwoLetters implements ValidatorConstraintInterface {
  validate(text: string) {
    if (!text) return false;

    const letters = text.match(/[A-Za-z]/gi);

    if (!letters || letters.length < 2) {
      return false;
    }

    return true;
  }

  defaultMessage(args: ValidationArguments) {
    return `The ${args.property} must contain at least two letters.`;
  }
}
