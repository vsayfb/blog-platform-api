import { Length } from 'class-validator';
import { IsNotBlank } from 'src/lib/validators/IsNotBlank';

export class VerificationCodeDto {
  @IsNotBlank()
  @Length(6, 6)
  verification_code: string;
}
