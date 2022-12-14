import { Account } from 'src/accounts/entities/account.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity()
export class Social {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Account, (acc) => acc.social, { onDelete: 'CASCADE' })
  account: Account;

  @Column()
  twitter_url: string;

  @Column()
  github_url: string;

  @CreateDateColumn({ select: false })
  created_at: Date;

  @UpdateDateColumn({ select: false })
  updated_at: Date;
}
