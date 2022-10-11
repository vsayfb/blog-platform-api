import {
  Controller,
  Get,
  Post,
  UseGuards,
  Param,
  NotFoundException,
  Body,
  ParseUUIDPipe,
} from '@nestjs/common';
import { ChatsService } from './chats.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Account } from '../accounts/decorator/account.decorator';
import { JwtPayload } from '../lib/jwt.payload';
import { ChatRoutes } from './enums/chat-routes';
import { ChatMessages } from './enums/chat-messages';
import { ChatViewDto } from './dto/chat-view.dto';
import { CreateChatDto } from './dto/create-chat.dto';
import { Chat } from './entities/chat.entity';
import { CHATS_ROUTE } from 'src/lib/constants';
import { ApiTags } from '@nestjs/swagger';

@Controller(CHATS_ROUTE)
@ApiTags(CHATS_ROUTE)
@UseGuards(JwtAuthGuard)
export class ChatsController implements ICreateController, IFindController {
  constructor(private readonly chatsService: ChatsService) {}

  @Post(ChatRoutes.CREATE)
  async create(
    @Account() initiator: JwtPayload,
    @Body() createChatDto: CreateChatDto,
  ): Promise<{ data: Chat; message: ChatMessages }> {
    return {
      data: await this.chatsService.create({
        ...createChatDto,
        initiatorID: initiator.sub,
      }),
      message: ChatMessages.CREATED,
    };
  }

  @Get(ChatRoutes.FIND_CLIENT_CHATS)
  async findClientChats(
    @Account() me: JwtPayload,
  ): Promise<{ data: ChatViewDto[]; message: ChatMessages }> {
    return {
      data: await this.chatsService.getAccountChats(me.sub),
      message: ChatMessages.ALL_FOUND,
    };
  }

  @Get(ChatRoutes.FIND_ONE + ':id')
  async findOne(
    @Param('id', ParseUUIDPipe) chatID: string,
    @Account() me: JwtPayload,
  ): Promise<{ data: Chat; message: ChatMessages }> {
    const chat = await this.chatsService.getOne(me.sub, chatID);

    if (!chat) throw new NotFoundException(ChatMessages.NOT_FOUND);

    return { data: chat, message: ChatMessages.FOUND };
  }
}
