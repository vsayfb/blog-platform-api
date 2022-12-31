import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Account } from 'src/accounts/entities/account.entity';
import { IFindService } from 'src/lib/interfaces/find-service.interface';
import { IUpdateService } from 'src/lib/interfaces/update-service.interface';
import { Repository } from 'typeorm';
import { ProfileMessages } from './enums/profile-messages';
import { SelectedAccountFields } from 'src/accounts/types/selected-account-fields';
import { ProfileType } from './types/profile';

@Injectable()
export class ProfilesService implements IFindService, IUpdateService {
  constructor(
    @InjectRepository(Account)
    private readonly profilesRepository: Repository<Account>,
  ) {}

  async update(
    subject: Account,
    updateDto: { display_name?: string; image?: string },
  ): Promise<SelectedAccountFields> {
    let anyChanges = false;

    for (const key in updateDto) {
      const element = updateDto[key];

      if (element) {
        subject[key] = element;
        anyChanges = true;
      }
    }

    if (anyChanges) {
      const updated = await this.profilesRepository.save(subject);

      return this.profilesRepository.findOneBy({ id: updated.id });
    }
    return subject;
  }

  async getOneByAccountUsername(username: string): Promise<ProfileType> {
    const profile = await this.profilesRepository
      .createQueryBuilder('profile')
      .where('profile.username=:username', { username })
      .loadRelationCountAndMap('profile.followers_count', 'profile.followers')
      .loadRelationCountAndMap('profile.following_count', 'profile.followed')
      .getOne();

    if (!profile) throw new NotFoundException(ProfileMessages.NOT_FOUND);

    return profile as unknown as ProfileType;
  }

  async getOneByID(id: string): Promise<SelectedAccountFields> {
    return this.profilesRepository.findOne({
      where: { id },
    });
  }

  async getAll(): Promise<SelectedAccountFields[]> {
    return this.profilesRepository.find();
  }
}
