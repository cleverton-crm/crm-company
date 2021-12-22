import { Injectable } from '@nestjs/common';
import { Connection } from 'mongoose';
import { InjectConnection } from '@nestjs/mongoose';
import { JwtService } from '@nestjs/jwt';
import { Companies, CompanyModel } from 'src/schemas/company.schema';

@Injectable()
export class CompanyService {
  private readonly companyModel: CompanyModel<Companies>;

  constructor(
    @InjectConnection() private connection: Connection,
    private jwtService: JwtService,
  ) {
    this.companyModel = this.connection.model(
      'Companies',
    ) as CompanyModel<Companies>;
    //this.companyModel.create({}).then((docs) => console.log(docs));
  }
}
