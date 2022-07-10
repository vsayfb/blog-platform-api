import { Module } from '@nestjs/common';
import { CommentsService } from './comments.service';
import { CommentsController } from './comments.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Comment } from './entities/comment.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Comment])],
  controllers: [CommentsController],
  providers: [
    CommentsService,
    { provide: 'SERVICE', useClass: CommentsService },
  ],
})
export class CommentsModule {}
