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
import { Account } from 'src/resources/accounts/entities/account.entity';
import { Tag } from 'src/resources/tags/entities/tag.entity';
import { PostComment } from 'src/resources/comments/entities/post-comment.entity';
import { Bookmark } from 'src/resources/bookmarks/entities/bookmark.entity';
import { PostExpression } from './post-expression.entity';

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

  @OneToMany(() => PostComment, (comment) => comment.post)
  comments: PostComment[];

  @OneToMany(() => Bookmark, (bookmark) => bookmark.post)
  bookmarks: Bookmark;

  @OneToMany(() => PostExpression, (expression) => expression.post)
  expressions: PostExpression[];

  @ManyToMany(() => Tag, (tag) => tag.posts)
  @JoinTable()
  tags: Tag[];

  @Column({ unique: true })
  url: string;

  @Column()
  content: string;

  @Column({ default: true, select: false })
  published: boolean;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
