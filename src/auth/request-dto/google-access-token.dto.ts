import { IsString } from 'class-validator';
import { IsNotBlank } from 'src/lib/validators/is-not-blank';

export class GoogleAccessTokenDto {
  @IsString()
  @IsNotBlank()
  google_access_token: string;
}
