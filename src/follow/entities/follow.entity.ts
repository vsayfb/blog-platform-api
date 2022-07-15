import { Account } from 'src/accounts/entities/account.entity';
import {
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
export class Follow {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Account, { cascade: true })
  follower: Account;

  @ManyToOne(() => Account, { cascade: true })
  followed: Account;

  @CreateDateColumn()
  createdAt: Date;
}
