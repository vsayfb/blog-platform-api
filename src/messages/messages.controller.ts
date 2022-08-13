import {
  Controller,
  Post,
  Body,
  Param,
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
import { MessageViewDto } from './dto/message-view.dto';

@Controller('messages')
@UseGuards(JwtAuthGuard)
export class MessagesController {
  constructor(private readonly messagesService: MessagesService) {}

  @Post(MessageRoutes.CREATE + ':chatID')
  async create(
    @Account() sender: JwtPayload,
    @Body() createMessageDto: CreateMessageDto,
    @Param('chatID', ParseUUIDPipe) chatID: string,
  ): Promise<{
    data: MessageViewDto;
    message: MessageMessages;
  }> {
    return {
      data: await this.messagesService.create(
        createMessageDto.content,
        sender.sub,
        chatID,
      ),
      message: MessageMessages.SENT,
    };
  }
}
