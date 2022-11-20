import { Allow, MaxLength, MinLength } from 'class-validator';

export class CreatePostDto {
  @MinLength(15)
  @MaxLength(34)
  title: string;

  @MinLength(15)
  content: string;

  // tagnamepipe will transform tags -> look tag-name.pipe.ts
  @Allow()
  tags: string[];
}
