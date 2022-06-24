import { Post } from 'src/posts/entities/post.entity';
import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  BaseEntity,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum RegisterType {
  LOCAL = 'local',
  GOOGLE = 'google',
}

@Entity()
export class Account extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  username: string;

  @Column({})
  displayName: string;

  @Column({ unique: true, select: false })
  email: string;

  @Column({ nullable: true, default: null })
  image: string | null;

  @Column({ select: false })
  password: string;

  @OneToMany((_type) => Post, (post) => post.author)
  posts: Post[];

  @Column({ type: 'enum', default: RegisterType.LOCAL, enum: RegisterType })
  via: RegisterType;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
