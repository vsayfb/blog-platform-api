import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { mockRepository } from '../../../test/utils/mockRepository';
import { Repository } from 'typeorm';
import { Notification } from '../entities/notification.entity';
import { accountStub } from 'src/accounts/test/stub/account.stub';
import { randomUUID } from 'crypto';
import { NotificationActions } from '../enums/notification-actions';
import { CommentNotificationsService } from '../services/comments-notification.service';
import { postStub } from 'src/posts/stub/post-stub';
import { commentStub } from 'src/comments/stub/comment.stub';

describe('FollowNotificationsService', () => {
  let commentNotificationsService: CommentNotificationsService;
  let notificationsRepository: Repository<Notification>;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [
        CommentNotificationsService,
        { provide: getRepositoryToken(Notification), useClass: Repository },
      ],
    }).compile();

    commentNotificationsService = moduleRef.get<CommentNotificationsService>(
      CommentNotificationsService,
    );
    notificationsRepository = moduleRef.get<Repository<Notification>>(
      getRepositoryToken(Notification),
    );

    mockRepository(notificationsRepository, Notification);
  });

  describe('createCommentNotification', () => {
    describe('when createCommentNotification is called ', () => {
      let result: void;
      const dto = {
        senderID: accountStub().id,
        notifableID: randomUUID(),
        postID: postStub().id,
        commentID: commentStub().id,
      };

      beforeEach(async () => {
        result = await commentNotificationsService.createCommentNotification(
          dto,
        );
      });

      test('calls notificationsRepository.save', () => {
        expect(notificationsRepository.save).toHaveBeenCalledWith({
          sender: { id: dto.senderID },
          notifable: { id: dto.notifableID },
          comment: { id: dto.commentID },
          post: { id: dto.postID },
          action: NotificationActions.Commented,
        });
      });

      it('should return undefined so (void)', () => {
        expect(result).toBeUndefined();
      });
    });
  });
});
