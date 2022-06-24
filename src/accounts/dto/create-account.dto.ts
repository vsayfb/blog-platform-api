import { IsEmail, MinLength } from 'class-validator';

export class CreateAccountDto {
  @MinLength(2)
  username: string;

  @IsEmail()
  email: string;

  @MinLength(2)
  displayName: string;

  @MinLength(7)
  password: string;

  @MinLength(6)
  verification_code: string;
}
