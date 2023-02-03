import { SelectedAccountFields } from 'src/resources/accounts/types/selected-account-fields';
import { PostDto } from 'src/resources/posts/response-dto/post.dto';

export type NewComment = {
  id: string;
  content: string;
  author: SelectedAccountFields;
  post: PostDto;
  created_at: Date;
  updated_at: Date;
};
