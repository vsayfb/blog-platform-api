import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  ParseUUIDPipe,
  UseGuards,
} from '@nestjs/common';
import { MessagesService } from './messages.service';
import { CreateMessageDto } from './dto/create-message.dto';
import { MessageRoutes } from './enums/message-routes';
import { Account } from '../accounts/decorator/account.decorator';
import { JwtPayload } from '../lib/jwt.payload';
import { MessageMessages } from './enums/message-messages';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Message } from './entities/message.entity';

@Controller('messages')
@UseGuards(JwtAuthGuard)
export class MessagesController {
  constructor(private readonly messagesService: MessagesService) {}

  @Post(MessageRoutes.CREATE + ':id')
  async create(
    @Account() sender: JwtPayload,
    @Param('id') toID: string,
    @Query('chatID', ParseUUIDPipe) chatID: string,
    @Body() createMessageDto: CreateMessageDto,
  ): Promise<{
    data: { chatID: string; content: string };
    message: MessageMessages;
  }> {
    return {
      data: await this.messagesService.create(
        createMessageDto,
        sender.sub,
        toID,
        chatID,
      ),
      message: MessageMessages.SENT,
    };
  }

  @Get(MessageRoutes.ME)
  async findMyMessages(
    @Account() me: JwtPayload,
  ): Promise<{ data: Promise<Message[]>; message: MessageMessages }> {
    return {
      data: this.messagesService.getAccountMessages(me.sub),
      message: MessageMessages.ALL_FOUND,
    };
  }
}
