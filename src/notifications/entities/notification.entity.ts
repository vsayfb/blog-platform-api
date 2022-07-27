import { Account } from 'src/accounts/entities/account.entity';
import { Comment } from 'src/comments/entities/comment.entity';
import { Post } from 'src/posts/entities/post.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { NotificationActions } from '../enums/notification-actions';

@Entity()
export class Notification {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Account, { eager: true, onDelete: 'CASCADE' })
  sender: Account;

  @ManyToOne(() => Account, { eager: true, onDelete: 'CASCADE' })
  notifable: Account;

  @ManyToOne(() => Post, { nullable: true })
  post?: Post;

  @ManyToOne(() => Comment, { nullable: true })
  comment?: Comment;

  @Column({ type: 'enum', enum: NotificationActions })
  action: NotificationActions;

  @Column({ default: false })
  seen: boolean;

  @CreateDateColumn()
  createdAt: Date;
}
