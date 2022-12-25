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
import { CreateMessageDto } from './request-dto/create-message.dto';
import { MessageRoutes } from './enums/message-routes';
import { JwtPayload } from '../lib/jwt.payload';
import { MessageMessages } from './enums/message-messages';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { NewMessageDto } from './response-dto/message-view.dto';
import { NewMessageInterceptor } from './interceptors/new-message.interceptor';
import { ApiTags } from '@nestjs/swagger';
import { MESSAGES_ROUTE } from 'src/lib/constants';
import { ICreateController } from 'src/lib/interfaces/create-controller.interface';
import { Client } from 'src/auth/decorator/client.decorator';

@Controller(MESSAGES_ROUTE)
@ApiTags(MESSAGES_ROUTE)
@UseGuards(JwtAuthGuard)
export class MessagesController implements ICreateController {
  constructor(private readonly messagesService: MessagesService) {}

  @UseInterceptors(NewMessageInterceptor)
  @Post(MessageRoutes.CREATE + ':chat_id')
  async create(
    @Client() sender: JwtPayload,
    @Body() createMessageDto: CreateMessageDto,
    @Param('chat_id') chatID: string,
  ): Promise<{
    data: NewMessageDto;
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
