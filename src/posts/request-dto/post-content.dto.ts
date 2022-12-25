import { MinLength } from 'class-validator';

export class PostContentDto {
  @MinLength(15)
  content: string;
}
