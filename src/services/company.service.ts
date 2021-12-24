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
   * @return ({Core.Response.Answer})
   */
  async createCompany(
    companyData: Core.Company.Schema,
  ): Promise<Core.Response.Answer> {
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

  /**
   * Архивация компании
   * @param {Core.Company.ArchiveData} archiveData
   * @return ({Core.Response.Answer})
   */
  async archiveCompany(
    archiveData: Core.Company.ArchiveData,
  ): Promise<Core.Response.Answer> {
    let result;
    const company = await this.companyModel.findOne({ _id: archiveData.id });
    if (company) {
      company.active = archiveData.active;
      await company.save();
      if (!company.active) {
        result = {
          statusCode: HttpStatus.OK,
          message: 'Компания была отправлена в архив',
        };
      } else {
        result = {
          statusCode: HttpStatus.OK,
          message: 'Компания была разархивирована',
        };
      }
    } else {
      result = {
        statusCode: HttpStatus.NOT_FOUND,
        message: 'Компания с таким id не найдена',
        errors: 'Not Found',
      };
    }
    return result;
  }
}
