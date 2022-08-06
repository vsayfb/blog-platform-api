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

  @ManyToOne(() => Post, { eager: true, nullable: true, onDelete: 'CASCADE' })
  post?: Post;

  @ManyToOne(() => Comment, {
    eager: true,
    nullable: true,
    onDelete: 'CASCADE',
  })
  comment?: Comment;

  @Column({ type: 'enum', enum: NotificationActions })
  action: NotificationActions;

  @Column({ default: false })
  seen: boolean;

  @CreateDateColumn()
  createdAt: Date;
}
