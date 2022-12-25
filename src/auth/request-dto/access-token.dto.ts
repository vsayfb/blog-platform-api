import { IsString } from 'class-validator';
import { IsNotBlank } from 'src/lib/validators/is-not-blank';

export class AccessTokenDto {
  @IsString()
  @IsNotBlank()
  access_token: string;
}
