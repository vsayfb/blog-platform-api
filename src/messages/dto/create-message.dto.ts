import { IsNotEmpty, MinLength } from 'class-validator';

export class CreateMessageDto {
  @IsNotEmpty()
  @MinLength(1)
  content: string;
}
