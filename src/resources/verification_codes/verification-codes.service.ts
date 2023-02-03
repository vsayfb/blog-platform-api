import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ICreateService } from 'src/lib/interfaces/create-service.interface';
import { IDeleteService } from 'src/lib/interfaces/delete-service.interface';
import { Repository } from 'typeorm';
import { CodeProcess, VerificationCode } from './entities/code.entity';
import { nanoid } from 'nanoid';

@Injectable()
export class VerificationCodesService
  implements ICreateService, IDeleteService
{
  constructor(
    @InjectRepository(VerificationCode)
    private verificationCodesRepository: Repository<VerificationCode>,
  ) {}

  private async generate(): Promise<string> {
    let unique = false;

    let code: string;

    do {
      code = Math.floor(100000 + Math.random() * 900000).toString();

      unique = (await this.verificationCodesRepository.findOneBy({ code }))
        ? false
        : true;
    } while (!unique);

    return code;
  }

  async create({
    receiver,
    process,
  }: {
    receiver: string;
    process: CodeProcess;
  }): Promise<VerificationCode> {
    const { id } = await this.verificationCodesRepository.save({
      code: await this.generate(),
      process,
      token: nanoid(72),
      receiver,
    });

    return this.verificationCodesRepository.findOne({ where: { id } });
  }

  async getCodeByCredentials(
    code: string,
    receiver: string,
    process: CodeProcess,
  ): Promise<VerificationCode | null> {
    return this.verificationCodesRepository.findOne({
      where: { code, receiver, process },
    });
  }

  async getOneByCodeAndToken(code: string, token: string) {
    return this.verificationCodesRepository.findOneBy({
      code,
      token,
    });
  }

  async getOneByReceiverAndProcess(
    receiver: string,
    process: CodeProcess,
  ): Promise<VerificationCode | null> {
    return this.verificationCodesRepository.findOne({
      where: { receiver, process },
    });
  }

  async delete(code: VerificationCode): Promise<string> {
    const codeID = code.id;

    await this.verificationCodesRepository.remove(code);

    return codeID;
  }

  async deleteByCode(code: string): Promise<void> {
    const result = await this.verificationCodesRepository.findOneBy({ code });

    if (result) await this.delete(result);
  }

  async deleteIfExists(codeID: string): Promise<void> {
    const code = await this.verificationCodesRepository.findOneBy({
      id: codeID,
    });

    if (code) await this.verificationCodesRepository.remove(code);
  }
}
