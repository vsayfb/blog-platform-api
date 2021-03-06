import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Code } from './entities/code.entity';

@Injectable()
export class CodesService {
  constructor(
    @InjectRepository(Code) private codesRepository: Repository<Code>,
  ) {}

  private generateCode(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  async createCode(
    receiver: string,
  ): Promise<{ code: string; codeID: string }> {
    const code = this.generateCode();

    const { id } = await this.codesRepository.save({ code, receiver });

    return { code, codeID: id };
  }

  async getCode(code: string): Promise<Code> {
    return this.codesRepository.findOne({ where: { code } });
  }

  async removeCode(codeID: string): Promise<void> {
    const code = await this.codesRepository.findOne({ where: { id: codeID } });

    await this.codesRepository.remove(code);
  }
}
