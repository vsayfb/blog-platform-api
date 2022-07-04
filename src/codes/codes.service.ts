import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Code } from './entities/code.entity';

@Injectable()
export class CodesService {
  constructor(
    @InjectRepository(Code) private codesRepository: Repository<Code>,
  ) {}

  private generateCode() {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  async createCode(receiver: string) {
    const code = this.generateCode();

    return this.codesRepository.save({ code, receiver });
  }

  async getCode(code: string) {
    return this.codesRepository.findOne({ where: { code } });
  }

  async removeCode(codeID: string) {
    const code = await this.codesRepository.findOne({ where: { id: codeID } });

    return this.codesRepository.remove(code);
  }
}
