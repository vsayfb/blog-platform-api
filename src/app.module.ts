import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AccountsModule } from './accounts/accounts.module';
import { AuthModule } from './auth/auth.module';
import { DatabaseModule } from './database/database.module';
import { UploadsModule } from './uploads/uploads.module';
import { MailsModule } from './mails/mails.module';
import { MailgunModule } from './apis/mailgun/mailgun.module';
import { CodesModule } from './codes/codes.module';
import { JobsModule } from './jobs/jobs.module';
import { PostsModule } from './posts/posts.module';
import { TagsModule } from './tags/tags.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    DatabaseModule,
    AccountsModule,
    AuthModule,
    UploadsModule,
    MailsModule,
    MailgunModule,
    CodesModule,
    JobsModule,
    PostsModule,
    TagsModule,
  ],
})
export class AppModule {}
