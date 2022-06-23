import { IsEmail, IsString } from 'class-validator';

export class BeginVerificationDto {
  @IsEmail()
  email: string;

  @IsString()
  username: string;
}
