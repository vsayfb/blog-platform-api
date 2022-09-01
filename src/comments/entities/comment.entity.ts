import { Account } from 'src/accounts/entities/account.entity';
import { Expression } from 'src/expressions/entities/expression.entity';
import { Post } from 'src/posts/entities/post.entity';
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

@Entity()
@Tree('closure-table')
export class Comment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Account, (account) => account.comments, {
    onDelete: 'CASCADE',
    nullable: false,
  })
  author: Account;

  @TreeChildren()
  replies: Comment[];

  @TreeParent()
  parent: Comment;

  @ManyToOne(() => Post, (post) => post.comments, {
    onDelete: 'CASCADE',
    nullable: false,
  })
  post: Post;

  @OneToMany(() => Expression, (expression) => expression.comment)
  expressions: Expression[];

  @Column()
  content: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
