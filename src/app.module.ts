import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { JwtModule } from '@nestjs/jwt';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';
import { ConfigService } from './config/config.service';

import {
  ActivityController,
  CarsController,
  ClientsController,
  CompanyController,
  DealsController,
  LeadsController,
  ParkCompanyController,
  StatusDealsController,
  TaskController,
} from './controllers';
import {
  ActivityService,
  CarsService,
  ClientService,
  CompanyService,
  DealsService,
  LeadsService,
  ParkCompanyService,
  StatusDealsService,
  TaskService,
  JwtConfigService,
  MongoConfigService,
} from './services';
import {
  ActivityProviderSchema,
  CarsListProviderSchema,
  CarsProviderSchema,
  ClientsListProviderSchema,
  ClientsProviderSchema,
  CompanyProviderSchema,
  DealsListProviderSchema,
  DealsProviderSchema,
  LeadClientsProviderSchema,
  LeadCompanyProviderSchema,
  ListCompanyProviderSchema,
  NewsProviderSchema,
  ParkCompanyListProviderSchema,
  ParkCompanyProviderSchema,
  ProfileProviderSchema,
  StatusDealsProviderSchema,
  ListTaskProviderSchema,
  TaskProviderSchema,
  NewsListProviderSchema,
  ListActivityProviderSchema,
} from './providers';
import { DataParserHelper } from './helpers/data-parser.helper';
import { NewsController } from './controllers/news.controller';
import { NewsService } from './services/news.service';

@Module({
  imports: [
    HttpModule.registerAsync({
      useFactory: () => ({
        timeout: 5000,
        maxRedirects: 5,
      }),
    }),
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
      LeadCompanyProviderSchema,
      ListCompanyProviderSchema,
      ClientsProviderSchema,
      ClientsListProviderSchema,
      LeadClientsProviderSchema,
      CarsProviderSchema,
      CarsListProviderSchema,
      DealsProviderSchema,
      DealsListProviderSchema,
      ActivityProviderSchema,
      TaskProviderSchema,
      ListTaskProviderSchema,
      ListActivityProviderSchema,
      NewsProviderSchema,
      NewsListProviderSchema,
      StatusDealsProviderSchema,
      ParkCompanyProviderSchema,
      ParkCompanyListProviderSchema,
      ProfileProviderSchema,
    ]),
  ],
  controllers: [
    CompanyController,
    ClientsController,
    CarsController,
    LeadsController,
    DealsController,
    TaskController,
    ParkCompanyController,
    NewsController,
    ActivityController,
    StatusDealsController,
  ],
  providers: [
    DataParserHelper,
    ConfigService,
    CompanyService,
    ClientService,
    CarsService,
    DealsService,
    LeadsService,
    TaskService,
    NewsService,
    ParkCompanyService,
    StatusDealsService,
    ActivityService,
  ],
  exports: [ConfigService],
})
export class AppModule {}
