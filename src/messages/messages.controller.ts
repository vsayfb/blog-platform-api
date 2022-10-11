import {
  Controller,
  Post,
  Body,
  Param,
  ParseUUIDPipe,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { MessagesService } from './messages.service';
import { CreateMessageDto } from './dto/create-message.dto';
import { MessageRoutes } from './enums/message-routes';
import { Account } from '../accounts/decorator/account.decorator';
import { JwtPayload } from '../lib/jwt.payload';
import { MessageMessages } from './enums/message-messages';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { MessageViewDto } from './dto/message-view.dto';
import { NewMessageInterceptor } from './interceptors/new-message.interceptor';
import { ApiTags } from '@nestjs/swagger';
import { MESSAGES_ROUTE } from 'src/lib/constants';

@Controller(MESSAGES_ROUTE)
@ApiTags(MESSAGES_ROUTE)
@UseGuards(JwtAuthGuard)
export class MessagesController implements ICreateController {
  constructor(private readonly messagesService: MessagesService) {}

  @UseInterceptors(NewMessageInterceptor)
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
      data: await this.messagesService.create({
        initiatorID: sender.sub,
        chatID: chatID,
        content: createMessageDto.content,
      }),
      message: MessageMessages.SENT,
    };
  }
}
