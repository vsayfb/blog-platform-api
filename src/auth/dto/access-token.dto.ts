import { IsByteLength } from 'class-validator';

export class AccessToken {
  @IsByteLength(2048, 2048, { message: 'Token size must be 2048 bytes.' })
  access_token: string;
}
