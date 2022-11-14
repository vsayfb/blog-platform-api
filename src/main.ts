import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { ExpressAdapter } from '@nestjs/platform-express';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { ProcessEnv } from './lib/enums/env';
import * as express from 'express';
import * as http from 'http';
import * as https from 'https';
import * as fs from 'fs';

async function bootstrap() {
  const server = express();

  const app = await NestFactory.create(AppModule, new ExpressAdapter(server));

  app.useGlobalPipes(
    new ValidationPipe({
      forbidUnknownValues: true,
      whitelist: true,
    }),
  );

  app.setGlobalPrefix('api');

  app.enableCors({
    origin: process.env[ProcessEnv.CORS_ORIGIN],
  });

  await app.init();

  http.createServer(server).listen(process.env.PORT || 80);

  if (process.env[ProcessEnv.NODE_ENV] === 'production') {
    const options = {
      key: fs.readFileSync(process.env[ProcessEnv.SSL_KEY_PATH], 'utf8'),
      cert: fs.readFileSync(process.env[ProcessEnv.SSL_CERT_PATH], 'utf8'),
      ca: fs.readFileSync(process.env[ProcessEnv.SSL_CA_PATH], 'utf8'),
    };

    https.createServer(options, server).listen(443);
  }
  if (process.env[ProcessEnv.NODE_ENV] !== 'production') {
    const config = new DocumentBuilder()
      .setTitle('Blog Platform API')
      .setDescription('An API for your frontend blog projects.')
      .setVersion('1.0')
      .build();

    const document = SwaggerModule.createDocument(app, config);

    SwaggerModule.setup('api', app, document);
  }
}

bootstrap();
