import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Account } from 'src/accounts/entities/account.entity';
import { IFindService } from 'src/lib/interfaces/find-service.interface';
import { IUpdateService } from 'src/lib/interfaces/update-service.interface';
import { UploadsService } from 'src/uploads/uploads.service';
import { Repository } from 'typeorm';
import { ProfileDto } from './dto/profile.dto';
import { ProfileMessages } from './enums/profile-messages';

@Injectable()
export class ProfilesService implements IFindService, IUpdateService {
  constructor(
    @InjectRepository(Account)
    private readonly profilesRepository: Repository<Account>,
  ) {}

  async update(
    subject: Account,
    updateDto: { display_name?: string; image?: string },
  ): Promise<any> {
    let anyChanges = false;

    for (const key in updateDto) {
      const element = updateDto[key];

      if (element) {
        subject[key] = element;
        anyChanges = true;
      }
    }

    if (anyChanges) await this.profilesRepository.save(subject);

    return subject;
  }

  async getOneByAccountUsername(username: string): Promise<ProfileDto> {
    const profile = await this.profilesRepository
      .createQueryBuilder('profile')
      .where('profile.username=:username', { username })
      .loadRelationCountAndMap('profile.followers_count', 'profile.followers')
      .loadRelationCountAndMap('profile.following_count', 'profile.followed')
      .getOne();

    if (!profile) throw new NotFoundException(ProfileMessages.NOT_FOUND);

    return profile as unknown as ProfileDto;
  }

  async getOneByID(id: string): Promise<any> {
    return this.profilesRepository.findOne({
      where: { id },
    });
  }

  async getAll(): Promise<any[]> {
    return this.profilesRepository.find();
  }
}
