import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { jwtPayloadStub } from 'src/auth/stub/jwt-payload.stub';
import { JwtPayload } from 'src/lib/jwt.payload';
import { postStub } from 'src/posts/stub/post-stub';
import { mockRepository } from '../../../test/helpers/mockRepository';
import { Repository } from 'typeorm';
import { CommentsService } from '../comments.service';
import { CreateCommentDto } from '../dto/create-comment.dto';
import { Comment } from '../entities/comment.entity';
import { commentStub } from '../stub/comment.stub';
import { UpdateCommentDto } from '../dto/update-comment.dto';
import { CommentMessages } from '../enums/comment-messages';

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

    mockRepository(commentsRepository, Comment);
  });

  describe('findPostComments', () => {
    describe('when findPostComments is called', () => {
      let result: Comment[];
      const postID = postStub().id;

      beforeEach(async () => {
        result = await commentsService.getPostComments(postID);
      });

      test('calls commentsRepository.find', () => {
        expect(commentsRepository.find).toHaveBeenCalledWith({
          where: { post: { id: postID } },
        });
      });

      it('should return an array of comments of the found post', () => {
        expect(result).toEqual([commentStub()]);
      });
    });
  });

  describe('create', () => {
    describe('when create is called', () => {
      let result: Comment;
      const account: JwtPayload = jwtPayloadStub;
      const postID = postStub().id;
      const createCommentDto: CreateCommentDto = {
        content: commentStub().content,
      };

      beforeEach(async () => {
        result = await commentsService.create({
          authorID: account.sub,
          postID,
          createCommentDto,
        });
      });

      test('calls commentsRepository.save', () => {
        expect(commentsRepository.save).toHaveBeenCalledWith({
          ...createCommentDto,
          author: { id: account.sub },
          post: { id: postID },
        });
      });

      it('should return the created comment', () => {
        expect(result.content).toEqual(createCommentDto.content);
      });
    });
  });

  describe('delete', () => {
    describe('when delete is called', () => {
      let result: string;

      const comment = commentStub();

      beforeEach(async () => {
        result = await commentsService.delete(comment);
      });

      test('calls commentsRepository.remove', () => {
        expect(commentsRepository.remove).toHaveBeenCalledWith(comment);
      });

      it("should return the deleted comment's id", () => {
        expect(result).toEqual(comment.id);
      });
    });
  });

  describe('update', () => {
    describe('when update is called', () => {
      let result: Comment;

      const comment = commentStub() as unknown as Comment;
      const dto: UpdateCommentDto = {
        content: 'updated-comment',
      };

      beforeEach(async () => {
        result = await commentsService.update(comment, dto);
      });

      test('calls commentsRepository.save', () => {
        expect(commentsRepository.save).toHaveBeenCalledWith(comment);
      });

      it('should return the updated comment', () => {
        expect(result.content).toEqual(dto.content);
      });
    });
  });
});
