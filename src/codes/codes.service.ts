import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ICreateService } from 'src/lib/interfaces/create-service.interface';
import { IDeleteService } from 'src/lib/interfaces/delete-service.interface';
import { Repository } from 'typeorm';
import { Code, CodeProcess } from './entities/code.entity';

@Injectable()
export class CodesService implements ICreateService, IDeleteService {
  constructor(
    @InjectRepository(Code) private codesRepository: Repository<Code>,
  ) {}

  generate(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  async create({
    receiver,
    code,
    process,
  }: {
    receiver: string;
    code: string;
    process: CodeProcess;
  }): Promise<Code> {
    const { id } = await this.codesRepository.save({
      code,
      process,
      receiver,
    });

    return this.codesRepository.findOne({ where: { id } });
  }

  async getCodeByCredentials(
    code: string,
    receiver: string,
    process: CodeProcess,
  ): Promise<Code | null> {
    return this.codesRepository.findOne({ where: { code, receiver, process } });
  }

  async getOneByReceiverAndType(
    receiver: string,
    process: CodeProcess,
  ): Promise<Code | null> {
    return this.codesRepository.findOne({
      where: { receiver, process },
    });
  }

  async delete(code: Code): Promise<string> {
    const codeID = code.id;

    await this.codesRepository.remove(code);

    return codeID;
  }

  async deleteByCode(code: string): Promise<void> {
    const result = await this.codesRepository.findOneBy({ code });

    if (result) await this.delete(result);
  }

  async deleteIfExists(codeID: string): Promise<void> {
    const code = await this.codesRepository.findOneBy({ id: codeID });

    if (code) await this.codesRepository.remove(code);
  }
}
