import { IsEmail } from 'class-validator';
import { IsNotBlank } from 'src/lib/validators/is-not-blank';
import { UniqueEmail } from '../validators/check-unique-email';

export class UniqueEmailDto {
  @UniqueEmail()
  @IsEmail()
  @IsNotBlank()
  email: string;
}
