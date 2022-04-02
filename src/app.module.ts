import { Module } from '@nestjs/common';
import { CompanyController } from './controllers';
import { CompanyService } from './services';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule } from '@nestjs/config';
import { JwtConfigService } from './services';
import { MongooseModule } from '@nestjs/mongoose';
import { MongoConfigService } from './services';
import { CompanyProviderSchema, LeadCompanyProviderSchema, ListCompanyProviderSchema } from './providers';
import { ConfigService } from './config/config.service';
import { ClientsListProviderSchema, ClientsProviderSchema, LeadClientsProviderSchema } from './providers';
import { ClientsController } from './controllers';
import { ClientService } from './services';
import { CarsListProviderSchema, CarsProviderSchema } from './providers';
import { CarsController } from './controllers';
import { CarsService } from './services';
import { DealsService } from './services';
import { LeadsController } from './controllers';
import { LeadsService } from './services';
import { DealsController } from './controllers';
import { DealsListProviderSchema, DealsProviderSchema } from './providers';
import { StatusDealsProviderSchema } from './providers';
import { StatusDealsService } from './services';
import { StatusDealsController } from './controllers';
import { ProfileProviderSchema } from './providers';
import { ActivityProviderSchema } from './providers';
import { ActivityService } from './services';
import { ActivityController } from './controllers';
import { ParkCompanyListProviderSchema, ParkCompanyProviderSchema } from './providers';
import { ParkCompanyController } from './controllers';
import { ParkCompanyService } from './services';
import { TaskService } from './services/task.service';
import { TaskProviderSchema } from './providers/task.provider';
import { TaskController } from './controllers/task.controller';

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
      TaskProviderSchema,
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
