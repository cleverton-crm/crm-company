import { Module } from '@nestjs/common';
import { ConfigService } from './config/config.service';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';

import {
  ActivityProviderSchema,
  CarsProviderSchema,
  ClientsProviderSchema,
  CompanyProviderSchema,
  DealsProviderSchema,
  LeadClientsProviderSchema,
  LeadCompanyProviderSchema,
  ListCompanyProviderSchema,
  ParkCompanyProviderSchema,
  ProfileProviderSchema,
  StatusDealsProviderSchema,
} from './providers';
import {
  ActivityController,
  CarsController,
  ClientsController,
  CompanyController,
  DealsController,
  LeadsController,
  StatusDealsController,
} from './controllers';

import {
  ActivityService,
  CarsService,
  ClientService, CompanyService,
  DealsService,
  ImportService,
  JwtConfigService,
  LeadsService,
  MongoConfigService,
  StatusDealsService,
} from './services';

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
      LeadCompanyProviderSchema,
      ListCompanyProviderSchema,
      ClientsProviderSchema,
      LeadClientsProviderSchema,
      CarsProviderSchema,
      DealsProviderSchema,
      ActivityProviderSchema,
      StatusDealsProviderSchema,
      ParkCompanyProviderSchema,
      ProfileProviderSchema,
    ]),
  ],
  controllers: [
    CompanyController,
    ClientsController,
    CarsController,
    LeadsController,
    DealsController,
    ActivityController,
    StatusDealsController,
  ],
  providers: [
    ConfigService,
    CompanyService,
    ClientService,
    CarsService,
    DealsService,
    LeadsService,
    StatusDealsService,
    ActivityService,
    ImportService,
  ],
  exports: [ConfigService],
})
export class AppModule {}
