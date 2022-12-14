import {
  IsOptional,
  Validate,
  ValidationArguments,
  ValidatorConstraintInterface,
} from 'class-validator';

export class TwitterProfileURL implements ValidatorConstraintInterface {
  validate(
    value: string,
    validationArguments?: ValidationArguments,
  ): boolean | Promise<boolean> {
    return value?.startsWith('https://twitter.com/');
  }
  defaultMessage?(_validationArguments?: ValidationArguments): string {
    return 'Not a valid twitter profile url.';
  }
}

export class GithubProfileURL implements ValidatorConstraintInterface {
  validate(
    value: string,
    validationArguments?: ValidationArguments,
  ): boolean | Promise<boolean> {
    return value?.startsWith('https://github.com/');
  }
  defaultMessage?(_validationArguments?: ValidationArguments): string {
    return 'Not a valid github profile url.';
  }
}

export class UpdateSocialDto {
  @IsOptional()
  @Validate(TwitterProfileURL)
  twitter_url: string;

  @IsOptional()
  @Validate(GithubProfileURL)
  github_url: string;
}
