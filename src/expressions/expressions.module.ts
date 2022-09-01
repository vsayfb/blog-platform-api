import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Expression } from './entities/expression.entity';
import { ExpressionsService } from './services/expressions.service';
import { ExpressionsController } from './controllers/expressions.controller';
import { PostExpressionsController } from './controllers/post-expressions.controller';
import { PostExpressionsService } from './services/post-expressions.service';

@Module({
  imports: [TypeOrmModule.forFeature([Expression])],
  controllers: [ExpressionsController, PostExpressionsController],
  providers: [
    ExpressionsService,
    PostExpressionsService,
    { provide: 'SERVICE', useClass: ExpressionsService },
  ],
})
export class ExpressionsModule {}
