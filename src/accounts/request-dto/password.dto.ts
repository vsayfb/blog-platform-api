import { Length } from 'class-validator';
import { IsNotBlank } from 'src/lib/validators/is-not-blank';

export class PasswordDto {
  @Length(7, 16)
  @IsNotBlank()
  password: string;
}
