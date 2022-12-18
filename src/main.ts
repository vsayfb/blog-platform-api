import { NestApplicationOptions, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import * as express from 'express';
import * as fs from 'fs';
import { useContainer } from 'class-validator';

function createReverseProxyServer() {
  const server = express();

  server.listen(80);

  server.get('*', (req, res) =>
    res.redirect(process.env.SECURE_HOST + req.url),
  );
}

async function bootstrap() {
  const nestAppOptions: NestApplicationOptions = {};

  if (process.env.NODE_ENV === 'production') {
    nestAppOptions.httpsOptions = {
      key: fs.readFileSync(process.env.SSL_KEY_PATH, 'utf8'),
      cert: fs.readFileSync(process.env.SSL_CERT_PATH, 'utf8'),
      ca: fs.readFileSync(process.env.SSL_CA_PATH, 'utf8'),
    };
  }

  const app = await NestFactory.create(AppModule, nestAppOptions);

  useContainer(app.select(AppModule), { fallbackOnErrors: true });

  if (process.env.NODE_ENV === 'production ') createReverseProxyServer();

  const globalValidationPipe = new ValidationPipe({
    forbidUnknownValues: true,
    whitelist: true,
  });

  app.useGlobalPipes(globalValidationPipe);

  app.setGlobalPrefix('api');

  app.enableCors({ origin: process.env.SECURE_HOST });

  const config = new DocumentBuilder().setTitle('Blog Platform API').build();

  const document = SwaggerModule.createDocument(app, config);

  SwaggerModule.setup('api', app, document);

  await app.init();

  await app.listen(process.env.NODE_ENV === 'production' ? 443 : 5555);
}

bootstrap();
