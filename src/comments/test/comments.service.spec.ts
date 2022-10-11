import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { jwtPayloadStub } from 'src/auth/stub/jwt-payload.stub';
import { postStub } from 'src/posts/stub/post-stub';
import { mockRepository } from '../../../test/helpers/utils/mockRepository';
import { Repository } from 'typeorm';
import { CommentsService } from '../comments.service';
import { CreateCommentDto } from '../dto/create-comment.dto';
import { Comment } from '../entities/comment.entity';
import { commentStub } from '../stub/comment.stub';
import { UpdateCommentDto } from '../dto/update-comment.dto';
import { SelectedCommentFields } from '../types/selected-comment-fields';
import { PostsService } from 'src/posts/posts.service';
import { CommentViewDto } from '../dto/comment-view.dto';
import { accountStub } from 'src/accounts/test/stub/account.stub';
import { ReplyViewDto } from '../dto/reply-view.dto';
import { RepliesViewDto } from '../dto/replies-view.dto';
import { AccountCommentsDto } from '../dto/account-comments.dto';
import { PostMessages } from 'src/posts/enums/post-messages';
import { CommentMessages } from '../enums/comment-messages';

jest.mock('src/posts/posts.service');

describe('CommentsService', () => {
  let commentsService: CommentsService;
  let postsService: PostsService;
  let commentsRepository: Repository<Comment>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CommentsService,
        PostsService,
        {
          provide: getRepositoryToken(Comment),
          useClass: Repository,
        },
      ],
    }).compile();

    commentsService = module.get<CommentsService>(CommentsService);
    postsService = module.get<PostsService>(PostsService);
    commentsRepository = module.get<Repository<Comment>>(
      getRepositoryToken(Comment),
    );

    mockRepository(commentsRepository, Comment);
  });

  describe('getPostComments', () => {
    describe('when getPostComments is called', () => {
      let result: CommentViewDto[];
      const postID = postStub().id;

      beforeEach(async () => {
        result = await commentsService.getPostComments(postID);
      });

      test('calls commentsRepository.createQueryBuilder', () => {
        expect(commentsRepository.createQueryBuilder).toHaveBeenCalled();
      });

      it('should return an array of comments of the found post', () => {
        expect(result).toEqual([commentStub()]);
      });
    });
  });

  describe('getCommentReplies', () => {
    describe('when getCommentReplies is called', () => {
      let result: RepliesViewDto;
      const commentID = commentStub().id;

      beforeEach(async () => {
        result = await commentsService.getCommentReplies(commentID);
      });

      test('calls commentsRepository.findOne', () => {
        expect(commentsRepository.findOne).toHaveBeenCalledWith({
          where: { id: commentID },
          relations: { replies: { author: true } },
        });
      });

      it('should return an array of replies of the found comment', () => {
        expect(result).toEqual(commentStub().replies);
      });
    });
  });

  describe('getAccountComments', () => {
    describe('when getAccountComments is called', () => {
      let result: AccountCommentsDto;
      const accountID = accountStub().id;

      beforeEach(async () => {
        result = await commentsService.getAccountComments(accountID);
      });

      test('calls commentsRepository.find', () => {
        expect(commentsRepository.find).toHaveBeenCalledWith({
          where: { author: { id: accountID } },
          relations: { post: true },
        });
      });

      it('should return an array of comments', () => {
        expect(result).toEqual([commentStub()]);
      });
    });
  });

  describe('getOneByID', () => {
    describe('when getOneByID is called', () => {
      let result: SelectedCommentFields;
      const comment = commentStub();

      beforeEach(async () => {
        result = await commentsService.getOneByID(comment.id);
      });

      test('calls commentsRepository.findOne', () => {
        expect(commentsRepository.findOne).toHaveBeenCalledWith({
          where: { id: comment.id },
          relations: { author: true, post: true },
        });
      });

      it('should return the comment', () => {
        expect(result).toEqual(commentStub());
      });
    });
  });

  describe('create', () => {
    describe('when create is called', () => {
      const account = jwtPayloadStub();
      const post = postStub();
      const createCommentDto: CreateCommentDto = {
        content: commentStub().content,
      };

      describe('scenario : if a post found', () => {
        let result: SelectedCommentFields;

        beforeEach(async () => {
          result = await commentsService.create({
            authorID: account.sub,
            postID: post.id,
            createCommentDto,
          });
        });

        test('calls commentsRepository.save', () => {
          expect(commentsRepository.save).toHaveBeenCalledWith({
            ...createCommentDto,
            author: { id: account.sub },
            post,
          });
        });

        it('should return the created comment', () => {
          expect(result.content).toEqual(createCommentDto.content);
        });
      });

      describe('scenario : if a post is not found', () => {
        test('should throw Post Not Found error', async () => {
          jest.spyOn(postsService, 'getOneByID').mockResolvedValueOnce(null);

          await expect(
            commentsService.create({
              authorID: account.sub,
              postID: post.id,
              createCommentDto,
            }),
          ).rejects.toThrow(PostMessages.NOT_FOUND);
        });
      });
    });
  });

  describe('replyToComment', () => {
    describe('when replyToComment is called', () => {
      const comment = commentStub();
      const author = accountStub();

      describe('scenario : if comment is found', () => {
        let result: ReplyViewDto;

        beforeEach(async () => {
          result = await commentsService.replyToComment({
            authorID: author.id,
            dto: comment,
            toID: comment.id,
          });
        });

        test('calls commentsRepository.save', () => {
          expect(commentsRepository.save).toHaveBeenCalled();
        });

        test('calls commentsRepository.findOne', () => {
          expect(commentsRepository.findOne).toHaveBeenCalledWith({
            where: { id: comment.id },
            relations: { parent: true, author: true },
          });
        });

        it('should return the created reply', () => {
          expect(result).toEqual(commentStub());
        });
      });

      describe('scenario : if a comment is not found', () => {
        it('should throw Comment Not Found error', async () => {
          jest.spyOn(commentsRepository, 'findOne').mockResolvedValueOnce(null);

          await expect(
            commentsService.replyToComment({
              toID: comment.id,
              authorID: author.id,
              dto: comment,
            }),
          ).rejects.toThrow(CommentMessages.NOT_FOUND);
        });
      });
    });
  });

  describe('delete', () => {
    describe('when delete is called', () => {
      let result: string;

      const comment = commentStub() as Comment;

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
      let result: SelectedCommentFields;

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
