import { Length } from 'class-validator';
import { IsNotBlank } from 'src/lib/validators/is-not-blank';

export class VerificationCodeDto {
  @Length(6, 6)
  @IsNotBlank()
  verification_code: string;
}
