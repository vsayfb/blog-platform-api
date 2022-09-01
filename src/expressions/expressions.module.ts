import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Expression } from './entities/expression.entity';
import { ExpressionsService } from './services/expressions.service';
import { ExpressionsController } from './controllers/expressions.controller';
import { PostExpressionsController } from './controllers/post-expressions.controller';
import { PostExpressionsService } from './services/post-expressions.service';
import { CommentExpressionsService } from './services/comment-expressions.service';
import { CommentExpressionsController } from './controllers/comment-epxressions.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Expression])],
  controllers: [
    ExpressionsController,
    PostExpressionsController,
    CommentExpressionsController,
  ],
  providers: [
    ExpressionsService,
    PostExpressionsService,
    CommentExpressionsService,
    { provide: 'SERVICE', useClass: ExpressionsService },
  ],
})
export class ExpressionsModule {}
