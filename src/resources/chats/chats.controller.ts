import {
  Controller,
  Get,
  Post,
  UseGuards,
  Param,
  NotFoundException,
  Body,
  UseInterceptors,
} from '@nestjs/common';

import { ChatsService } from './chats.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { JwtPayload } from 'src/lib/jwt.payload';
import { ChatRoutes } from './enums/chat-routes';
import { ChatMessages } from './enums/chat-messages';
import { AccountChatDto } from './response-dto/account-chat.dto';
import { CreateChatDto } from './request-dto/create-chat.dto';
import { Chat } from './entities/chat.entity';
import { CHATS_ROUTE } from 'src/lib/constants';
import { ApiTags } from '@nestjs/swagger';
import { IFindController } from 'src/lib/interfaces/find-controller.interface';
import { ICreateController } from 'src/lib/interfaces/create-controller.interface';
import { ChatWithQueryID } from './request-dto/chat-with-query';
import { Client } from 'src/auth/decorator/client.decorator';
import { CachePersonalJSON } from 'src/cache/interceptors/cache-personal-json.interceptor';
import { CacheTTL } from '@nestjs/cache-manager';

@Controller(CHATS_ROUTE)
@ApiTags(CHATS_ROUTE)
@UseGuards(JwtAuthGuard)
export class ChatsController implements ICreateController, IFindController {
  constructor(private readonly chatsService: ChatsService) {}

  @CacheTTL(30)
  @UseInterceptors(CachePersonalJSON)
  @Get(ChatRoutes.CLIENT)
  async findClientChats(
    @Client() client: JwtPayload,
  ): Promise<{ data: AccountChatDto[]; message: ChatMessages }> {
    return {
      data: await this.chatsService.getAccountChats(client.sub),
      message: ChatMessages.ALL_FOUND,
    };
  }

  @Post(ChatRoutes.CREATE + ':id')
  async create(
    @Client() initiator: JwtPayload,
    @Param() { id }: ChatWithQueryID,
    @Body() createChatDto: CreateChatDto,
  ): Promise<{ data: Chat; message: ChatMessages }> {
    return {
      data: await this.chatsService.create({
        initiatorID: initiator.sub,
        toID: id,
        firstMessage: createChatDto.first_message,
      }),
      message: ChatMessages.CREATED,
    };
  }

  @Get(ChatRoutes.CLIENT_COUNT)
  async findClientChatCount(
    @Client() client: JwtPayload,
  ): Promise<{ data: { count: number }; message: ChatMessages }> {
    return {
      data: { count: await this.chatsService.getAccountChatCount(client.sub) },
      message: ChatMessages.COUNT_FOUND,
    };
  }

  @Get(ChatRoutes.FIND_ONE + ':id')
  async findOne(
    @Param('id') chatID: string,
    @Client() client: JwtPayload,
  ): Promise<{ data: Chat; message: ChatMessages }> {
    const chat = await this.chatsService.getOne(client.sub, chatID);

    if (!chat) throw new NotFoundException(ChatMessages.NOT_FOUND);

    return { data: chat, message: ChatMessages.FOUND };
  }
}
