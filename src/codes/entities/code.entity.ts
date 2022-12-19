import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

export enum CodeVerificationProcess {
  REGISTER_EMAIL = 'register_email_verification',
  REGISTER_MOBIL_PHONE = 'register_phone_verification',
  TFA_EMAIL = 'tfa_email_verification',
  TFA_SMS = 'tfa_phone_verification',
}

@Entity()
export class Code {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  code: string;

  @Column({ unique: true })
  receiver: string;

  @Column({ type: 'enum', enum: CodeVerificationProcess })
  process: CodeVerificationProcess;

  @CreateDateColumn()
  created_at: Date;
}
