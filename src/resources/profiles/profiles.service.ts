import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Account } from 'src/resources/accounts/entities/account.entity';
import { IFindService } from 'src/lib/interfaces/find-service.interface';
import { IUpdateService } from 'src/lib/interfaces/update-service.interface';
import { Repository } from 'typeorm';
import { ProfileMessages } from './enums/profile-messages';
import { SelectedAccountFields } from 'src/resources/accounts/types/selected-account-fields';
import { ProfileType } from './types/profile';
import { CacheJsonService } from 'src/cache/services/cache-json.service';
import { CACHED_ROUTES } from 'src/cache/constants/cached-routes';

@Injectable()
export class ProfilesService implements IFindService, IUpdateService {
  constructor(
    @InjectRepository(Account)
    private readonly profilesRepository: Repository<Account>,
    private readonly cacheJsonService: CacheJsonService,
  ) {}

  async update(
    subject: Account,
    updateDto: { display_name?: string; image?: string },
  ): Promise<SelectedAccountFields> {
    let updatedFields: Record<string, string> = {};

    for (const key in updateDto) {
      const element = updateDto[key];

      if (element && element !== subject[key]) {
        subject[key] = element;
        updatedFields = { ...updatedFields, [key]: element };
      }
    }

    if (!Object.keys(updatedFields).length) throw new ForbiddenException();

    await this.profilesRepository.save(subject);

    this.cacheJsonService.updateFields({
      key: CACHED_ROUTES.CLIENT_ACCOUNT + subject.id,
      data: updatedFields,
    });

    return this.profilesRepository.findOneBy({ id: subject.id });
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
