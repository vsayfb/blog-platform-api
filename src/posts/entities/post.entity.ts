import {
  Column,
  CreateDateColumn,
  Entity,
  JoinTable,
  ManyToMany,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Account } from 'src/accounts/entities/account.entity';
import { Tag } from 'src/tags/entities/tag.entity';
import { Comment } from 'src/comments/entities/comment.entity';
import { Bookmark } from 'src/bookmarks/entities/bookmark.entity';
import { Expression } from 'src/expressions/entities/expression.entity';

@Entity()
export class Post {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column({ nullable: true })
  title_image: string;

  @ManyToOne(() => Account, (account) => account.posts, {
    onDelete: 'CASCADE',
  })
  author: Account;

  @OneToMany(() => Comment, (comment) => comment.post)
  comments: Comment;

  @OneToMany(() => Bookmark, (bookmark) => bookmark.post)
  bookmarks: Bookmark;

  @OneToMany(() => Expression, (expression) => expression.post)
  expressions: Expression[];

  @ManyToMany(() => Tag, (tag) => tag.posts)
  @JoinTable()
  tags: Tag[];

  @Column({ unique: true })
  url: string;

  @Column()
  content: string;

  @Column({ default: true })
  published: boolean;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
