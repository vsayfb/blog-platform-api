import { IsEmail, MinLength } from 'class-validator';

export class CreateAccountDto {
  @MinLength(2)
  username: string;

  @IsEmail()
  email: string;

  @MinLength(7)
  password: string;

  @MinLength(5)
  verification_code: string;
}
