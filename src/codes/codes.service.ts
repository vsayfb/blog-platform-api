import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ICreateService } from 'src/lib/interfaces/create-service.interface';
import { IDeleteService } from 'src/lib/interfaces/delete-service.interface';
import { Repository } from 'typeorm';
import { Code, CodeVerificationProcess } from './entities/code.entity';

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
    process: CodeVerificationProcess;
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
    process: CodeVerificationProcess,
  ): Promise<Code | null> {
    return this.codesRepository.findOne({ where: { code, receiver, process } });
  }

  async getOneByReceiverAndType(
    receiver: string,
    process: CodeVerificationProcess,
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

  async deleteIfExists(codeID: string) {
    const code = await this.codesRepository.findOneBy({ id: codeID });

    if (code) await this.codesRepository.remove(code);
  }
}
