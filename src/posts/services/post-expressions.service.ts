import {
  BadRequestException,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ExpressionMessages } from 'src/expressions/enums/expression-messages';
import { NotificationActions } from 'src/account_notifications/entities/notification.entity';
import { PostsNotificationService } from 'src/account_notifications/services/posts.notification.service';
import { ICreateService } from 'src/lib/interfaces/create-service.interface';
import { Repository } from 'typeorm';
import {
  PostExpression,
  PostExpressionType,
} from '../entities/post-expression.entity';
import { PostsService } from './posts.service';
import { PostMessages } from '../enums/post-messages';

@Injectable()
export class PostExpressionsService implements ICreateService {
  constructor(
    @InjectRepository(PostExpression)
    private readonly postExpressionRepository: Repository<PostExpression>,
    private readonly postsNotificationService: PostsNotificationService,
    private readonly postsService: PostsService,
  ) {}

  async checkAnyExpressionLeft(accountID: string, postID: string) {
    const expression = await this.postExpressionRepository.findOne({
      where: { account: { id: accountID }, post: { id: postID } },
    });

    return expression;
  }

  async create(data: {
    accountID: string;
    postID: string;
    expression: PostExpressionType;
  }): Promise<PostExpression> {
    const { accountID, postID, expression } = data;

    const post = await this.postsService.getOneByID(data.postID);

    if (post?.author.id === data.accountID) {
      throw new ForbiddenException(ExpressionMessages.CANT_LEFT);
    }

    const exp = await this.checkAnyExpressionLeft(accountID, postID);

    if (exp) throw new ForbiddenException(ExpressionMessages.ALREADY_LEFT);

    const result = await this.postExpressionRepository.save({
      account: { id: accountID },
      post: { id: postID },
      expression,
    });

    return await this.postExpressionRepository.findOne({
      where: { id: result.id },
      relations: { post: { author: true }, account: true },
    });
  }

  async delete(postID: string, accountID: string): Promise<string> {
    const exp = await this.postExpressionRepository.findOne({
      where: { post: { id: postID }, account: { id: accountID } },
      relations: { post: { author: true }, account: true },
    });

    if (!exp) throw new ForbiddenException(ExpressionMessages.NOT_FOUND);

    const ID = exp.id;

    const action =
      exp.expression === PostExpressionType.LIKE
        ? NotificationActions.LIKED_POST
        : NotificationActions.DISLIKED_POST;

    this.postsNotificationService.deleteNotificationByIds(
      exp.account.id,
      exp.post.author.id,
      action,
    );

    await this.postExpressionRepository.remove(exp);

    return ID;
  }

  async getCount(
    postID: string,
  ): Promise<{ like_count: number; dislike_count: number }> {
    if (!(await this.postsService.checkByID(postID)))
      throw new BadRequestException(PostMessages.NOT_FOUND);

    const exp = await this.postExpressionRepository.find({
      where: {
        post: { id: postID },
      },
      select: { created_at: true },
    });

    const likeCount = exp.filter(
      (e) => e.expression === PostExpressionType.LIKE,
    ).length;

    const dislikeCount = exp.filter(
      (e) => e.expression === PostExpressionType.DISLIKE,
    ).length;

    return { like_count: likeCount, dislike_count: dislikeCount };
  }
}
