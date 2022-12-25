import { MinLength } from 'class-validator';

export class CreateCommentDto {
  @MinLength(2)
  content: string;
}
