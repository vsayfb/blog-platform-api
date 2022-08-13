import { IsNotEmpty, IsUUID, MinLength } from 'class-validator';

export class CreateChatDto {
  @IsUUID()
  toID: string;

  @IsNotEmpty()
  @MinLength(1)
  firstMessage: string;
}
