import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Codes } from './codes.entity';

@Injectable()
export class CodesService {
  constructor(@InjectRepository(Codes) private repository: Repository<Codes>) {}

  private generateCode() {
    return Math.floor(Math.random() * 100000).toString();
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
