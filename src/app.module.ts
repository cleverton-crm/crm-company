import { Module } from '@nestjs/common';
import { CompanyController } from './controllers/company.controller';
import { CompanyService } from './services/company.service';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule } from '@nestjs/config';
import { JwtConfigService } from './services/jwt.services';
import { MongooseModule } from '@nestjs/mongoose';
import { MongoConfigService } from './services/mongo.service';
import { CompanyProviderSchema } from './providers/company.provider';
import { ConfigService } from './config/config.service';
import { ClientsProviderSchema } from './providers/clients.provider';
import { ClientsController } from './controllers/clients.controller';
import { ClientService } from './services/clients.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    JwtModule.registerAsync({
      useClass: JwtConfigService,
    }),
    MongooseModule.forRootAsync({
      useClass: MongoConfigService,
    }),
    MongooseModule.forFeatureAsync([
      CompanyProviderSchema,
      ClientsProviderSchema,
    ]),
  ],
  controllers: [CompanyController, ClientsController],
  providers: [ConfigService, CompanyService, ClientService],
  exports: [ConfigService],
})
export class AppModule {}
