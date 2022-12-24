import { Length } from 'class-validator';

export class PasswordDto {
  @Length(7, 16)
  password: string;
}
