import {
  Controller,
  Get,
  UseGuards,
  Patch,
  Query,
  Param,
  NotFoundException,
} from '@nestjs/common';
import { ChatsService } from './chats.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Account } from '../accounts/decorator/account.decorator';
import { JwtPayload } from '../lib/jwt.payload';
import { Chat } from './entities/chat.entity';
import { CanManageData } from '../lib/guards/CanManageData';
import { Data } from '../lib/decorators/request-data.decorator';
import { ChatRoutes } from './enums/chat-routes';
import { ChatMessages } from './enums/chat-messages';

@Controller('chats')
@UseGuards(JwtAuthGuard)
export class ChatsController {
  constructor(private readonly chatsService: ChatsService) {}

  @Get(ChatRoutes.FIND_MY_CHATS)
  async findMyChats(
    @Account() me: JwtPayload,
  ): Promise<{ data: Chat[]; message: ChatMessages.ALL_FOUND }> {
    return {
      data: await this.chatsService.getAccountChats(me.sub),
      message: ChatMessages.ALL_FOUND,
    };
  }

  @Get(ChatRoutes.FIND_ONE + ':id')
  async findOne(
    @Param('id') chatID: string,
    @Account() me: JwtPayload,
  ): Promise<{ data: Chat; message: string }> {
    const chat = await this.chatsService.findOne(me.sub, chatID);

    if (!chat) throw new NotFoundException();

    return { data: chat, message: ChatMessages.FOUND };
  }
}
