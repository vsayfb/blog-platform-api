import { IsString } from 'class-validator';
import { IsNotBlank } from 'src/lib/validators/is-not-blank';

export class VerificationTokenDto {
  @IsNotBlank()
  @IsString()
  token: string;
}
