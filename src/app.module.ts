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
import { CarsProviderSchema } from './providers/cars.provider';
import { CarsController } from './controllers/cars.controller';
import { CarsService } from './services/cars.service';
import { DealsProviderSchema } from './providers/deals.provider';
import { DealsController } from './controllers/deals.controller';
import { DealsService } from './services/deals.service';

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
      CarsProviderSchema,
      DealsProviderSchema,
    ]),
  ],
  controllers: [
    CompanyController,
    ClientsController,
    CarsController,
    DealsController,
  ],
  providers: [
    ConfigService,
    CompanyService,
    ClientService,
    CarsService,
    DealsService,
  ],
  exports: [ConfigService],
})
export class AppModule {}
