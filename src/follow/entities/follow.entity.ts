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

  @ManyToOne(() => Account, { cascade: true, onDelete: 'CASCADE' })
  follower: Account;

  @ManyToOne(() => Account, { cascade: true, onDelete: 'CASCADE' })
  followed: Account;

  @CreateDateColumn()
  created_at: Date;
}
