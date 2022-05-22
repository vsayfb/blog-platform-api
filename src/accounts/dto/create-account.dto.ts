import { IsEmail, IsNotEmpty, MinLength } from 'class-validator';

export class CreateAccountDto {
  @MinLength(2)
  username: string;

  @IsEmail()
  email: string;

  @IsNotEmpty()
  password: string;
}
