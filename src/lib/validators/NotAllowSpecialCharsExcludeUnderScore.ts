import {
  ValidationArguments,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';

@ValidatorConstraint({ async: false })
export class NotAllowSpecialCharsExcludeUnderScore
  implements ValidatorConstraintInterface
{
  validate(text: string) {
    if (!text) return false;

    return text.match(/[^A-Za-z0-9_]/g) === null ? true : false;
  }

  defaultMessage(args: ValidationArguments) {
    return `The ${args.property} must consist of [A-Z,0-9,_] only.`;
  }
}
