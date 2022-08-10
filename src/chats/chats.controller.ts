import { Controller, Get, UseGuards, Patch, Query } from '@nestjs/common';
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
  ): Promise<{ data: Chat; message: string }> {
    return {
      data: await this.chatsService.findAll(me.sub),
      message: ChatMessages.ALL_FOUND,
    };
  }

  @UseGuards(CanManageData)
  @Get(ChatRoutes.FIND_ONE + ':id')
  findOne(@Data() chat: Chat): Promise<{ data: Chat; message: string }> {
    return Promise.resolve({ data: chat, message: ChatMessages.FOUND });
  }

  @UseGuards(CanManageData)
  @Patch(ChatRoutes.LEAVE + ':id')
  async removeChatMember(@Data() chat: Chat, @Account() member: JwtPayload) {
    return {
      data: await this.chatsService.deleteChatMember(chat, member.sub),
      message: ChatMessages.UPDATE,
    };
  }
}
