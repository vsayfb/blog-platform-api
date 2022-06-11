import { IsString, MinLength } from 'class-validator';

export class UsernameQuery {
  @IsString()
  @MinLength(3)
  username: string;
}
