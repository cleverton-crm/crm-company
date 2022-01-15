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
import { DealsProviderSchema } from './providers/deals.provider';
import { DealsController } from './controllers/deals.controller';
import { DealsService } from './services/deals.service';
import { Leads } from './schemas/leads.schema';
import { LeadsProviderSchema } from './providers/leads.provider';
import { LeadsController } from './controllers/leads.controller';
import { LeadsService } from './services/leads.service';

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
      LeadsProviderSchema,
    ]),
  ],
  controllers: [
    CompanyController,
    ClientsController,
    CarsController,
    DealsController,
    LeadsController,
  ],
  providers: [
    ConfigService,
    CompanyService,
    ClientService,
    CarsService,
    DealsService,
    LeadsService,
  ],
  exports: [ConfigService],
})
export class AppModule {}
