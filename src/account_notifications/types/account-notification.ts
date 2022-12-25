import { SelectedAccountFields } from 'src/accounts/types/selected-account-fields';
import { SelectedCommentFields } from 'src/comments/types/selected-comment-fields';
import { SelectedPostFields } from 'src/posts/types/selected-post-fields';
import {
  NotificationActions,
  NotificationObject,
} from '../entities/notification.entity';

export type AccountNotification = {
  id: string;
  sender: SelectedAccountFields;
  post?: SelectedPostFields;
  comment?: SelectedCommentFields;
  reply?: SelectedCommentFields;
  action: NotificationActions;
  object: NotificationObject;
  seen: boolean;
  created_at: Date;
  updated_at: Date;
};
