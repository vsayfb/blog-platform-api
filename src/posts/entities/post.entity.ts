import {
  Column,
  CreateDateColumn,
  Entity,
  JoinTable,
  ManyToMany,
  ManyToOne,
  OneToMany,
  OneToOne,
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

  @Column({ default: null })
  title_image: string | null;

  @ManyToOne(() => Account, (account) => account.posts, {
    onDelete: 'CASCADE',
  })
  author: Account;

  @OneToMany(() => Comment, (comment) => comment.post)
  comments: Comment;

  @OneToMany(() => Bookmark, (bookmark) => bookmark.post)
  bookmarks: Bookmark;

  @ManyToMany(() => Tag, (tag) => tag.posts)
  @JoinTable()
  tags: Tag[];

  @Column({ unique: true })
  url: string;

  @Column()
  content: string;

  @Column({ default: true })
  published?: boolean | undefined;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
