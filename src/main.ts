import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { TcpOptions, Transport } from '@nestjs/microservices';
import { ConfigService } from './config/config.service';
import { cyan } from 'cli-color';
import { Logger } from '@nestjs/common';
// eslint-disable-next-line @typescript-eslint/no-var-requires
require('dotenv').config();

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
