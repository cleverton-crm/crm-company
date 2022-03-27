import { Injectable } from '@nestjs/common';
import { Companies, CompanyModel } from '../schemas/company.schema';
import { InjectConnection } from '@nestjs/mongoose';
import { Connection } from 'mongoose';

@Injectable()
export class ImportService {
  private readonly companyModel: CompanyModel<Companies>;
  constructor(@InjectConnection() private connection: Connection) {
    this.companyModel = this.connection.model('Companies') as CompanyModel<Companies>;
  }
}
