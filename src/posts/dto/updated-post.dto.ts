import { Tag } from 'src/tags/entities/tag.entity';
import { SelectedPostFields } from '../types/selected-post-fields';

export type UpdatedPostDto = SelectedPostFields & {
  tags: Tag[];
};
