import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IFindService } from 'src/lib/interfaces/find-service.interface';
import { IUpdateService } from 'src/lib/interfaces/update-service.interface';
import { Repository } from 'typeorm';
import { UpdateSocialDto } from './dto/update-social.dto';
import { Social } from './entity/social.entity';

@Injectable()
export class SocialService implements IUpdateService, IFindService {
  constructor(
    @InjectRepository(Social)
    private readonly socialRepository: Repository<Social>,
  ) {}

  getOneByID(accountID: string): Promise<any> {
    return this.socialRepository.findOne({
      where: { account: { id: accountID } },
      relations: { account: true },
    });
  }

  getAll(): Promise<Social[]> {
    return this.socialRepository.find({});
  }

  async update(subject: Social, updateDto: UpdateSocialDto) {
    let anyChanges = false;

    for (const key in updateDto) {
      const element = updateDto[key];
      if (element) {
        subject[element] = updateDto[element];
        anyChanges = true;
      }
    }

    if (anyChanges) await this.socialRepository.save(subject);

    delete subject.account;

    return subject;
  }
}
