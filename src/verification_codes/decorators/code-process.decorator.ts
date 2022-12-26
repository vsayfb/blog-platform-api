import { SetMetadata } from '@nestjs/common';
import { CodeProcess } from '../entities/code.entity';

export const VerificationCodeProcess = (process: CodeProcess) =>
  SetMetadata('process', process);
