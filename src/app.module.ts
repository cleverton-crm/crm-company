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
} from './services';
import { JwtConfigService } from './services';
import { MongoConfigService } from './services';
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
  ParkCompanyListProviderSchema,
  ParkCompanyProviderSchema,
  ProfileProviderSchema,
  StatusDealsProviderSchema,
} from './providers';
import { ListTaskProviderSchema, TaskProviderSchema } from './providers/task.provider';
import { TaskController } from './controllers/task.controller';
import { TaskService } from './services/task.service';
import { DataParserHelper } from './helpers/data-parser.helper';

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
    ParkCompanyService,
    StatusDealsService,
    ActivityService,
  ],
  exports: [ConfigService],
})
export class AppModule {}
