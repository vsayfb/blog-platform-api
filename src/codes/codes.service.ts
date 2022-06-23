import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Code } from './entities/code.entity';

@Injectable()
export class CodesService {
  constructor(@InjectRepository(Code) private repository: Repository<Code>) {}

  private generateCode() {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  async removeCode(codeID: string) {
    return this.repository.delete(codeID);
  }

  async getCode(code: string) {
    return this.repository.findOne({ where: { code } });
  }

  async createCode(receiver: string) {
    return this.repository.save({ code: this.generateCode(), receiver });
  }
}
