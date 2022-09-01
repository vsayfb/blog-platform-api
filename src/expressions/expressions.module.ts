import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Expression } from './entities/expression.entity';
import { ExpressionsService } from './services/expressions.service';
import { ExpressionsController } from './expressions.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Expression])],
  controllers: [ExpressionsController],
  providers: [
    ExpressionsService,
    { provide: 'SERVICE', useClass: ExpressionsService },
  ],
})
export class ExpressionsModule {}
