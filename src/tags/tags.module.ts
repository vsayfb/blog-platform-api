import { Module } from '@nestjs/common';
import { TagsService } from './tags.service';
import { TagsController } from './tags.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Tag } from './entities/tag.entity';
import { CASL_SUBJECT, MANAGE_DATA_SERVICE } from 'src/lib/constants';

@Module({
  imports: [TypeOrmModule.forFeature([Tag])],
  controllers: [TagsController],
  providers: [
    TagsService,
    { provide: MANAGE_DATA_SERVICE, useClass: TagsService },
    { provide: CASL_SUBJECT, useClass: Tag },
  ],
  exports: [TagsService],
})
export class TagsModule {}
