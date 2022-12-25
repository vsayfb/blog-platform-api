import { IsEmail } from 'class-validator';
import { IsNotBlank } from 'src/lib/validators/is-not-blank';

export class EmailDto {
  @IsEmail()
  @IsNotBlank()
  email: string;
}
