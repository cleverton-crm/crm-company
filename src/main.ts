import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { TcpOptions, Transport } from '@nestjs/microservices';
import { ConfigService } from './config/config.service';
import { cyan } from 'cli-color';
import { INestApplication, Logger } from '@nestjs/common';
// eslint-disable-next-line @typescript-eslint/no-var-requires
require('dotenv').config();

let app: INestApplication;
const logger = new Logger('NestApplication');

async function bootstrap() {
  const logger = new Logger('UserModule');
  const config = new ConfigService();
  const app = await NestFactory.createMicroservice(AppModule, {
    transport: Transport.TCP,
    options: {
      host: '0.0.0.0',
      port: config.get('port'),
    },
  } as TcpOptions);
  logger.log(
    cyan(`User microservices start on port TCP:${config.get('port')}`),
  );
  await app.listen();
}
bootstrap();

async function gracefulShutdown(): Promise<void> {
  if (app !== undefined) {
    await app.close();
    logger.warn('Application closed!');
  }
  process.exit(0);
}

process.once('SIGTERM', async () => {
  logger.error('SIGTERM: Graceful shutdown... ');
  await gracefulShutdown();
});

process.once('SIGINT', async () => {
  logger.error('SIGINT: Graceful shutdown... ');
  await gracefulShutdown();
});
