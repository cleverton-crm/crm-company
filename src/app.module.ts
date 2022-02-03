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
  ListCompanyProviderSchema,
} from './providers/company.provider';
import { ConfigService } from './config/config.service';
import { ClientsProviderSchema } from './providers/clients.provider';
import { ClientsController } from './controllers/clients.controller';
import { ClientService } from './services/clients.service';
import { CarsProviderSchema } from './providers/cars.provider';
import { CarsController } from './controllers/cars.controller';
import { CarsService } from './services/cars.service';
import { DealsService } from './services/deals.service';
import { LeadsController } from './controllers/leads.controller';
import { LeadsService } from './services/leads.service';
import { DealsController } from './controllers/deals.controller';
import { DealsProviderSchema } from './providers/deals.provider';
import { StatusDealsProviderSchema } from './providers/status-deals.provider';
import { StatusDealsService } from './services/status-deals.service';
import { StatusDealsController } from './controllers/status-deals.controller';

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
      ListCompanyProviderSchema,
      ClientsProviderSchema,
      CarsProviderSchema,
      DealsProviderSchema,
      StatusDealsProviderSchema,
    ]),
  ],
  controllers: [
    CompanyController,
    ClientsController,
    CarsController,
    LeadsController,
    DealsController,
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
  ],
  exports: [ConfigService],
})
export class AppModule {}
