import { IsBoolean } from 'class-validator';

export class PostStatus {
  @IsBoolean()
  isPublic: boolean;
}
