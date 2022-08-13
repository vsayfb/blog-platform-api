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

@Controller('chats')
@UseGuards(JwtAuthGuard)
export class ChatsController {
  constructor(private readonly chatsService: ChatsService) {}

  @Post(ChatRoutes.CREATE)
  async create(
    @Account() initiator: JwtPayload,
    @Body() createChatDto: CreateChatDto,
  ) {
    return {
      data: await this.chatsService.create({
        ...createChatDto,
        initiatorID: initiator.sub,
      }),
      message: ChatMessages.CREATED,
    };
  }

  @Get(ChatRoutes.FIND_MY_CHATS)
  async findMyChats(
    @Account() me: JwtPayload,
  ): Promise<{ data: ChatViewDto[]; message: ChatMessages.ALL_FOUND }> {
    return {
      data: await this.chatsService.getAccountChats(me.sub),
      message: ChatMessages.ALL_FOUND,
    };
  }

  @Get(ChatRoutes.FIND_ONE + ':id')
  async findOne(
    @Param('id', ParseUUIDPipe) chatID: string,
    @Account() me: JwtPayload,
  ): Promise<{ data: ChatViewDto; message: string }> {
    const chat = await this.chatsService.findOne(me.sub, chatID);

    if (!chat) throw new NotFoundException(ChatMessages.NOT_FOUND);

    return { data: chat, message: ChatMessages.FOUND };
  }
}
