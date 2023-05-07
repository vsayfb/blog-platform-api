import { SelectedAccountFields } from 'src/resources/accounts/types/selected-account-fields';
import { SelectedCommentFields } from 'src/resources/comments/types/selected-comment-fields';
import { SelectedPostFields } from 'src/resources/posts/types/selected-post-fields';
import {
  NotificationActions,
  NotificationObject,
} from '../entities/account-notification.entity';

export type AccountNotificationType = {
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
