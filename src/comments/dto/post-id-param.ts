import { IsUUID } from 'class-validator';
import { PostExists } from 'src/posts/validators/check-post-exists';

export class PostIDParam {
  @IsUUID()
  @PostExists()
  post_id: string;
}
