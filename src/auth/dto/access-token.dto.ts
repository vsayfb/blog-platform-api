import { IsString } from 'class-validator';

export class AccessToken {
  @IsString()
  access_token: string;
}
