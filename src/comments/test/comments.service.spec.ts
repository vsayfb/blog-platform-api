import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CommentsService } from '../comments.service';
import { Comment } from '../entities/comment.entity';

describe('CommentsService', () => {
  let commentsService: CommentsService;
  let commentsRepository: Repository<Comment>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CommentsService,
        {
          provide: getRepositoryToken(Comment),
          useClass: Repository,
        },
      ],
    }).compile();

    commentsService = module.get<CommentsService>(CommentsService);
    commentsRepository = module.get<Repository<Comment>>(
      getRepositoryToken(Comment),
    );
  });

  it('should be defined', () => {
    expect(commentsService).toBeDefined();
  });
});
