import { MinLength } from 'class-validator';

export class CreatePostDto {
  @MinLength(15)
  title: string;

  @MinLength(15)
  content: string;
}
