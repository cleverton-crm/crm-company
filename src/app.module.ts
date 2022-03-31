import { Module } from '@nestjs/common';
import { CompanyController } from './controllers/company.controller';
import { CompanyService } from './services/company.service';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule } from '@nestjs/config';
import { JwtConfigService } from './services/jwt.services';
import { MongooseModule } from '@nestjs/mongoose';
import { MongoConfigService } from './services/mongo.service';
import {
  CompanyProviderSchema,
  LeadCompanyProviderSchema,
  ListCompanyProviderSchema,
} from './providers/company.provider';
import { ConfigService } from './config/config.service';
import {
  ClientsListProviderSchema,
  ClientsProviderSchema,
  LeadClientsProviderSchema,
} from './providers/clients.provider';
import { ClientsController } from './controllers/clients.controller';
import { ClientService } from './services/clients.service';
import { CarsListProviderSchema, CarsProviderSchema } from './providers/cars.provider';
import { CarsController } from './controllers/cars.controller';
import { CarsService } from './services/cars.service';
import { DealsService } from './services/deals.service';
import { LeadsController } from './controllers/leads.controller';
import { LeadsService } from './services/leads.service';
import { DealsController } from './controllers/deals.controller';
import { DealsListProviderSchema, DealsProviderSchema } from './providers/deals.provider';
import { StatusDealsProviderSchema } from './providers/status-deals.provider';
import { StatusDealsService } from './services/status-deals.service';
import { StatusDealsController } from './controllers/status-deals.controller';
import { ProfileProviderSchema } from './providers/profile.provider';
import { ActivityProviderSchema } from './providers/activity.provider';
import { ActivityService } from './services/activity.service';
import { ActivityController } from './controllers/activity.controller';
import { ParkCompanyListProviderSchema, ParkCompanyProviderSchema } from './providers/park.provider';
import { ParkCompanyController } from './controllers';
import { ParkCompanyService } from './services';

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
      ClientsListProviderSchema,
      LeadClientsProviderSchema,
      CarsProviderSchema,
      CarsListProviderSchema,
      DealsProviderSchema,
      DealsListProviderSchema,
      ActivityProviderSchema,
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
    ParkCompanyController,
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
    ParkCompanyService,
    StatusDealsService,
    ActivityService,
  ],
  exports: [ConfigService],
})
export class AppModule {}
