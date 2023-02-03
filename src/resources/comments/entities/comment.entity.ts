import { Account } from 'src/resources/accounts/entities/account.entity';
import { Post } from 'src/resources/posts/entities/post.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  Tree,
  TreeChildren,
  TreeParent,
  UpdateDateColumn,
} from 'typeorm';
import { CommentExpression } from './comment-expression.entity';

@Entity()
@Tree('closure-table')
export class Comment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Account, (account) => account.comments, {
    onDelete: 'CASCADE',
  })
  author: Account;

  @TreeChildren()
  replies: Comment[];

  @TreeParent({ onDelete: 'CASCADE' })
  parent: Comment;

  @ManyToOne(() => Post, (post) => post.comments, {
    onDelete: 'CASCADE',
  })
  post: Post;

  @OneToMany(() => CommentExpression, (expression) => expression.comment)
  expressions: CommentExpression;

  @Column()
  content: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
