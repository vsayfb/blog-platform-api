import { Length } from 'class-validator';

export class PostTitleDto {
  @Length(15, 60)
  title: string;
}
