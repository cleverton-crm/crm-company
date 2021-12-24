import { HttpStatus, Injectable } from '@nestjs/common';
import { Connection } from 'mongoose';
import { InjectConnection } from '@nestjs/mongoose';
import { JwtService } from '@nestjs/jwt';
import { Companies, CompanyModel } from 'src/schemas/company.schema';
import { Core } from 'crm-core';

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
    this.companyModel.create({}).then((docs) => console.log(docs));
  }

  /**
   * Создание компании
   * @param {Core.Company.Schema} companyData - основные данные о компании
   */
  async createCompany(companyData: Core.Company.Schema) {
    let result;
    const company = new this.companyModel(companyData);
    try {
      await company.save();
      result = {
        statusCode: HttpStatus.OK,
        message: 'Компания успешно создана',
      };
    } catch (e) {
      result = {
        statusCode: HttpStatus.BAD_REQUEST,
        message: 'Ошибка при создании компании',
        errors: 'Bad Request',
      };
    }
    return result;
  }
}
