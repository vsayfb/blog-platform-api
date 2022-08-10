import { MinLength } from 'class-validator';

export class CreateMessageDto {
  @MinLength(1)
  content: string;
}
