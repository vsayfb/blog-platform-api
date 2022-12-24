import { IsString } from 'class-validator';
import { IsNotBlank } from 'src/lib/validators/IsNotBlank';

export class VerificationTokenDto {
  @IsNotBlank()
  @IsString()
  token: string;
}
