import { Inject, Injectable } from '@nestjs/common';
import { Channel, Connection } from 'amqplib';
import { SelectedAccountFields } from 'src/accounts/types/selected-account-fields';
import { CreatedPostDto } from 'src/posts/response-dto/created-post.dto';
import { RABBIT_CLIENT } from 'src/rabbit/constants';
import { TfaMailNotificationsConsumer } from '../consumers/tfa-mail-notifications.consumer';
import { RegisterMailsConsumer } from '../consumers/register-mails.consumer';
import { SubscriberMailsConsumer } from '../consumers/subscriber-mails.consumer';
import { QUEUES } from '../constants/queue.constant';

@Injectable()
export class MailsWorker {
  private channel: Channel;

  constructor(
    @Inject(RABBIT_CLIENT) private readonly rabbitMQ: Connection,
    private readonly subscriberMailsConsumer: SubscriberMailsConsumer,
    private readonly tfaMailNotificationsConsumer: TfaMailNotificationsConsumer,
    private readonly registerMailsConsumer: RegisterMailsConsumer,
  ) {
    this.rabbitMQ.createChannel().then((ch) => {
      this.channel = ch;

      this.subscriberMailsConsumer.consume();
      this.tfaMailNotificationsConsumer.consume();
      this.registerMailsConsumer.consume();
    });
  }

  produceSubscriberMails(data: {
    subject: string;
    post: CreatedPostDto;
  }) {
    this.channel.sendToQueue(
      QUEUES.SUBSCRIBER_MAILS_NOTIFICATIONS,
      Buffer.from(JSON.stringify(data)),
      { persistent: true },
    );
  }

  produceRegisterEmails(data: {
    to: string;
    subject: string;
    template: string;
    username: string;
    code: string;
  }) {
    this.channel.sendToQueue(
      QUEUES.REGISTER_MAIL_NOTIFICATION,
      Buffer.from(JSON.stringify(data)),
      { priority: 10 },
    );
  }

  produceTfaMails(data: { to: string; subject: string; data: string }) {
    this.channel.sendToQueue(
      QUEUES.TFA_MAIL_NOTIFICATIONS,
      Buffer.from(JSON.stringify(data)),
      { priority: 9 },
    );
  }
}
